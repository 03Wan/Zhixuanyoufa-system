import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFileRecord(userId: string, payload: {
    taskId?: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    storageProvider: string;
    storagePath: string;
    url: string;
  }) {
    if (payload.taskId) {
      const task = await this.prisma.materialTask.findUnique({ where: { id: payload.taskId }, select: { id: true } });
      if (!task) throw new NotFoundException('关联任务不存在');
    }

    return this.prisma.fileAsset.create({
      data: {
        userId,
        taskId: payload.taskId,
        originalName: payload.originalName,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        size: payload.size,
        storageProvider: payload.storageProvider,
        storagePath: payload.storagePath,
        url: payload.url,
      },
    });
  }

  async list(userId: string, taskId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyName: true } });
    if (!user) return [];

    const isAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'ADMIN';
    const where: any = {};
    if (!isAdmin) {
      where.user = user.companyName ? { companyName: user.companyName } : { id: userId };
    }
    if (taskId) where.taskId = taskId;

    return this.prisma.fileAsset.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
}
