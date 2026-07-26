export type PlanSeed = {
  name: string;
  customerType: string;
  priceText: string;
  billingCycle: string;
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
    name: '免费体验',
    customerType: '首次体验的跨境电商团队',
    priceText: '0元/7天',
    billingCycle: '7天体验',
    quota: 5,
    supportedMarkets: 1,
    canExportReport: false,
    canBatchDetect: false,
    canUseApi: false,
    canPrivateDeploy: false,
    canUseCustomRules: false,
    canUseCustomReportTemplate: false,
    sortOrder: 1,
    features: ['5条 Listing 审校', '单账号', '在线查看结果', '不含批量、导出和 API'],
    cta: '立即选择',
  },
  {
    name: '基础版',
    customerType: '单人或小团队卖家',
    priceText: '399元/月（首批共创价199元/月）',
    billingCycle: '月/年',
    quota: 100,
    supportedMarkets: 3,
    canExportReport: true,
    canBatchDetect: false,
    canUseApi: false,
    canPrivateDeploy: false,
    canUseCustomRules: false,
    canUseCustomReportTemplate: false,
    sortOrder: 2,
    features: ['基础发布前审校', '基础规则模板', '结果导出', '首批共创价锁定12个月'],
    cta: '立即选择',
  },
  {
    name: 'Growth',
    customerType: '3–10人高频上新团队',
    priceText: '999元/月（首批共创价599元/月）',
    billingCycle: '月/年',
    quota: 500,
    supportedMarkets: 8,
    canExportReport: true,
    canBatchDetect: true,
    canUseApi: true,
    canPrivateDeploy: false,
    canUseCustomRules: true,
    canUseCustomReportTemplate: false,
    sortOrder: 3,
    features: ['批量审校', '人工复核', '审计记录', '完整报告导出'],
    cta: '升级套餐',
  },
  {
    name: 'Pro',
    customerType: '代运营机构、大型卖家、多店铺团队',
    priceText: '2499元/月（首批共创价1499元/月）',
    billingCycle: '月/年',
    quota: 2000,
    supportedMarkets: 20,
    canExportReport: true,
    canBatchDetect: true,
    canUseApi: true,
    canPrivateDeploy: false,
    canUseCustomRules: true,
    canUseCustomReportTemplate: true,
    sortOrder: 4,
    features: ['多店铺团队', '审批流', '自定义规则', '批量导出与 API'],
    cta: '升级套餐',
  },
  {
    name: 'Enterprise',
    customerType: '品牌企业、产业带机构、外贸服务机构',
    priceText: '6万—12万元/年（首年3.98万元起）',
    billingCycle: '项目制',
    quota: null,
    supportedMarkets: null,
    canExportReport: true,
    canBatchDetect: true,
    canUseApi: true,
    canPrivateDeploy: true,
    canUseCustomRules: true,
    canUseCustomReportTemplate: true,
    sortOrder: 5,
    features: ['专有规则库', '培训与 SLA', '定制报表', '可选私有化部署'],
    cta: '联系定制',
  },
  {
    name: 'API接口版',
    customerType: 'ERP、服务商平台、跨境工具平台',
    priceText: '9999元/年起 或 按调用量',
    billingCycle: '年/调用量',
    quota: null,
    supportedMarkets: null,
    canExportReport: true,
    canBatchDetect: true,
    canUseApi: true,
    canPrivateDeploy: false,
    canUseCustomRules: false,
    canUseCustomReportTemplate: false,
    sortOrder: 6,
    features: ['API Key', '调用额度', '接口调用统计', '规则检测接口与结果返回'],
    cta: '申请API服务',
  },
];

export const SERVICE_NOTICE = '首批共创价面向首批30家正式付费企业或公开上线后90天内申请的客户，以先到条件为准；价格锁定12个月。';
