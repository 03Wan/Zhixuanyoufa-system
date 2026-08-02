export type PlanSeed = {
  name: string;
  customerType: string;
  priceText: string;
  billingCycle: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  launchMonthlyPrice: number | null;
  launchAnnualPrice: number | null;
  includedSeats: number | null;
  modelCredits: number;
  apiQuota: number;
  launchLockMonths: number;
  launchEligibilityText: string | null;
  isContactSales: boolean;
  quota: number | null;
  supportedMarkets: number | null;
  canExportReport: boolean;
  canBatchDetect: boolean;
  canUseApi: boolean;
  canPrivateDeploy: boolean;
  canUseCustomRules: boolean;
  canUseCustomReportTemplate: boolean;
  sortOrder: number;
  features: string[];
  cta: string;
};

export const PLAN_SEEDS: PlanSeed[] = [
  {
    name: '免费版',
    customerType: '个人卖家与首次体验团队',
    priceText: '0元，永久免费',
    billingCycle: '每月重置',
    monthlyPrice: 0,
    annualPrice: 0,
    launchMonthlyPrice: 0,
    launchAnnualPrice: 0,
    includedSeats: 1,
    modelCredits: 20,
    apiQuota: 0,
    launchLockMonths: 0,
    launchEligibilityText: null,
    isContactSales: false,
    quota: 15,
    supportedMarkets: 3,
    canExportReport: false,
    canBatchDetect: false,
    canUseApi: false,
    canPrivateDeploy: false,
    canUseCustomRules: false,
    canUseCustomReportTemplate: false,
    sortOrder: 1,
    features: ['每月15条 Listing 审校', '1个账号与3个市场', '在线查看结果', '注册赠送20次平台基础模型'],
    cta: '立即选择',
  },
  {
    name: 'Starter',
    customerType: '单人或小团队卖家',
    priceText: '共创价39元/月或399元/年',
    billingCycle: '月/年',
    monthlyPrice: 79,
    annualPrice: 799,
    launchMonthlyPrice: 39,
    launchAnnualPrice: 399,
    includedSeats: 1,
    modelCredits: 0,
    apiQuota: 0,
    launchLockMonths: 12,
    launchEligibilityText: '前30家付费客户或公开上线后90天内购买',
    isContactSales: false,
    quota: 200,
    supportedMarkets: 5,
    canExportReport: true,
    canBatchDetect: false,
    canUseApi: false,
    canPrivateDeploy: false,
    canUseCustomRules: false,
    canUseCustomReportTemplate: false,
    sortOrder: 2,
    features: ['每月200条审校', '报告导出与历史记录', '客户自带模型 Key 不加价', '共创价锁定12个月'],
    cta: '立即选择',
  },
  {
    name: 'Growth',
    customerType: '3–10人高频上新团队',
    priceText: '共创价149元/月或1499元/年',
    billingCycle: '月/年',
    monthlyPrice: 299,
    annualPrice: 2999,
    launchMonthlyPrice: 149,
    launchAnnualPrice: 1499,
    includedSeats: 5,
    modelCredits: 0,
    apiQuota: 0,
    launchLockMonths: 12,
    launchEligibilityText: '前30家付费客户或公开上线后90天内购买',
    isContactSales: false,
    quota: 1000,
    supportedMarkets: 8,
    canExportReport: true,
    canBatchDetect: true,
    canUseApi: false,
    canPrivateDeploy: false,
    canUseCustomRules: true,
    canUseCustomReportTemplate: false,
    sortOrder: 3,
    features: ['批量导入与完整报告', '客户团队内部复核流程', '自定义规则与审计记录', '5个团队账号'],
    cta: '升级套餐',
  },
  {
    name: 'Pro',
    customerType: '代运营机构、大型卖家、多店铺团队',
    priceText: '共创价399元/月或3999元/年',
    billingCycle: '月/年',
    monthlyPrice: 699,
    annualPrice: 6999,
    launchMonthlyPrice: 399,
    launchAnnualPrice: 3999,
    includedSeats: 15,
    modelCredits: 0,
    apiQuota: 10000,
    launchLockMonths: 12,
    launchEligibilityText: '前30家付费客户或公开上线后90天内购买',
    isContactSales: false,
    quota: 5000,
    supportedMarkets: null,
    canExportReport: true,
    canBatchDetect: true,
    canUseApi: true,
    canPrivateDeploy: false,
    canUseCustomRules: true,
    canUseCustomReportTemplate: true,
    sortOrder: 4,
    features: ['15个账号与不限市场', '审批流与自定义报告模板', 'API每月1万次（申请开通）', '优先支持'],
    cta: '升级套餐',
  },
  {
    name: 'Enterprise',
    customerType: '品牌企业、产业带机构、外贸服务机构',
    priceText: '共创价9800元/年起',
    billingCycle: '年/项目制',
    monthlyPrice: null,
    annualPrice: 19800,
    launchMonthlyPrice: null,
    launchAnnualPrice: 9800,
    includedSeats: null,
    modelCredits: 0,
    apiQuota: 0,
    launchLockMonths: 12,
    launchEligibilityText: '前30家付费客户或公开上线后90天内签约',
    isContactSales: true,
    quota: null,
    supportedMarkets: null,
    canExportReport: true,
    canBatchDetect: true,
    canUseApi: true,
    canPrivateDeploy: true,
    canUseCustomRules: true,
    canUseCustomReportTemplate: true,
    sortOrder: 5,
    features: ['专属规则库与组织权限', '培训与服务 SLA', '定制额度与集成评估', '私有化部署另行报价'],
    cta: '联系定制',
  },
];

export const SERVICE_NOTICE = '首批共创价面向前30家付费客户或公开上线后90天内购买的客户，以先到条件为准；价格锁定12个月，到期前至少30天提示续费价格。';

export const PLAN_ADD_ONS = [
  { id: 'model-100', category: '平台模型包', name: '基础模型100次', price: 29, unit: '100次', description: '适合少量生成与AI辅助审校；客户自带模型 Key 不收费。' },
  { id: 'model-500', category: '平台模型包', name: '基础模型500次', price: 99, unit: '500次', description: '高成本模型按调用前展示的2–5倍积分扣减。' },
  { id: 'review-10', category: '人工风险抽检', name: '48小时抽检10条', price: 199, unit: '10条', description: '提供风险点、修改建议和复核记录。' },
  { id: 'review-50', category: '人工风险抽检', name: '48小时抽检50条', price: 799, unit: '50条', description: '深度逐条审核与24小时加急另行报价。' },
  { id: 'api-trial', category: 'API试用', name: 'API集成验证包', price: 99, unit: '试用包', description: '获批后开通，用于验证接口集成，不代表生产配额。' },
] as const;
