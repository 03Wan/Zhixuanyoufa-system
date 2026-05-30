import { Injectable, NotFoundException } from '@nestjs/common';
import { DecisionType, ReviewStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { ReviewDecisionDto } from './dto/review-decision.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService, private readonly logsService: LogsService) {}

  private async buildTaskScope(userId: string, extra: Record<string, any> = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyName: true } });
    if (!user) return { id: '__never__' };
    const isSystemAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'ADMIN';
    if (isSystemAdmin) return { ...extra };
    if (user.companyName) return { ...extra, user: { companyName: user.companyName } };
    return { ...extra, userId };
  }

  async list(
    userId: string,
    query?: { page?: number; pageSize?: number; status?: string; platform?: string; market?: string },
  ) {
    const page = Math.max(1, Number(query?.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(query?.pageSize || 10)));
    const taskScope = await this.buildTaskScope(userId);
    const where: any = { task: taskScope };
    if (query?.status) where.status = query.status;
    if (query?.platform) where.task = { ...(where.task || {}), platform: query.platform };
    if (query?.market) where.task = { ...(where.task || {}), market: query.market };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reviewTask.findMany({
        where,
        include: { task: true, reviewer: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.reviewTask.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async detail(userId: string, reviewId: string) {
    const review = await this.prisma.reviewTask.findUnique({
      where: { id: reviewId },
      include: {
        task: { include: { materialContent: true, detectionResult: true, report: true } },
        reviewer: { select: { id: true, username: true } },
      },
    });
    const detailScope = await this.buildTaskScope(userId, { id: review?.taskId || '' });
    if (!review || !(await this.prisma.materialTask.findFirst({ where: detailScope, select: { id: true } }))) {
      throw new NotFoundException('复核任务不存在');
    }
    return review;
  }

  async startReview(userId: string, reviewId: string) {
    const review = await this.detail(userId, reviewId);
    const history = Array.isArray(review.history as any) ? (review.history as any) : [];
    history.unshift({
      time: new Date().toISOString(),
      action: '开始复核',
      operator: userId,
    });
    const updated = await this.prisma.reviewTask.update({
      where: { id: reviewId },
      data: {
        status: ReviewStatus.IN_PROGRESS,
        reviewerId: userId,
        history: history as any,
      },
    });
    await this.logsService.createLog({
      userId,
      action: 'REVIEW_START',
      targetType: 'REVIEW_TASK',
      targetId: reviewId,
    });
    return { success: true, review: updated };
  }

  async submitDecision(userId: string, reviewId: string, dto: ReviewDecisionDto) {
    const review = await this.detail(userId, reviewId);

    const mapping = {
      '通过发布': { reviewStatus: ReviewStatus.APPROVED, decision: DecisionType.APPROVE, taskStatus: TaskStatus.COMPLETED },
      '退回优化': { reviewStatus: ReviewStatus.RETURNED, decision: DecisionType.OPTIMIZE_AND_REVIEW, taskStatus: TaskStatus.PENDING_DETECTION },
      '暂缓发布': { reviewStatus: ReviewStatus.HOLD, decision: DecisionType.HOLD, taskStatus: TaskStatus.HOLD },
    } as const;

    const next = mapping[dto.decision];
    const history = Array.isArray((review.history as any) ? review.history : []) ? (review.history as any) : [];
    history.unshift({
      time: new Date().toISOString(),
      action: '复核处理',
      decision: dto.decision,
      reason: dto.reason,
      comment: dto.comment || '',
      operator: userId,
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const nextReview = await tx.reviewTask.update({
        where: { id: reviewId },
        data: {
          status: next.reviewStatus,
          reviewerId: userId,
          finalDecision: next.decision,
          reason: dto.reason,
          comment: dto.comment || null,
          history: history as any,
        },
      });

      await tx.materialTask.update({ where: { id: review.taskId }, data: { status: next.taskStatus } });

      if (review.task.report) {
        const content: any = review.task.report.content || {};
        content.review = {
          status: next.reviewStatus,
          finalDecision: next.decision,
          reason: dto.reason,
          comment: dto.comment || null,
          reviewerId: userId,
          updatedAt: new Date().toISOString(),
        };
        await tx.report.update({ where: { id: review.task.report.id }, data: { content } });
      }

      return nextReview;
    });

    await this.logsService.createLog({
      userId,
      action: 'REVIEW_DECISION',
      targetType: 'REVIEW_TASK',
      targetId: reviewId,
      detail: { decision: dto.decision, reason: dto.reason },
    });

    return { success: true, review: updated };
  }
}

