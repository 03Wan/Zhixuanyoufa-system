import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { LogsService } from '../logs/logs.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private async buildTaskScope(userId: string, extra: Record<string, any> = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyName: true } });
    if (!user) return { id: '__never__' };
    const isSystemAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'ADMIN';
    if (isSystemAdmin) return { ...extra };
    if (user.companyName) return { ...extra, user: { companyName: user.companyName } };
    return { ...extra, userId };
  }

  async create(userId: string, dto: CreateTaskDto) {
    await this.subscriptionService.assertCanDetect(userId, 1);
    const task = await this.prisma.materialTask.create({
      data: {
        userId,
        sku: dto.sku,
        productName: dto.productName,
        category: dto.category,
        platform: dto.platform,
        market: dto.market,
        purpose: dto.purpose,
        materialContent: {
          create: {
            title: dto.title,
            sellingPoints: [dto.sellingPoints],
            detailText: dto.detailText,
            adText: dto.adText,
            imageUrls: [],
          },
        },
      },
      include: { materialContent: true },
    });

    await this.logsService.createLog({ userId, action: 'CREATE_TASK', targetType: 'MATERIAL_TASK', targetId: task.id, detail: { productName: task.productName, sku: task.sku } });
    return task;
  }

  async quotaCheck(userId: string) {
    const usage = await this.subscriptionService.getUsage(userId);
    return {
      quotaTotal: usage.quotaTotal,
      quotaUsed: usage.quotaUsed,
      quotaRemaining: usage.quotaRemaining,
      planName: usage.subscription.plan.name,
      message: usage.quotaRemaining > 0 ? '额度充足' : '当前套餐检测额度不足，请升级套餐或联系团队开通试点额度',
    };
  }

  async list(
    userId: string,
    query?: { page?: number; pageSize?: number; platform?: string; market?: string; status?: string },
  ) {
    const page = Math.max(1, Number(query?.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(query?.pageSize || 10)));
    const where: any = await this.buildTaskScope(userId);
    if (query?.platform) where.platform = query.platform;
    if (query?.market) where.market = query.market;
    if (query?.status) where.status = query.status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.materialTask.findMany({
        where,
        include: { detectionResult: true, report: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.materialTask.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async detail(userId: string, taskId: string) {
    const where = await this.buildTaskScope(userId, { id: taskId });
    const task = await this.prisma.materialTask.findFirst({ where, include: { materialContent: true, detectionResult: true, report: true, reviewTask: true, files: true } });
    if (!task) throw new NotFoundException('任务不存在');
    return task;
  }

  async updateStatus(userId: string, taskId: string, dto: UpdateTaskStatusDto) {
    await this.detail(userId, taskId);
    return this.prisma.materialTask.update({ where: { id: taskId }, data: { status: dto.status } });
  }

  async remove(userId: string, taskId: string) {
    const task = await this.detail(userId, taskId);
    await this.prisma.materialTask.delete({ where: { id: task.id } });
    await this.logsService.createLog({
      userId,
      action: 'DELETE_TASK',
      targetType: 'MATERIAL_TASK',
      targetId: task.id,
      detail: { productName: task.productName },
    });
    return { success: true, id: task.id };
  }

  async requestManualReview(userId: string, taskId: string, note?: string) {
    const task = await this.detail(userId, taskId);
    const reviewTask = await this.prisma.reviewTask.upsert({
      where: { taskId: task.id },
      update: {
        status: 'PENDING',
        comment: note || '用户提交人工复核',
      },
      create: {
        taskId: task.id,
        createdBy: userId,
        status: 'PENDING',
        comment: note || '用户提交人工复核',
      },
    });

    await this.prisma.materialTask.update({ where: { id: task.id }, data: { status: 'REVIEW_REQUIRED' } });

    await this.logsService.createLog({
      userId,
      action: 'REQUEST_MANUAL_REVIEW',
      targetType: 'MATERIAL_TASK',
      targetId: task.id,
      detail: { note: note || '用户提交人工复核', reviewId: reviewTask.id },
    });
    return { taskId: task.id, reviewRequested: true, note: note || '已提交人工复核', reviewId: reviewTask.id };
  }
}

