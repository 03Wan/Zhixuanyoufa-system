import { Injectable, NotFoundException } from '@nestjs/common';
import { DecisionType, RiskLevel, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import { SubscriptionService } from '../subscription/subscription.service';
import {
  DecisionText,
  DetectionInput,
  DetectionIssue,
  DetectionOutput,
  DetectionSuggestion,
  RiskLevelText,
} from './detection.types';
import { IMAGE_BANNED_FILE_WORDS, LOCALIZATION_RULES, TEXT_RISK_RULES } from './risk-rules';
import { ModelConfigService } from '../model-config/model-config.service';

@Injectable()
export class DetectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly modelConfigService: ModelConfigService,
  ) {}

  private async buildTaskScope(userId: string, extra: Record<string, any> = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyName: true } });
    if (!user) return { id: '__never__' };
    const isSystemAdmin = user.role === 'SYSTEM_ADMIN' || user.role === 'ADMIN';
    if (isSystemAdmin) return { ...extra };
    if (user.companyName) return { ...extra, user: { companyName: user.companyName } };
    return { ...extra, userId };
  }

  async runDetection(
    userId: string,
    taskId: string,
    runtimeModelConfig?: { enabled?: boolean; apiUrl?: string; apiKey?: string; modelName?: string },
  ) {
    await this.subscriptionService.assertCanDetect(userId, 1);
    const where = await this.buildTaskScope(userId, { id: taskId });
    const task = await this.prisma.materialTask.findFirst({
      where,
      include: { materialContent: true },
    });
    if (!task) throw new NotFoundException('任务不存在');

    const content = task.materialContent;
    const input: DetectionInput = {
      productName: task.productName,
      category: task.category,
      platform: task.platform,
      market: task.market,
      purpose: task.purpose,
      title: content?.title ?? '',
      sellingPoints: this.jsonToText(content?.sellingPoints),
      detailText: content?.detailText ?? '',
      adText: content?.adText ?? '',
      imageUrls: this.jsonToStringArray(content?.imageUrls),
    };

    const savedModelConfig = await this.modelConfigService.getRuntimeConfig(userId);
    const output = await this.evaluateWithOptionalModel(input, savedModelConfig ?? runtimeModelConfig);

    await this.prisma.$transaction(async (tx) => {
      await tx.materialTask.update({
        where: { id: taskId },
        data: { status: TaskStatus.COMPLETED },
      });

      const exists = await tx.detectionResult.findFirst({ where: { taskId }, select: { id: true } });
      if (exists?.id) {
        await tx.detectionResult.update({
          where: { id: exists.id },
          data: {
            totalScore: output.totalScore,
            completenessScore: output.dimensionScores.completeness,
            complianceScore: output.dimensionScores.compliance,
            localizationScore: output.dimensionScores.localization,
            riskLevel: this.toPrismaRiskLevel(output.riskLevel),
            decision: this.toPrismaDecision(output.decision),
            issues: output.issues as unknown as object,
            suggestions: output.suggestions as unknown as object,
          },
        });
      } else {
        await tx.detectionResult.create({
          data: {
            taskId,
            totalScore: output.totalScore,
            completenessScore: output.dimensionScores.completeness,
            complianceScore: output.dimensionScores.compliance,
            localizationScore: output.dimensionScores.localization,
            riskLevel: this.toPrismaRiskLevel(output.riskLevel),
            decision: this.toPrismaDecision(output.decision),
            issues: output.issues as unknown as object,
            suggestions: output.suggestions as unknown as object,
          },
        });
      }

      if (output.riskLevel === '高风险' || output.riskLevel === '严重风险') {
        await tx.reviewTask.upsert({
          where: { taskId },
          update: {
            status: 'PENDING',
            systemDecision: this.toPrismaDecision(output.decision),
            comment: '系统自动流转人工复核（高风险）',
          },
          create: {
            taskId,
            createdBy: userId,
            status: 'PENDING',
            systemDecision: this.toPrismaDecision(output.decision),
            comment: '系统自动流转人工复核（高风险）',
          },
        });
        await tx.materialTask.update({ where: { id: taskId }, data: { status: TaskStatus.REVIEW_REQUIRED } });
      }
    });

    await this.logsService.createLog({
      userId,
      action: 'RUN_DETECTION',
      targetType: 'MATERIAL_TASK',
      targetId: taskId,
      metadata: {
        totalScore: output.totalScore,
        riskLevel: output.riskLevel,
        decision: output.decision,
      },
    });

    await this.subscriptionService.consumeDetectQuota(userId, taskId, 1, '检测成功后扣减额度');

    return output;
  }

  async getResult(userId: string, taskId: string) {
    const where = await this.buildTaskScope(userId, { id: taskId });
    const task = await this.prisma.materialTask.findFirst({
      where,
      include: { detectionResult: true },
    });
    if (!task) throw new NotFoundException('任务不存在');
    if (!task.detectionResult) throw new NotFoundException('检测结果不存在');

    const derivedDecision = this.deriveDecisionFromPersistedResult(
      task.detectionResult.totalScore,
      task.detectionResult.riskLevel,
    );

    return {
      totalScore: task.detectionResult.totalScore,
      dimensionScores: {
        completeness: task.detectionResult.completenessScore,
        compliance: task.detectionResult.complianceScore,
        localization: task.detectionResult.localizationScore,
      },
      riskLevel: this.toRiskLevelText(task.detectionResult.riskLevel),
      decision: derivedDecision,
      issues: (task.detectionResult.issues ?? []) as unknown as DetectionIssue[],
      suggestions: (task.detectionResult.suggestions ?? []) as unknown as DetectionSuggestion[],
    } satisfies DetectionOutput;
  }

  evaluate(input: DetectionInput): DetectionOutput {
    const issues: DetectionIssue[] = [];
    const suggestions: DetectionSuggestion[] = [];

    const textBlocks: Record<string, string> = {
      title: input.title || '',
      sellingPoints: input.sellingPoints || '',
      detailText: input.detailText || '',
      adText: input.adText || '',
      all: [input.title, input.sellingPoints, input.detailText, input.adText].join('\n'),
    };

    for (const rule of TEXT_RISK_RULES) {
      const sourceText = textBlocks[rule.position] ?? textBlocks.all;
      for (const keyword of rule.keywords) {
        if (sourceText.includes(keyword)) {
          issues.push({
            position: rule.position,
            type: rule.type,
            riskLevel: rule.riskLevel,
            hitContent: keyword,
            description: rule.description,
          });
          suggestions.push({
            target: rule.position,
            problem: `命中${rule.type}：${keyword}`,
            suggestion: '请替换为客观、可验证表达，避免绝对化和违规承诺。',
            recommendedText: this.recommendedTextFor(keyword),
          });
        }
      }
    }

    const imageUrls = input.imageUrls || [];
    if (imageUrls.length === 0) {
      issues.push({
        position: 'imageUrls',
        type: '图片缺失',
        riskLevel: '高风险',
        hitContent: '无图片',
        description: '缺少商品主图。',
      });
      suggestions.push({
        target: 'imageUrls',
        problem: '缺少商品主图',
        suggestion: '至少上传1张主图和1张场景图。',
      });
    } else if (imageUrls.length < 2) {
      issues.push({
        position: 'imageUrls',
        type: '图片数量不足',
        riskLevel: '中风险',
        hitContent: `${imageUrls.length}张`,
        description: '图片素材不足。',
      });
      suggestions.push({
        target: 'imageUrls',
        problem: '图片数量少于2张',
        suggestion: '补充多角度与细节图，提高转化和审核通过率。',
      });
    }

    imageUrls.forEach((url) => {
      const lower = url.toLowerCase();
      const hitWord = IMAGE_BANNED_FILE_WORDS.find((w) => lower.includes(w));
      if (hitWord) {
        issues.push({
          position: 'imageUrls',
          type: '图片命名风险',
          riskLevel: '高风险',
          hitContent: hitWord,
          description: '图片文件名命中高风险关键词。',
        });
        suggestions.push({
          target: 'imageUrls',
          problem: `图片文件名包含敏感词 ${hitWord}`,
          suggestion: '更换为规范中性命名，例如 product-main-01.jpg。',
        });
      }
    });

    const localizationIssues = this.detectLocalizationIssues(input.market, textBlocks.all);
    issues.push(...localizationIssues);
    localizationIssues.forEach((item) => {
      suggestions.push({
        target: 'localization',
        problem: item.description,
        suggestion: '请根据目标市场文化和平台规范调整表述。',
      });
    });

    const completeness = this.calcCompleteness(input);
    const compliance = this.calcCompliance(issues);
    const localization = this.calcLocalization(input.market, textBlocks.all, localizationIssues.length);

    const totalScore = Math.max(
      0,
      Math.round(completeness * 0.35 + compliance * 0.35 + localization * 0.3),
    );

    const riskLevel = this.calcRiskLevel(totalScore, issues);
    const decision = this.calcDecision(riskLevel);

    return {
      totalScore,
      dimensionScores: {
        completeness,
        compliance,
        localization,
      },
      riskLevel,
      decision,
      issues,
      suggestions: this.uniqueSuggestions(suggestions),
    };
  }

  private async evaluateWithOptionalModel(
    input: DetectionInput,
    runtimeModelConfig?: { enabled?: boolean; apiUrl?: string; apiKey?: string; modelName?: string },
  ): Promise<DetectionOutput> {
    const modelOutput = await this.tryModelDetection(input, runtimeModelConfig);
    if (modelOutput) return modelOutput;
    return this.evaluate(input);
  }

  private async tryModelDetection(
    input: DetectionInput,
    runtimeModelConfig?: { enabled?: boolean; apiUrl?: string; apiKey?: string; modelName?: string },
  ): Promise<DetectionOutput | null> {
    const useRuntime = !!runtimeModelConfig?.enabled;
    const apiUrl = (useRuntime ? runtimeModelConfig?.apiUrl : process.env.MODEL_API_URL) || '';
    const apiKey = (useRuntime ? runtimeModelConfig?.apiKey : process.env.MODEL_API_KEY) || '';
    const model = (useRuntime ? runtimeModelConfig?.modelName : process.env.MODEL_NAME) || 'gpt-4.1-mini';
    if (!apiUrl || !apiKey) return null;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      const prompt = `你是跨境电商素材检测助手。请基于输入返回JSON，不要markdown：
{
  "totalScore": number,
  "dimensionScores": { "completeness": number, "compliance": number, "localization": number },
  "riskLevel": "低风险"|"中风险"|"高风险"|"严重风险",
  "decision": "可发布"|"优化后发布"|"人工复核"|"暂缓发布",
  "issues": [{"position":"","type":"","riskLevel":"低风险|中风险|高风险|严重风险","hitContent":"","description":""}],
  "suggestions": [{"target":"","problem":"","suggestion":"","recommendedText":""}]
}
输入：${JSON.stringify(input)}`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const json = (await res.json()) as any;
      const content = json?.choices?.[0]?.message?.content || json?.output?.[0]?.content?.[0]?.text || '';
      if (!content) return null;
      const parsed = this.safeParseJson(content);
      if (!parsed) return null;
      return this.normalizeModelOutput(parsed);
    } catch {
      return null;
    }
  }

  private safeParseJson(raw: string): any | null {
    try {
      return JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  }

  private normalizeModelOutput(raw: any): DetectionOutput | null {
    const totalScore = Number(raw?.totalScore);
    const riskLevel = String(raw?.riskLevel || '') as RiskLevelText;
    const decision = String(raw?.decision || '') as DecisionText;
    if (Number.isNaN(totalScore) || !riskLevel || !decision) return null;
    return {
      totalScore: Math.max(0, Math.min(100, Math.round(totalScore))),
      dimensionScores: {
        completeness: Math.max(0, Math.min(100, Number(raw?.dimensionScores?.completeness ?? 0))),
        compliance: Math.max(0, Math.min(100, Number(raw?.dimensionScores?.compliance ?? 0))),
        localization: Math.max(0, Math.min(100, Number(raw?.dimensionScores?.localization ?? 0))),
      },
      riskLevel,
      decision,
      issues: Array.isArray(raw?.issues) ? raw.issues : [],
      suggestions: Array.isArray(raw?.suggestions) ? raw.suggestions : [],
    };
  }

  private calcCompleteness(input: DetectionInput) {
    let score = 0;
    if (input.title.trim()) score += 20;
    if (input.sellingPoints.trim()) score += 20;
    if (input.detailText.trim()) score += 20;
    if (input.adText.trim()) score += 15;
    if ((input.imageUrls || []).length > 0) score += 25;
    return score;
  }

  private calcCompliance(issues: DetectionIssue[]) {
    let score = 100;
    for (const issue of issues) {
      if (issue.riskLevel === '低风险') score -= 5;
      if (issue.riskLevel === '中风险') score -= 10;
      if (issue.riskLevel === '高风险') score -= 20;
      if (issue.riskLevel === '严重风险') score -= 35;
    }
    return Math.max(0, score);
  }

  private calcLocalization(market: string, allText: string, localizationIssueCount: number) {
    let score = 100;
    const normalized = market.toLowerCase();

    if (normalized.includes('东南亚') || normalized.includes('sea') || normalized.includes('southeast asia')) {
      if (allText.length < 30) score -= 10;
    }

    if (normalized.includes('日本') || normalized.includes('jp') || normalized.includes('japan')) {
      const hasDetail = /材质|售后|质保|规格|尺寸/.test(allText);
      if (!hasDetail) score -= 15;
    }

    score -= localizationIssueCount * 10;
    return Math.max(0, score);
  }

  private calcRiskLevel(totalScore: number, issues: DetectionIssue[]): RiskLevelText {
    const hasSevere = issues.some((i) => i.riskLevel === '严重风险');
    const hasHigh = issues.some((i) => i.riskLevel === '高风险');

    if (totalScore < 50 || hasSevere) return '严重风险';
    if (totalScore >= 85 && !hasHigh) return '低风险';
    if (totalScore >= 70) return '中风险';
    return '高风险';
  }

  private calcDecision(riskLevel: RiskLevelText): DecisionText {
    if (riskLevel === '低风险') return '可发布';
    if (riskLevel === '中风险') return '优化后发布';
    if (riskLevel === '高风险') return '人工复核';
    return '暂缓发布';
  }

  private detectLocalizationIssues(market: string, allText: string): DetectionIssue[] {
    const normalizedMarket = market.toLowerCase();
    const matchedRule = LOCALIZATION_RULES.find((rule) =>
      rule.marketKeywords.some((k) => normalizedMarket.includes(k)),
    );

    if (!matchedRule) return [];

    const issues: DetectionIssue[] = [];
    for (const check of matchedRule.checks) {
      if (allText.includes(check.keyword)) {
        issues.push({
          position: 'localization',
          type: '市场文化适配',
          riskLevel: '中风险',
          hitContent: check.keyword,
          description: check.description,
        });
      }
    }
    return issues;
  }

  private toPrismaRiskLevel(level: RiskLevelText): RiskLevel {
    if (level === '低风险') return RiskLevel.LOW;
    if (level === '中风险') return RiskLevel.MEDIUM;
    if (level === '高风险') return RiskLevel.HIGH;
    return RiskLevel.CRITICAL;
  }

  private toPrismaDecision(decision: DecisionText): DecisionType {
    if (decision === '可发布') return DecisionType.APPROVE;
    if (decision === '优化后发布') return DecisionType.OPTIMIZE_AND_REVIEW;
    if (decision === '人工复核') return DecisionType.REJECT;
    return DecisionType.HOLD;
  }

  private toRiskLevelText(level: RiskLevel): RiskLevelText {
    if (level === RiskLevel.LOW) return '低风险';
    if (level === RiskLevel.MEDIUM) return '中风险';
    if (level === RiskLevel.HIGH) return '高风险';
    return '严重风险';
  }

  private toDecisionText(decision: DecisionType): DecisionText {
    if (decision === DecisionType.APPROVE) return '可发布';
    if (decision === DecisionType.OPTIMIZE_AND_REVIEW) return '优化后发布';
    if (decision === DecisionType.REJECT) return '人工复核';
    return '暂缓发布';
  }

  private deriveDecisionFromPersistedResult(totalScore: number, riskLevel: RiskLevel): DecisionText {
    if (totalScore < 50) return '暂缓发布';
    if (riskLevel === RiskLevel.LOW) return '可发布';
    if (riskLevel === RiskLevel.MEDIUM) return '优化后发布';
    if (riskLevel === RiskLevel.HIGH) return '人工复核';
    return '暂缓发布';
  }

  private recommendedTextFor(keyword: string) {
    const map: Record<string, string> = {
      最强: '性能表现优秀，适合日常高频使用。',
      第一: '在同类产品中具备明显优势。',
      永久: '提供长期售后支持，具体以服务条款为准。',
      绝对: '在多数使用场景中表现稳定。',
      '100%有效': '多数用户反馈效果明显。',
      全网最低: '价格具有竞争力，请以活动页面为准。',
      立刻见效: '通常在短期使用后可感知效果。',
    };
    return map[keyword];
  }

  private uniqueSuggestions(suggestions: DetectionSuggestion[]) {
    const seen = new Set<string>();
    return suggestions.filter((s) => {
      const key = `${s.target}|${s.problem}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private jsonToText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map((x) => String(x)).join('；');
    if (value && typeof value === 'object') return JSON.stringify(value);
    return '';
  }

  private jsonToStringArray(value: unknown): string[] {
    if (Array.isArray(value)) return value.map((x) => String(x));
    if (typeof value === 'string' && value.trim()) return [value];
    return [];
  }
}
