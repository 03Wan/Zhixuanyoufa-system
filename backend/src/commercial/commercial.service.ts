import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class CommercialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  private async currentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyName: true, email: true, username: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async apply(
    userId: string,
    body: { type?: string; contact?: string; companyName?: string; note?: string },
  ) {
    const me = await this.currentUser(userId);
    const application = await this.prisma.commercialApplication.create({
      data: {
        userId,
        type: body.type?.trim() || 'GENERAL',
        contact: body.contact?.trim() || me.email,
        companyName: body.companyName?.trim() || me.companyName || null,
        note: body.note?.trim() || null,
      },
    });

    await this.logsService.createLog({
      userId,
      action: 'COMMERCIAL_APPLY',
      targetType: 'COMMERCIAL',
      targetId: application.id,
      detail: {
        type: application.type,
        companyName: application.companyName,
        contact: application.contact,
      },
    });

    return {
      submitted: true,
      application,
      message: '申请已提交，管理员审核后会开通对应试点能力。',
    };
  }

  async list(userId: string) {
    const me = await this.currentUser(userId);
    const where =
      me.role === 'SYSTEM_ADMIN' || me.role === 'ADMIN'
        ? {}
        : me.companyName
          ? { OR: [{ userId }, { companyName: me.companyName }] }
          : { userId };
    return this.prisma.commercialApplication.findMany({
      where,
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(userId: string, applicationId: string, body: { status: string; reviewNote?: string }) {
    const me = await this.currentUser(userId);
    if (me.role !== 'SYSTEM_ADMIN' && me.role !== 'ADMIN') {
      throw new ForbiddenException('仅系统管理员可以审批商业申请');
    }

    const item = await this.prisma.commercialApplication.findUnique({ where: { id: applicationId } });
    if (!item) throw new NotFoundException('申请不存在');

    const updated = await this.prisma.commercialApplication.update({
      where: { id: applicationId },
      data: {
        status: body.status,
        reviewNote: body.reviewNote?.trim() || null,
      },
    });

    await this.logsService.createLog({
      userId,
      action: 'COMMERCIAL_APPROVE',
      targetType: 'COMMERCIAL',
      targetId: applicationId,
      detail: { status: body.status, reviewNote: body.reviewNote || '' },
    });

    return updated;
  }
}
