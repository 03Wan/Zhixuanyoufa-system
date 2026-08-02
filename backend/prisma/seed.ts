import { PrismaClient, DecisionType, RiskLevel, RuleType, TaskStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PLAN_SEEDS } from '../src/plans/plan.constants';

const prisma = new PrismaClient();

async function resetData() {
  await prisma.usageRecord.deleteMany();
  await prisma.fileAsset.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.report.deleteMany();
  await prisma.detectionResult.deleteMany();
  await prisma.materialContent.deleteMany();
  await prisma.materialTask.deleteMany();
  await prisma.operationLog.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.user.deleteMany({ where: { email: 'admin@zyuf.com' } });
}

async function seedPlansAndSubscription(adminId: string, companyName: string) {
  await prisma.plan.createMany({
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
      features: { list: item.features, cta: item.cta } as any,
      sortOrder: item.sortOrder,
      isActive: true,
    })),
  });

  const plan = await prisma.plan.findFirst({ where: { name: 'Growth' } });
  if (plan) {
    await prisma.subscription.create({
      data: {
        userId: adminId,
        companyName,
        planId: plan.id,
        status: 'ACTIVE',
        startAt: new Date(),
        quotaTotal: plan.quota ?? 1000,
        quotaUsed: 0,
        quotaRemaining: plan.quota ?? 1000,
      },
    });
  }
}

async function main() {
  await resetData();

  const passwordHash = await bcrypt.hash('123456', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@zyuf.com',
      passwordHash,
      companyName: '智选优发企业账号',
      role: UserRole.SYSTEM_ADMIN,
    },
  });

  await seedPlansAndSubscription(admin.id, admin.companyName || '智选优发企业账号');

  await prisma.rule.createMany({
    data: [
      {
        name: 'Amazon 标题不得包含夸大宣传词',
        type: RuleType.PLATFORM,
        platform: 'Amazon',
        market: '全球',
        category: '通用',
        riskLevel: RiskLevel.MEDIUM,
        keywords: ['最强', '第一', '永久', '100%有效', '绝对', '全网最低', '立刻见效'],
        suggestion: '请改为客观可验证描述，避免绝对化宣传词。',
        enabled: true,
      },
      {
        name: '中东市场避免宗教冒犯表达',
        type: RuleType.MARKET_CULTURE,
        platform: '通用',
        market: '中东',
        category: '通用',
        riskLevel: RiskLevel.HIGH,
        keywords: ['宗教玩笑', '酒精', '猪肉'],
        suggestion: '移除可能涉及宗教冒犯内容并进行本地化校审。',
        enabled: true,
      },
    ],
  });

  const task = await prisma.materialTask.create({
    data: {
      userId: admin.id,
      sku: `SKU-${Date.now()}`,
      productName: '智能香薰机',
      category: '家居电器',
      platform: 'Amazon',
      market: '中东',
      purpose: '新品上架',
      status: TaskStatus.REPORTED,
    },
  });

  await prisma.materialContent.create({
    data: {
      taskId: task.id,
      title: '智能香薰机 中东热销款',
      sellingPoints: ['轻量便携', '合规材质', '售后保障'] as unknown as object,
      detailText: '适用于中东市场，强调品质、细节与售后。',
      adText: '高品质体验，欢迎了解更多产品参数。',
      imageUrls: ['https://assets.paperhelper.fun/img/main-01.jpg', 'https://assets.paperhelper.fun/img/detail-02.jpg'] as unknown as object,
    },
  });

  await prisma.detectionResult.create({
    data: {
      taskId: task.id,
      totalScore: 74,
      completenessScore: 90,
      complianceScore: 70,
      localizationScore: 64,
      riskLevel: RiskLevel.MEDIUM,
      decision: DecisionType.OPTIMIZE_AND_REVIEW,
      issues: [{ position: 'adText', type: '市场文化适配', riskLevel: '中风险', hitContent: '酒精香型', description: '中东市场应避免酒精相关表达。' }] as unknown as object,
      suggestions: [{ target: 'adText', problem: '中东文化适配不足', suggestion: '替换为中性香型描述，避免敏感表达。' }] as unknown as object,
    },
  });

  await prisma.report.create({
    data: {
      taskId: task.id,
      reportNo: `RPT-${Date.now()}-${task.id.slice(-4)}`,
      title: '智能香薰机 审核报告',
      summary: '智能香薰机检测完成，综合评分 74，建议优化后发布。',
      content: {
        task: {
          productName: '智能香薰机',
          category: '家居电器',
          platform: 'Amazon',
          market: '中东',
          purpose: '新品上架',
        },
        result: {
          totalScore: 74,
          riskLevel: '中风险',
          decision: '优化后发布',
        },
      } as unknown as object,
    },
  });

  console.log('Seed completed: initial account admin@zyuf.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
