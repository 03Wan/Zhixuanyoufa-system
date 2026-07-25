import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { NotificationsService } from '../notifications/notifications.service';

type ApplicationInput = {
  type?: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  note?: string;
};

@Injectable()
export class CommercialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private normalizeEmail(value?: string) {
    return value?.trim().toLowerCase() || '';
  }

  private async currentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyName: true, companyId: true, email: true, username: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async applyPublic(body: ApplicationInput) {
    const companyName = body.companyName?.trim();
    const contactName = body.contactName?.trim();
    const email = this.normalizeEmail(body.email);
    const phone = body.phone?.trim() || null;
    const note = body.note?.trim() || null;

    if (!companyName || !contactName || !email) {
      throw new BadRequestException('请填写企业名称、联系人和邮箱');
    }

    const recent = await this.prisma.commercialApplication.findFirst({
      where: {
        email,
        companyName,
        status: { in: ['PENDING', 'IN_REVIEW'] },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { id: true },
    });
    if (recent) throw new ConflictException('申请已提交，请等待平台审核');

    const application = await this.prisma.commercialApplication.create({
      data: {
        type: body.type?.trim() || 'ACCOUNT_OPENING',
        companyName,
        contactName,
        contact: email,
        email,
        phone,
        note,
      },
      select: {
        id: true,
        type: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: 'SYSTEM_ADMIN' },
      select: { id: true },
    });
    await Promise.allSettled(
      admins.map((admin) =>
        Promise.all([
          this.notificationsService.create({
            userId: admin.id,
            type: 'COMMERCIAL_APPLY',
            title: '收到新的企业账号申请',
            content: `${companyName}（${contactName}，${email}）提交了企业账号申请。`,
            resourceType: 'COMMERCIAL',
            resourceId: application.id,
          }),
          this.logsService.createLog({
            userId: admin.id,
            action: 'COMMERCIAL_APPLY',
            targetType: 'COMMERCIAL',
            targetId: application.id,
            detail: { targetName: companyName, type: application.type, contactName, email, status: application.status },
            result: '待审核',
          }),
        ]),
      ),
    );

    return {
      submitted: true,
      application,
      notifiedAdminCount: admins.length,
      message: '申请已提交，平台将在审核后联系开通账号',
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
      throw new ForbiddenException('仅平台管理员可以审核企业申请');
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
