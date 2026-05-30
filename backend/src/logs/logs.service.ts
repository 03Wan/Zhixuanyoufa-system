import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  createLog(input: {
    userId: string;
    action: string;
    targetType: string;
    targetId: string;
    taskId?: string;
    metadata?: Record<string, unknown>;
    detail?: Record<string, unknown>;
    result?: string;
    ip?: string;
  }) {
    const detail = input.detail ?? input.metadata ?? (input.taskId ? { taskId: input.taskId } : undefined);
    return this.prisma.operationLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        detail: (detail ?? null) as any,
        result: input.result,
        ip: input.ip,
      },
    });
  }

  async listLogs(query?: { page?: number; pageSize?: number; action?: string; targetType?: string }) {
    const page = Math.max(1, Number(query?.page || 1));
    const pageSize = Math.min(200, Math.max(1, Number(query?.pageSize || 20)));
    const where: any = {};
    if (query?.action) where.action = query.action;
    if (query?.targetType) where.targetType = query.targetType;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.operationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { username: true, role: true, email: true } } },
      }),
      this.prisma.operationLog.count({ where }),
    ]);

    const mapped = items.map((item) => ({
      ...item,
      operator: item.user?.username || item.user?.email || '-',
      role: item.user?.role || '-',
    }));

    return { items: mapped, total, page, pageSize };
  }
}

