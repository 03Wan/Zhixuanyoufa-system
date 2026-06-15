import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './prisma/prisma.service';
import { DEMO_PLAN_SEEDS } from './plans/plan.constants';

type DemoUserSeed = {
  username: string;
  email: string;
  companyName: string;
  role: UserRole;
};

const PLATFORM_COMPANY = '平台方';
const DEMO_COMPANY = '智选优发演示企业';
const PROFESSIONAL_PLAN_NAME = '专业版';

const DEMO_USERS: DemoUserSeed[] = [
  { username: '企业管理员A', email: 'enterprise_admin@example.com', companyName: DEMO_COMPANY, role: UserRole.ENTERPRISE_ADMIN },
  { username: '运营人员A', email: 'operator@example.com', companyName: DEMO_COMPANY, role: UserRole.OPERATOR },
  { username: '设计人员A', email: 'designer@example.com', companyName: DEMO_COMPANY, role: UserRole.DESIGNER },
  { username: '复核人员A', email: 'reviewer@example.com', companyName: DEMO_COMPANY, role: UserRole.REVIEWER },
  { username: '管理人员A', email: 'manager@example.com', companyName: DEMO_COMPANY, role: UserRole.MANAGER },
  { username: '系统管理员A', email: 'sysadmin@example.com', companyName: PLATFORM_COMPANY, role: UserRole.SYSTEM_ADMIN },
  { username: '系统管理员', email: 'admin@zyuf.com', companyName: PLATFORM_COMPANY, role: UserRole.SYSTEM_ADMIN },
  { username: '系统管理员', email: 'admin@example.com', companyName: PLATFORM_COMPANY, role: UserRole.SYSTEM_ADMIN },
];

@Injectable()
export class BootstrapDataService {
  private readonly logger = new Logger(BootstrapDataService.name);
  private initPromise: Promise<void> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  isDemoEmail(email: string) {
    return DEMO_USERS.some((item) => item.email === email);
  }

  ensureReady() {
    if (!this.initPromise) {
      this.initPromise = this.bootstrap().catch((error) => {
        this.initPromise = null;
        throw error;
      });
    }
    return this.initPromise;
  }

  private async bootstrap() {
    const passwordHash = await bcrypt.hash('123456', 10);

    for (const plan of DEMO_PLAN_SEEDS) {
      await this.prisma.plan.upsert({
        where: { name: plan.name },
        create: {
          name: plan.name,
          customerType: plan.customerType,
          priceText: plan.priceText,
          billingCycle: plan.billingCycle,
          quota: plan.quota,
          supportedMarkets: plan.supportedMarkets,
          canExportReport: plan.canExportReport,
          canBatchDetect: plan.canBatchDetect,
          canUseApi: plan.canUseApi,
          canPrivateDeploy: plan.canPrivateDeploy,
          canUseCustomRules: plan.canUseCustomRules,
          canUseCustomReportTemplate: plan.canUseCustomReportTemplate,
          features: { list: plan.features, cta: plan.cta },
          sortOrder: plan.sortOrder,
          isActive: true,
        },
        update: {
          customerType: plan.customerType,
          priceText: plan.priceText,
          billingCycle: plan.billingCycle,
          quota: plan.quota,
          supportedMarkets: plan.supportedMarkets,
          canExportReport: plan.canExportReport,
          canBatchDetect: plan.canBatchDetect,
          canUseApi: plan.canUseApi,
          canPrivateDeploy: plan.canPrivateDeploy,
          canUseCustomRules: plan.canUseCustomRules,
          canUseCustomReportTemplate: plan.canUseCustomReportTemplate,
          features: { list: plan.features, cta: plan.cta },
          sortOrder: plan.sortOrder,
          isActive: true,
        },
      });
    }

    for (const seed of DEMO_USERS) {
      await this.prisma.user.upsert({
        where: { email: seed.email },
        create: {
          username: seed.username,
          email: seed.email,
          companyName: seed.companyName,
          passwordHash,
          role: seed.role,
        },
        update: {
          username: seed.username,
          companyName: seed.companyName,
          passwordHash,
          role: seed.role,
        },
      });
    }

    const companies = [...new Set(DEMO_USERS.map((item) => item.companyName).filter((name) => name !== PLATFORM_COMPANY))];
    for (const companyName of companies) {
      await this.prisma.company.upsert({
        where: { name: companyName },
        create: {
          name: companyName,
          industryType: '跨境电商',
          planType: PROFESSIONAL_PLAN_NAME,
          serviceStatus: '正常',
        },
        update: {
          industryType: '跨境电商',
          planType: PROFESSIONAL_PLAN_NAME,
          serviceStatus: '正常',
        },
      });
    }

    const professionalPlan = await this.prisma.plan.findUnique({ where: { name: PROFESSIONAL_PLAN_NAME } });
    if (professionalPlan) {
      for (const companyName of companies) {
        const exists = await this.prisma.subscription.findFirst({
          where: { companyName, status: 'ACTIVE' },
        });
        if (exists) continue;

        const admin = await this.prisma.user.findFirst({
          where: { companyName, role: UserRole.ENTERPRISE_ADMIN },
        });

        await this.prisma.subscription.create({
          data: {
            userId: admin?.id || null,
            companyName,
            planId: professionalPlan.id,
            status: 'ACTIVE',
            startAt: new Date(),
            endAt: null,
            quotaTotal: professionalPlan.quota ?? 0,
            quotaUsed: 0,
            quotaRemaining: professionalPlan.quota ?? 0,
          },
        });
      }
    }

    this.logger.log('Bootstrap demo users, plans, companies, and subscriptions are ready.');
  }
}
