import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaterialVersionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async scopedTask(userId: string, taskId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyName: true } });
    const isAdmin = user?.role === 'SYSTEM_ADMIN' || user?.role === 'ADMIN';
    const where: any = { id: taskId };
    if (!isAdmin) where.user = user?.companyName ? { companyName: user.companyName } : { id: userId };
    const task = await this.prisma.materialTask.findFirst({ where, include: { materialContent: true, detectionResult: true } });
    if (!task) throw new NotFoundException('任务不存在');
    return task;
  }

  async list(userId: string, taskId: string) {
    await this.scopedTask(userId, taskId);
    return this.prisma.materialVersion.findMany({ where: { taskId }, orderBy: { versionNo: 'desc' } });
  }

  async snapshot(userId: string, taskId: string, body: { title?: string; sellingPoints?: string; detailText?: string; adText?: string; imageUrls?: string[] }) {
    const task = await this.scopedTask(userId, taskId);
    const last = await this.prisma.materialVersion.findFirst({ where: { taskId }, orderBy: { versionNo: 'desc' } });
    const versionNo = (last?.versionNo || 0) + 1;
    const created = await this.prisma.materialVersion.create({
      data: {
        taskId,
        versionNo,
        title: body.title ?? task.materialContent?.title ?? null,
        sellingPoints: body.sellingPoints ? [body.sellingPoints] as any : task.materialContent?.sellingPoints as any,
        detailText: body.detailText ?? task.materialContent?.detailText ?? null,
        adText: body.adText ?? task.materialContent?.adText ?? null,
        imageUrls: body.imageUrls ? body.imageUrls as any : task.materialContent?.imageUrls as any,
        scoreSnapshot: task.detectionResult ? { totalScore: task.detectionResult.totalScore } as any : null,
        riskSnapshot: task.detectionResult ? { riskLevel: task.detectionResult.riskLevel, decision: task.detectionResult.decision } as any : null,
        createdBy: userId,
      },
    });
    return created;
  }
}
