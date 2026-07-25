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
    name: '体验包/按次检测',
    customerType: '新客户、低频客户、试用客户',
    priceText: '19元/次 或 99元/10次',
    billingCycle: '按次',
    quota: 10,
    supportedMarkets: 1,
    canExportReport: false,
    canBatchDetect: false,
    canUseApi: false,
    canPrivateDeploy: false,
    canUseCustomRules: false,
    canUseCustomReportTemplate: false,
    sortOrder: 1,
    features: ['基础检测', '在线报告查看', '导出受限或升级提示'],
    cta: '立即选择',
  },
  {
    name: '基础版',
    customerType: '成长型中小卖家、学生实训店铺',
    priceText: '99元/月 或 999元/年',
    billingCycle: '月/年',
    quota: 200,
    supportedMarkets: 3,
    canExportReport: true,
    canBatchDetect: false,
    canUseApi: false,
    canPrivateDeploy: false,
    canUseCustomRules: false,
    canUseCustomReportTemplate: false,
    sortOrder: 2,
    features: ['基础检测', '基础风险识别', '基础报告导出'],
    cta: '立即选择',
  },
  {
    name: '专业版',
    customerType: '高频上新卖家、精品店铺、内容运营团队',
    priceText: '399元/月 或 3999元/年',
    billingCycle: '月/年',
    quota: 1000,
    supportedMarkets: 8,
    canExportReport: true,
    canBatchDetect: true,
    canUseApi: true,
    canPrivateDeploy: false,
    canUseCustomRules: true,
    canUseCustomReportTemplate: false,
    sortOrder: 3,
    features: ['完整报告导出', '增强看板', '批量检测', 'API服务权益'],
    cta: '升级套餐',
  },
  {
    name: '企业版',
    customerType: '代运营机构、大型卖家、多店铺团队',
    priceText: '9999—19999元/年',
    billingCycle: '年',
    quota: 20000,
    supportedMarkets: 20,
    canExportReport: true,
    canBatchDetect: true,
    canUseApi: true,
    canPrivateDeploy: false,
    canUseCustomRules: true,
    canUseCustomReportTemplate: true,
    sortOrder: 4,
    features: ['多账号团队', '客户报告归档', '人工复核流转', '企业级看板'],
    cta: '升级套餐',
  },
  {
    name: '定制版',
    customerType: '品牌企业、产业带机构、外贸服务机构',
    priceText: '3万—10万元/项目',
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
    features: ['专属规则库', '专属模板', '私有化部署', '企业培训服务'],
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

export const SERVICE_NOTICE = '套餐能力来自真实数据库配置；付费、合同和服务开通仍通过人工审批流程执行。';
