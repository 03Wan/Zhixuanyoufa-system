import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private async buildTaskScope(userId: string, extra: Record<string, any> = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyId: true } });
    if (!user) return { id: '__never__' };
    const isSystemAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'ADMIN';
    if (isSystemAdmin) return { ...extra };
    if (user.companyId) return { ...extra, companyId: user.companyId };
    return { ...extra, userId };
  }

  private async safeCount(promise: Promise<number>) {
    try {
      return await promise;
    } catch {
      return 0;
    }
  }

  async getDashboard(userId: string) {
    const taskScope = await this.buildTaskScope(userId);
    const reviewScope = await this.buildTaskScope(userId);
    const [todayTaskCount, pendingReviewCount, highRiskCount, reportCount] = await Promise.all([
      this.safeCount(this.prisma.materialTask.count({ where: taskScope })),
      this.safeCount(this.prisma.reviewTask.count({ where: { task: reviewScope, status: 'PENDING' } })),
      this.safeCount(this.prisma.detectionResult.count({ where: { task: { is: taskScope }, riskLevel: { in: ['HIGH', 'CRITICAL'] } } })),
      this.safeCount(this.prisma.report.count({ where: { task: { is: taskScope } } })),
    ]);

    const highRiskTasksResult = await (async (): Promise<Array<{
      id: string;
      productName: string;
      platform: string;
      market: string;
      detectionResult: { riskLevel: string; decision: string } | null;
    }>> => {
      try {
        return await this.prisma.materialTask.findMany({
          where: { ...taskScope, detectionResult: { is: { riskLevel: { in: ['HIGH', 'CRITICAL'] } } } },
          include: { detectionResult: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        });
      } catch {
        return [];
      }
    })();

    return {
      metrics: {
        todayTaskCount,
        pendingReviewCount,
        highRiskCount,
        reportCount,
      },
      highRiskTasks: highRiskTasksResult.map((task) => ({
        id: task.id,
        productName: task.productName,
        platform: task.platform,
        market: task.market,
        riskLevel: task.detectionResult?.riskLevel ?? 'HIGH',
        decision: task.detectionResult?.decision ?? 'HOLD',
      })),
      enhanced: await this.getEnhancedStats(userId),
    };
  }

  private async getEnhancedStats(userId: string) {
    const taskScope = await this.buildTaskScope(userId);
    const rows = await this.prisma.materialTask.findMany({
      where: taskScope,
      include: { detectionResult: true, report: true, reviewTask: true, user: true },
    });

    const byPlatform: Record<string, number> = {};
    const byMarket: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byRisk: Record<string, number> = {};
    const byPlan: Record<string, number> = {};
    for (const row of rows) {
      byPlatform[row.platform] = (byPlatform[row.platform] || 0) + 1;
      byMarket[row.market] = (byMarket[row.market] || 0) + 1;
      byCategory[row.category] = (byCategory[row.category] || 0) + 1;
      const risk = row.detectionResult?.riskLevel || 'UNKNOWN';
      byRisk[risk] = (byRisk[risk] || 0) + 1;
      const plan = row.user?.companyName || '未知企业';
      byPlan[plan] = (byPlan[plan] || 0) + 1;
    }

    const taskScopeAny = taskScope as any;
    const [reportCount, reviewCount, highRiskCount, usageCount, batchCount] = await Promise.all([
      this.prisma.report.count({ where: { task: taskScope } }),
      this.prisma.reviewTask.count({ where: { task: taskScope } }),
      this.prisma.detectionResult.count({ where: { task: { is: taskScope }, riskLevel: { in: ['HIGH', 'CRITICAL'] } } }),
      this.prisma.usageRecord.count({ where: { user: taskScopeAny.user || undefined } as any }).catch(() => 0),
      this.prisma.batchTask.count({}).catch(() => 0),
    ]);

    return {
      byPlan,
      byPlatform,
      byMarket,
      byCategory,
      byRisk,
      reportCount,
      reviewCount,
      highRiskCount,
      usageCount,
      batchCount,
      suggestionAdoptionRate: null,
      notice: '企业服务统计，建议采纳率来自已完成任务。',
    };
  }
}
