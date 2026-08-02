-- Replace the pre-launch catalogue with structured, acquisition-oriented pricing.
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "monthlyPrice" INTEGER;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "annualPrice" INTEGER;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "launchMonthlyPrice" INTEGER;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "launchAnnualPrice" INTEGER;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "includedSeats" INTEGER;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "modelCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "apiQuota" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "launchLockMonths" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "launchEligibilityText" TEXT;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "isContactSales" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "billingPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Plan" SET
  "name" = '免费版',
  "customerType" = '个人卖家与首次体验团队',
  "priceText" = '0元，永久免费',
  "billingCycle" = '每月重置',
  "monthlyPrice" = 0,
  "annualPrice" = 0,
  "launchMonthlyPrice" = 0,
  "launchAnnualPrice" = 0,
  "includedSeats" = 1,
  "modelCredits" = 20,
  "apiQuota" = 0,
  "launchLockMonths" = 0,
  "launchEligibilityText" = NULL,
  "isContactSales" = false,
  "quota" = 15,
  "supportedMarkets" = 3,
  "canExportReport" = false,
  "canBatchDetect" = false,
  "canUseApi" = false,
  "canPrivateDeploy" = false,
  "canUseCustomRules" = false,
  "canUseCustomReportTemplate" = false,
  "features" = '{"list":["每月15条 Listing 审校","1个账号与3个市场","在线查看结果","注册赠送20次平台基础模型"],"cta":"立即选择"}'::jsonb,
  "isActive" = true
WHERE "sortOrder" = 1;

UPDATE "Plan" SET
  "name" = 'Starter',
  "customerType" = '单人或小团队卖家',
  "priceText" = '共创价39元/月或399元/年',
  "billingCycle" = '月/年',
  "monthlyPrice" = 79,
  "annualPrice" = 799,
  "launchMonthlyPrice" = 39,
  "launchAnnualPrice" = 399,
  "includedSeats" = 1,
  "modelCredits" = 0,
  "apiQuota" = 0,
  "launchLockMonths" = 12,
  "launchEligibilityText" = '前30家付费客户或公开上线后90天内购买',
  "isContactSales" = false,
  "quota" = 200,
  "supportedMarkets" = 5,
  "canExportReport" = true,
  "canBatchDetect" = false,
  "canUseApi" = false,
  "canPrivateDeploy" = false,
  "canUseCustomRules" = false,
  "canUseCustomReportTemplate" = false,
  "features" = '{"list":["每月200条审校","报告导出与历史记录","客户自带模型 Key 不加价","共创价锁定12个月"],"cta":"立即选择"}'::jsonb,
  "isActive" = true
WHERE "sortOrder" = 2;

UPDATE "Plan" SET
  "name" = 'Growth',
  "customerType" = '3–10人高频上新团队',
  "priceText" = '共创价149元/月或1499元/年',
  "billingCycle" = '月/年',
  "monthlyPrice" = 299,
  "annualPrice" = 2999,
  "launchMonthlyPrice" = 149,
  "launchAnnualPrice" = 1499,
  "includedSeats" = 5,
  "modelCredits" = 0,
  "apiQuota" = 0,
  "launchLockMonths" = 12,
  "launchEligibilityText" = '前30家付费客户或公开上线后90天内购买',
  "isContactSales" = false,
  "quota" = 1000,
  "supportedMarkets" = 8,
  "canExportReport" = true,
  "canBatchDetect" = true,
  "canUseApi" = false,
  "canPrivateDeploy" = false,
  "canUseCustomRules" = true,
  "canUseCustomReportTemplate" = false,
  "features" = '{"list":["批量导入与完整报告","客户团队内部复核流程","自定义规则与审计记录","5个团队账号"],"cta":"升级套餐"}'::jsonb,
  "isActive" = true
WHERE "sortOrder" = 3;

UPDATE "Plan" SET
  "name" = 'Pro',
  "customerType" = '代运营机构、大型卖家、多店铺团队',
  "priceText" = '共创价399元/月或3999元/年',
  "billingCycle" = '月/年',
  "monthlyPrice" = 699,
  "annualPrice" = 6999,
  "launchMonthlyPrice" = 399,
  "launchAnnualPrice" = 3999,
  "includedSeats" = 15,
  "modelCredits" = 0,
  "apiQuota" = 10000,
  "launchLockMonths" = 12,
  "launchEligibilityText" = '前30家付费客户或公开上线后90天内购买',
  "isContactSales" = false,
  "quota" = 5000,
  "supportedMarkets" = NULL,
  "canExportReport" = true,
  "canBatchDetect" = true,
  "canUseApi" = true,
  "canPrivateDeploy" = false,
  "canUseCustomRules" = true,
  "canUseCustomReportTemplate" = true,
  "features" = '{"list":["15个账号与不限市场","审批流与自定义报告模板","API每月1万次（申请开通）","优先支持"],"cta":"升级套餐"}'::jsonb,
  "isActive" = true
WHERE "sortOrder" = 4;

UPDATE "Plan" SET
  "name" = 'Enterprise',
  "customerType" = '品牌企业、产业带机构、外贸服务机构',
  "priceText" = '共创价9800元/年起',
  "billingCycle" = '年/项目制',
  "monthlyPrice" = NULL,
  "annualPrice" = 19800,
  "launchMonthlyPrice" = NULL,
  "launchAnnualPrice" = 9800,
  "includedSeats" = NULL,
  "modelCredits" = 0,
  "apiQuota" = 0,
  "launchLockMonths" = 12,
  "launchEligibilityText" = '前30家付费客户或公开上线后90天内签约',
  "isContactSales" = true,
  "quota" = NULL,
  "supportedMarkets" = NULL,
  "canExportReport" = true,
  "canBatchDetect" = true,
  "canUseApi" = true,
  "canPrivateDeploy" = true,
  "canUseCustomRules" = true,
  "canUseCustomReportTemplate" = true,
  "features" = '{"list":["专属规则库与组织权限","培训与服务 SLA","定制额度与集成评估","私有化部署另行报价"],"cta":"联系定制"}'::jsonb,
  "isActive" = true
WHERE "sortOrder" = 5;

-- API is now an add-on and a Pro entitlement instead of a standalone high-entry plan.
UPDATE "Plan" SET "isActive" = false WHERE "sortOrder" >= 6 OR "name" = 'API接口版';

-- Apply the new monthly allowance immediately without erasing already-used usage.
UPDATE "Subscription" AS subscription SET
  "quotaTotal" = plan."quota",
  "quotaRemaining" = GREATEST(plan."quota" - subscription."quotaUsed", 0),
  "billingPeriodStart" = CURRENT_TIMESTAMP
FROM "Plan" AS plan
WHERE subscription."planId" = plan."id"
  AND subscription."status" = 'ACTIVE'
  AND plan."quota" IS NOT NULL;
