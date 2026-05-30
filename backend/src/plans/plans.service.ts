import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEMO_NOTICE, DEMO_PLAN_SEEDS } from './plan.constants';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeeded() {
    const count = await this.prisma.plan.count();
    if (count > 0) return;

    await this.prisma.plan.createMany({
      data: DEMO_PLAN_SEEDS.map((item) => ({
        name: item.name,
        customerType: item.customerType,
        priceText: item.priceText,
        billingCycle: item.billingCycle,
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
      notice: DEMO_NOTICE,
      plans,
    };
  }
}
