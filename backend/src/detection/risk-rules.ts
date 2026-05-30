import { RiskLevelText } from './detection.types';

export type KeywordRule = {
  type: string;
  riskLevel: RiskLevelText;
  position: 'title' | 'sellingPoints' | 'detailText' | 'adText' | 'all';
  keywords: string[];
  description: string;
};

export const TEXT_RISK_RULES: KeywordRule[] = [
  {
    type: '夸大宣传词',
    riskLevel: '中风险',
    position: 'all',
    keywords: ['最强', '第一', '永久', '100%有效', '绝对', '全网最低', '立刻见效'],
    description: '存在夸大或绝对化营销表达，可能触发平台合规风险。',
  },
  {
    type: '平台风险词',
    riskLevel: '高风险',
    position: 'all',
    keywords: ['仿牌', '高仿', '原单', '刷单', '虚假评论', '侵权'],
    description: '出现平台高风险词，存在封禁或下架风险。',
  },
  {
    type: '广告高风险词',
    riskLevel: '严重风险',
    position: 'adText',
    keywords: ['保证治愈', '官方认证', '唯一指定', '安全无副作用'],
    description: '广告语触发严重风险，需立即整改并人工复核。',
  },
];

export const IMAGE_BANNED_FILE_WORDS = ['banned', 'risk', 'fake', 'politics'];

export const LOCALIZATION_RULES: Array<{
  marketKeywords: string[];
  checks: Array<{ keyword: string; description: string }>;
}> = [
  {
    marketKeywords: ['中东', 'middle east', 'mea'],
    checks: [
      { keyword: '宗教', description: '中东市场避免宗教敏感内容。' },
      { keyword: '酒精', description: '中东市场应避免酒精相关表达。' },
      { keyword: '猪肉', description: '中东市场应避免猪肉相关表达。' },
      { keyword: '暴露', description: '中东市场避免不当暴露表达。' },
    ],
  },
  {
    marketKeywords: ['东南亚', 'sea', 'southeast asia'],
    checks: [
      { keyword: '保证', description: '东南亚市场应减少绝对承诺。' },
      { keyword: '立刻', description: '东南亚市场应避免夸张时效承诺。' },
    ],
  },
  {
    marketKeywords: ['欧美', 'us', 'eu', 'europe', 'america'],
    checks: [
      { keyword: '绝对', description: '欧美市场应避免绝对化宣传。' },
      { keyword: '官方认证', description: '欧美市场需谨慎使用认证表达。' },
      { keyword: '隐私', description: '欧美市场需注意隐私合规描述。' },
    ],
  },
  {
    marketKeywords: ['日本', 'japan', 'jp'],
    checks: [
      { keyword: '最强', description: '日本市场避免过度夸张营销。' },
      { keyword: '第一', description: '日本市场更强调证据与细节。' },
      { keyword: '永久', description: '日本市场建议补充售后与适用说明。' },
    ],
  },
];
