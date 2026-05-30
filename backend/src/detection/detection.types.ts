export type DetectionInput = {
  productName: string;
  category: string;
  platform: string;
  market: string;
  purpose: string;
  title: string;
  sellingPoints: string;
  detailText: string;
  adText: string;
  imageUrls: string[];
};

export type RiskLevelText = '低风险' | '中风险' | '高风险' | '严重风险';

export type DecisionText = '可发布' | '优化后发布' | '人工复核' | '暂缓发布';

export type DetectionIssue = {
  position: string;
  type: string;
  riskLevel: RiskLevelText;
  hitContent: string;
  description: string;
};

export type DetectionSuggestion = {
  target: string;
  problem: string;
  suggestion: string;
  recommendedText?: string;
};

export type DetectionOutput = {
  totalScore: number;
  dimensionScores: {
    completeness: number;
    compliance: number;
    localization: number;
  };
  riskLevel: RiskLevelText;
  decision: DecisionText;
  issues: DetectionIssue[];
  suggestions: DetectionSuggestion[];
};
