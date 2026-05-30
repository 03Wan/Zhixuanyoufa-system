import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  private async buildTaskScope(userId: string, extra: Record<string, any> = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyName: true } });
    if (!user) return { id: '__never__' };
    const isSystemAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'ADMIN';
    if (isSystemAdmin) return { ...extra };
    if (user.companyName) return { ...extra, user: { companyName: user.companyName } };
    return { ...extra, userId };
  }

  async addMaterial(userId: string, taskId: string, dto: CreateMaterialDto) {
    const where = await this.buildTaskScope(userId, { id: taskId });
    const task = await this.prisma.materialTask.findFirst({ where, include: { materialContent: true } });
    if (!task) throw new NotFoundException('任务不存在');

    return this.prisma.materialContent.upsert({
      where: { taskId },
      update: {
        title: dto.title ?? task.materialContent?.title ?? undefined,
        sellingPoints: dto.sellingPoints ? [dto.sellingPoints] : task.materialContent?.sellingPoints ?? undefined,
        detailText: dto.detailText ?? task.materialContent?.detailText ?? undefined,
        adText: dto.adText ?? task.materialContent?.adText ?? undefined,
        imageUrls: dto.imageUrls ?? (task.materialContent?.imageUrls as string[] | null) ?? [],
      },
      create: {
        taskId,
        title: dto.title,
        sellingPoints: dto.sellingPoints ? [dto.sellingPoints] : [],
        detailText: dto.detailText,
        adText: dto.adText,
        imageUrls: dto.imageUrls ?? [],
      },
    });
  }

  async listMaterials(userId: string, taskId: string) {
    const where = await this.buildTaskScope(userId, { id: taskId });
    const task = await this.prisma.materialTask.findFirst({ where, include: { materialContent: true } });
    if (!task) throw new NotFoundException('任务不存在');
    return task.materialContent;
  }
}
