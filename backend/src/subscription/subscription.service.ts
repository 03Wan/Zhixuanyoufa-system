import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { SelectSubscriptionDto } from './dto/select-subscription.dto';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService, private readonly plansService: PlansService) {}

  private async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  private isUnlimitedRole(role?: string) {
    return role === 'SYSTEM_ADMIN' || role === 'ADMIN';
  }

  async ensureActiveSubscription(userId: string) {
    await this.plansService.list();
    const user = await this.getUser(userId);
    const companyName = user.companyName || '个人账号';
    let sub = await this.prisma.subscription.findFirst({
      where: { companyName, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (sub) return sub;

    // Use the current launch default instead of a retired legacy package name.
    const defaultPlan = await this.prisma.plan.findFirst({ where: { name: 'Growth', isActive: true } });
    if (!defaultPlan) throw new NotFoundException('默认套餐不存在');

    sub = await this.prisma.subscription.create({
      data: {
        userId,
        companyName,
        planId: defaultPlan.id,
        status: 'ACTIVE',
        startAt: new Date(),
        endAt: null,
        quotaTotal: defaultPlan.quota ?? 0,
        quotaUsed: 0,
        quotaRemaining: defaultPlan.quota ?? 0,
      },
      include: { plan: true },
    });

    return sub;
  }

  async getMe(userId: string) {
    const user = await this.getUser(userId);
    const sub = await this.ensureActiveSubscription(userId);

    return {
      notice: '当前套餐状态来自真实数据库记录。增购、升级和接口服务将以申请审批结果为准。',
      companyName: sub.companyName,
      isUnlimited: this.isUnlimitedRole(user.role),
      subscription: sub,
      suggestion: this.getUpgradeSuggestion(sub.plan.name),
    };
  }

  async getUsage(userId: string) {
    const me = await this.getMe(userId);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyUsed = await this.prisma.usageRecord.count({
      where: {
        user: { companyName: me.companyName },
        usageType: 'DETECT',
        createdAt: { gte: monthStart },
      },
    });

    return {
      ...me,
      monthlyUsed,
      quotaTotal: me.subscription.quotaTotal,
      quotaUsed: me.subscription.quotaUsed,
      quotaRemaining: me.subscription.quotaRemaining,
      privileges: this.mapPrivileges(me.subscription.plan),
    };
  }

  async select(userId: string, dto: SelectSubscriptionDto) {
    const user = await this.getUser(userId);
    const plan = await this.prisma.plan.findFirst({ where: { name: dto.planName, isActive: true } });
    if (!plan) throw new NotFoundException('套餐不存在');

    const companyName = dto.companyName || user.companyName || '个人账号';

    await this.prisma.subscription.updateMany({
      where: { companyName, status: 'ACTIVE' },
      data: { status: 'INACTIVE' },
    });

    const sub = await this.prisma.subscription.create({
      data: {
        userId,
        companyName,
        planId: plan.id,
        status: 'ACTIVE',
        startAt: new Date(),
        endAt: null,
        quotaTotal: plan.quota ?? 0,
        quotaUsed: 0,
        quotaRemaining: plan.quota ?? 0,
      },
      include: { plan: true },
    });

    return { notice: `套餐已更新为 ${plan.name}，后续额度将按当前记录执行。`, subscription: sub };
  }

  async upgrade(userId: string, dto: UpgradeSubscriptionDto) {
    return this.select(userId, { planName: dto.planName });
  }

  async assertCanDetect(userId: string, amount = 1) {
    const user = await this.getUser(userId);
    const me = await this.getUsage(userId);
    if (this.isUnlimitedRole(user.role)) return { ok: true, bypass: true, me };

    if (me.quotaRemaining < amount) {
      throw new ForbiddenException('当前套餐检测额度不足，请升级套餐或联系团队开通额度');
    }

    return { ok: true, bypass: false, me };
  }

  async consumeDetectQuota(userId: string, taskId: string, amount = 1, description = '检测额度消耗') {
    const user = await this.getUser(userId);
    if (this.isUnlimitedRole(user.role)) return;

    const active = await this.ensureActiveSubscription(userId);
    if (active.quotaRemaining < amount) {
      throw new ForbiddenException('当前套餐检测额度不足，请升级套餐或联系团队开通额度');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: active.id },
        data: {
          quotaUsed: { increment: amount },
          quotaRemaining: { decrement: amount },
        },
      });

      await tx.usageRecord.create({
        data: {
          userId,
          taskId,
          subscriptionId: active.id,
          usageType: 'DETECT',
          amount,
          description,
        },
      });
    });
  }

  async assertCanExport(userId: string) {
    const user = await this.getUser(userId);
    if (this.isUnlimitedRole(user.role)) return { ok: true };

    const sub = await this.ensureActiveSubscription(userId);
    if (!sub.plan.canExportReport) {
      throw new ForbiddenException('当前套餐仅支持在线查看报告，导出请升级套餐');
    }

    return { ok: true };
  }

  private mapPrivileges(plan: any) {
    return {
      canExportReport: plan.canExportReport,
      canBatchDetect: plan.canBatchDetect,
      canUseApi: plan.canUseApi,
      canPrivateDeploy: plan.canPrivateDeploy,
      canUseCustomRules: plan.canUseCustomRules,
      canUseCustomReportTemplate: plan.canUseCustomReportTemplate,
    };
  }

  private getUpgradeSuggestion(planName: string) {
    if (planName.includes('免费体验') || planName.includes('Starter')) {
      return '升级 Growth 可获得批量检测、人工复核和完整报告导出。';
    }
    if (planName.includes('Growth')) {
      return '升级 Pro 可获得多店铺协作、审批流和自定义规则。';
    }
    return '如需API接口或私有化部署，可申请API接口版或定制版服务。';
  }
}
