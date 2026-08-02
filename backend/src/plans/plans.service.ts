import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_ADD_ONS, SERVICE_NOTICE, PLAN_SEEDS } from './plan.constants';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeeded() {
    const count = await this.prisma.plan.count();
    if (count > 0) return;

    await this.prisma.plan.createMany({
      data: PLAN_SEEDS.map((item) => ({
        name: item.name,
        customerType: item.customerType,
        priceText: item.priceText,
        billingCycle: item.billingCycle,
        monthlyPrice: item.monthlyPrice,
        annualPrice: item.annualPrice,
        launchMonthlyPrice: item.launchMonthlyPrice,
        launchAnnualPrice: item.launchAnnualPrice,
        includedSeats: item.includedSeats,
        modelCredits: item.modelCredits,
        apiQuota: item.apiQuota,
        launchLockMonths: item.launchLockMonths,
        launchEligibilityText: item.launchEligibilityText,
        isContactSales: item.isContactSales,
        quota: item.quota,
        supportedMarkets: item.supportedMarkets,
        canExportReport: item.canExportReport,
        canBatchDetect: item.canBatchDetect,
        canUseApi: item.canUseApi,
        canPrivateDeploy: item.canPrivateDeploy,
        canUseCustomRules: item.canUseCustomRules,
        canUseCustomReportTemplate: item.canUseCustomReportTemplate,
        features: { list: item.features, cta: item.cta },
        sortOrder: item.sortOrder,
        isActive: true,
      })),
    });
  }

  async list() {
    await this.ensureSeeded();
    const plans = await this.prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return {
      notice: SERVICE_NOTICE,
      plans,
      addOns: PLAN_ADD_ONS,
    };
  }
}
