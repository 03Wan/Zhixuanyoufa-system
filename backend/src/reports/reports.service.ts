import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { SubscriptionService } from '../subscription/subscription.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private makeReportNo() {
    return `RPT-${Date.now()}`;
  }

  private async buildTaskScope(userId: string, extra: Record<string, any> = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyName: true } });
    if (!user) return { id: '__never__' };
    const isSystemAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'ADMIN';
    if (isSystemAdmin) return { ...extra };
    if (user.companyName) return { ...extra, user: { companyName: user.companyName } };
    return { ...extra, userId };
  }

  async generate(userId: string, taskId: string) {
    const taskWhere = await this.buildTaskScope(userId, { id: taskId });
    const task = await this.prisma.materialTask.findFirst({ where: taskWhere, include: { detectionResult: true, materialContent: true, reviewTask: true } });
    if (!task || !task.detectionResult) throw new NotFoundException('任务或检测结果不存在');

    const summary = `任务《${task.productName}》综合得分 ${task.detectionResult.totalScore}，风险等级 ${task.detectionResult.riskLevel}。`;
    const report = await this.prisma.report.upsert({
      where: { taskId },
      update: {
        summary,
        title: `${task.productName} 审核报告`,
        content: { task, result: task.detectionResult, review: task.reviewTask, generatedAt: new Date().toISOString() } as any,
      },
      create: {
        taskId,
        reportNo: this.makeReportNo(),
        title: `${task.productName} 审核报告`,
        summary,
        content: { task, result: task.detectionResult, review: task.reviewTask, generatedAt: new Date().toISOString() } as any,
      },
    });

    await this.logsService.createLog({ userId, taskId, action: 'GENERATE_REPORT', targetType: 'REPORT', targetId: report.id, detail: { reportNo: report.reportNo } });
    return report;
  }

  async list(
    userId: string,
    query?: { page?: number; pageSize?: number; platform?: string; market?: string; riskLevel?: string; keyword?: string },
  ) {
    const page = Math.max(1, Number(query?.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(query?.pageSize || 10)));

    const taskScope = await this.buildTaskScope(userId);
    const where: any = { task: taskScope };

    if (query?.platform) where.task.platform = query.platform;
    if (query?.market) where.task.market = query.market;
    if (query?.keyword) {
      where.OR = [{ title: { contains: query.keyword } }, { reportNo: { contains: query.keyword } }];
    }

    if (query?.riskLevel) {
      where.task.detectionResult = {
        riskLevel: String(query.riskLevel).toUpperCase(),
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where,
        include: {
          task: { include: { materialContent: true, reviewTask: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.report.count({ where }),
    ]);

    const mapped = items.map((item) => {
      const content: any = item.content || {};
      const result: any = content.result || {};
      const images = Array.isArray(item.task?.materialContent?.imageUrls) ? item.task?.materialContent?.imageUrls : [];
      return {
        ...item,
        result,
        reportStatus: '已生成',
        hasManualReview: !!item.task?.reviewTask,
        materialCount: images.length,
      };
    });

    return { items: mapped, total, page, pageSize };
  }

  async detail(userId: string, reportId: string) {
    const taskScope = await this.buildTaskScope(userId);
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, task: taskScope },
      include: { task: { include: { materialContent: true, reviewTask: true, detectionResult: true, files: true } } },
    });
    if (!report) throw new NotFoundException('报告不存在');

    const content: any = report.content || {};
    const result: any = content.result || report.task?.detectionResult || {};
    const imageUrls = Array.isArray(report.task?.materialContent?.imageUrls) ? report.task?.materialContent?.imageUrls : [];

    return {
      ...report,
      result,
      reportStatus: '已生成',
      hasManualReview: !!report.task?.reviewTask,
      materialCount: imageUrls.length,
      fileAssets: report.task?.files || [],
    };
  }

  async remove(userId: string, reportId: string) {
    const report = await this.detail(userId, reportId);
    await this.prisma.report.delete({ where: { id: report.id } });
    await this.logsService.createLog({
      userId,
      action: 'DELETE_REPORT',
      targetType: 'REPORT',
      targetId: report.id,
      detail: { reportNo: report.reportNo, taskId: report.taskId },
    });
    return { success: true, id: report.id };
  }

  async export(userId: string, taskId: string, format: 'pdf' | 'docx' | 'json') {
    const taskScope = await this.buildTaskScope(userId, { id: taskId });
    const report = await this.prisma.report.findFirst({ where: { task: taskScope }, include: { task: { include: { materialContent: true, detectionResult: true, reviewTask: true } } } });
    if (!report) throw new NotFoundException('报告不存在');

    const me = await this.subscriptionService.getUsage(userId);
    const planName = me.subscription.plan.name;
    if (planName.includes('体验包')) {
      throw new ForbiddenException('当前套餐仅支持在线查看报告，导出请升级套餐');
    }
    await this.subscriptionService.assertCanExport(userId);

    const result: any = (report.content as any)?.result || report.task.detectionResult || {};
    const payload = {
      reportTitle: report.title,
      reportNo: report.reportNo,
      productName: report.task.productName,
      category: report.task.category,
      platform: report.task.platform,
      market: report.task.market,
      detectTime: report.task.updatedAt,
      totalScore: result.totalScore,
      riskLevel: result.riskLevel,
      issues: result.issues || [],
      suggestions: result.suggestions || [],
      decision: result.decision,
      operationLogs: [{ action: '报告导出', at: new Date().toISOString(), operator: userId }],
      exportedAt: new Date().toISOString(),
      notice: '报告基于当前真实检测记录导出；企业模板与签章能力可在后续审批开通。',
    };

    if (format === 'json') {
      return {
        filename: `${report.reportNo}.json`,
        contentType: 'application/json; charset=utf-8',
        content: Buffer.from(JSON.stringify(payload, null, 2), 'utf-8'),
      };
    }

    const pdf = await this.buildPdf(payload);
    return {
      filename: `${report.reportNo}.pdf`,
      contentType: 'application/pdf',
      content: pdf,
    };
  }

  private buildPdf(payload: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text('智选优发审核报告', { align: 'center' });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`报告标题：${payload.reportTitle}`);
      doc.text(`报告编号：${payload.reportNo}`);
      doc.text(`商品名称：${payload.productName}`);
      doc.text(`商品品类：${payload.category}`);
      doc.text(`目标平台：${payload.platform}`);
      doc.text(`目标市场：${payload.market}`);
      doc.text(`检测时间：${new Date(payload.detectTime).toLocaleString('zh-CN')}`);
      doc.text(`综合评分：${payload.totalScore ?? '-'}`);
      doc.text(`风险等级：${payload.riskLevel ?? '-'}`);
      doc.text(`发布决策：${payload.decision ?? '-'}`);
      doc.moveDown();
      doc.fontSize(12).text('问题定位');
      (payload.issues || []).forEach((issue: any, i: number) => {
        doc.fontSize(10).text(`${i + 1}. ${issue.position || '-'} / ${issue.type || '-'} / ${issue.description || '-'}`);
      });
      doc.moveDown();
      doc.fontSize(12).text('优化建议');
      (payload.suggestions || []).forEach((s: any, i: number) => {
        doc.fontSize(10).text(`${i + 1}. ${s.suggestion || s.problem || '-'}`);
      });
      doc.moveDown();
      doc.fontSize(12).text('操作记录');
      (payload.operationLogs || []).forEach((log: any, i: number) => {
        doc.fontSize(10).text(`${i + 1}. ${log.action} / ${log.operator} / ${new Date(log.at).toLocaleString('zh-CN')}`);
      });
      doc.moveDown();
      doc.fontSize(10).text(`导出时间：${new Date(payload.exportedAt).toLocaleString('zh-CN')}`);
      doc.text(payload.notice || '');
      doc.end();
    });
  }

  async getDownloadPayload(userId: string, reportId: string) {
    const report = await this.detail(userId, reportId);
    const filename = `${report.reportNo || report.id}.json`;
    const content = JSON.stringify(
      {
        id: report.id,
        reportNo: report.reportNo,
        title: report.title,
        summary: report.summary,
        createdAt: report.createdAt,
        task: report.task,
        content: report.content,
      },
      null,
      2,
    );

    return { filename, content };
  }
}
