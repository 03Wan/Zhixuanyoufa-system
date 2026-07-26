import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class PublicationOutcomesService {
  constructor(private readonly prisma: PrismaService, private readonly logs: LogsService) {}
  private async task(userId: string, taskId: string) {
    const me = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyId: true } });
    const where: any = { id: taskId };
    if (me?.role !== 'SYSTEM_ADMIN' && me?.role !== 'ADMIN') Object.assign(where, me?.companyId ? { companyId: me.companyId } : { userId });
    const task = await this.prisma.materialTask.findFirst({ where });
    if (!task) throw new NotFoundException('发布任务不存在');
    return task;
  }
  async get(userId: string, taskId: string) { await this.task(userId, taskId); return this.prisma.publicationOutcome.findUnique({ where: { taskId } }); }
  async save(userId: string, taskId: string, body: any) {
    await this.task(userId, taskId);
    const outcome = await this.prisma.publicationOutcome.upsert({ where: { taskId }, create: { taskId, recordedById: userId, status: body.status || 'PUBLISHED', publishedAt: body.publishedAt ? new Date(body.publishedAt) : null, listingId: body.listingId || null, firstPass: typeof body.firstPass === 'boolean' ? body.firstPass : null, rejectionReason: body.rejectionReason || null, note: body.note || null }, update: { status: body.status || 'PUBLISHED', publishedAt: body.publishedAt ? new Date(body.publishedAt) : null, listingId: body.listingId || null, firstPass: typeof body.firstPass === 'boolean' ? body.firstPass : null, rejectionReason: body.rejectionReason || null, note: body.note || null, recordedById: userId } });
    await this.logs.createLog({ userId, action: 'SAVE_PUBLICATION_OUTCOME', targetType: 'MATERIAL_TASK', targetId: taskId, detail: { status: outcome.status, firstPass: outcome.firstPass } });
    return outcome;
  }
}
