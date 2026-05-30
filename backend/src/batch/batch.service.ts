import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchTaskDto } from './dto/create-batch-task.dto';
import { SubscriptionService } from '../subscription/subscription.service';
import { DetectionService } from '../detection/detection.service';

@Injectable()
export class BatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly detectionService: DetectionService,
  ) {}

  async create(userId: string, dto: CreateBatchTaskDto) {
    const usage = await this.subscriptionService.getUsage(userId);
    if (!usage.privileges?.canBatchDetect) {
      throw new ForbiddenException('当前套餐不支持批量检测，请升级至专业版及以上');
    }

    const batch = await this.prisma.batchTask.create({
      data: {
        userId,
        companyId: dto.companyId,
        name: dto.name,
        status: 'PENDING',
        totalCount: dto.items.length,
        items: {
          create: dto.items.map((item, idx) => ({ rowNo: idx + 1, payload: item as any, status: 'PENDING' })),
        },
      },
      include: { items: true },
    });

    return batch;
  }

  list(userId: string) {
    return this.prisma.batchTask.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async detail(userId: string, id: string) {
    const item = await this.prisma.batchTask.findFirst({ where: { id, userId }, include: { items: { include: { task: { include: { report: true, detectionResult: true } } } } } });
    if (!item) throw new NotFoundException('批量任务不存在');
    return item;
  }

  async run(userId: string, id: string) {
    const batch = await this.detail(userId, id);
    await this.prisma.batchTask.update({ where: { id }, data: { status: 'RUNNING' } });

    let success = 0;
    let failed = 0;

    for (const row of batch.items) {
      try {
        const p: any = row.payload || {};
        const task = await this.prisma.materialTask.create({
          data: {
            userId,
            companyId: batch.companyId || null,
            sku: p.sku || `BATCH-${Date.now()}-${row.rowNo}`,
            productName: p.productName,
            category: p.category,
            platform: p.platform,
            market: p.market,
            purpose: p.purpose,
            status: 'PENDING_DETECTION',
            materialContent: {
              create: {
                title: p.title,
                sellingPoints: [p.sellingPoints],
                detailText: p.detailText,
                adText: p.adText,
                imageUrls: [],
              },
            },
          },
        });

        await this.prisma.batchTaskItem.update({ where: { id: row.id }, data: { taskId: task.id, status: 'RUNNING' } });
        await this.detectionService.runDetection(userId, task.id);
        await this.prisma.batchTaskItem.update({ where: { id: row.id }, data: { status: 'DONE' } });
        success += 1;
      } catch (e: any) {
        failed += 1;
        await this.prisma.batchTaskItem.update({ where: { id: row.id }, data: { status: 'FAILED', errorMsg: e?.message || '检测失败' } });
      }
    }

    const status = failed > 0 ? (success > 0 ? 'PARTIAL_FAILED' : 'FAILED') : 'DONE';
    return this.prisma.batchTask.update({
      where: { id },
      data: {
        status,
        successCount: success,
        failedCount: failed,
      },
      include: { items: true },
    });
  }
}
