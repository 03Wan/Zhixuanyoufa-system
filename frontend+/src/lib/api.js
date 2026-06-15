const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || 'false').toLowerCase() === 'true';
const TOKEN_KEY = 'zyyf_token';
const USER_KEY = 'zyyf_user';
const LOADING_DELAY_MS = 150;
let pendingCount = 0;
let loadingVisible = false;
let loadingDelayTimer = null;
class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}
function emitLoading(active) {
    if (typeof window === 'undefined')
        return;
    window.dispatchEvent(new CustomEvent('zyyf-loading', { detail: { active, pending: pendingCount } }));
}
function startGlobalLoading() {
    if (typeof window === 'undefined')
        return;
    pendingCount += 1;
    if (pendingCount !== 1)
        return;
    if (loadingDelayTimer)
        clearTimeout(loadingDelayTimer);
    loadingDelayTimer = setTimeout(() => {
        if (pendingCount > 0 && !loadingVisible) {
            loadingVisible = true;
            emitLoading(true);
        }
    }, LOADING_DELAY_MS);
}
function endGlobalLoading() {
    if (typeof window === 'undefined')
        return;
    pendingCount = Math.max(0, pendingCount - 1);
    if (pendingCount > 0)
        return;
    if (loadingDelayTimer) {
        clearTimeout(loadingDelayTimer);
        loadingDelayTimer = null;
    }
    if (loadingVisible) {
        loadingVisible = false;
        emitLoading(false);
    }
}
function nowIso() {
    return new Date().toISOString();
}
let mockRuntimeClockMs = Date.now() - 1000 * 60 * 30;
let mockSerial = 1000;
function nextMockIso(stepMs) {
    const delta = stepMs ?? (45000 + Math.floor(Math.random() * 210000));
    mockRuntimeClockMs += Math.max(1000, delta);
    return new Date(mockRuntimeClockMs).toISOString();
}
function nextMockNo(prefix) {
    mockSerial += 1;
    return `${prefix}-${Date.now()}-${String(mockSerial).padStart(4, '0')}`;
}
function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
function riskByScore(score) {
    if (score < 50)
        return '严重风险';
    if (score >= 85)
        return '低风险';
    if (score >= 70)
        return '中风险';
    return '高风险';
}
function decisionByRisk(risk) {
    if (risk === '严重风险')
        return '暂缓发布';
    if (risk === '低风险')
        return '可发布';
    if (risk === '中风险')
        return '优化后发布';
    return '人工复核';
}
const mockUsers = [
    { id: 'u1', username: '企业管理员A', email: 'enterprise_admin@example.com', role: 'ENTERPRISE_ADMIN', companyName: '智选优发演示企业', status: '启用', lastLoginAt: nowIso() },
    { id: 'u2', username: '运营人员A', email: 'operator@example.com', role: 'OPERATOR', companyName: '智选优发演示企业', status: '启用', lastLoginAt: nowIso() },
    { id: 'u3', username: '设计人员A', email: 'designer@example.com', role: 'DESIGNER', companyName: '智选优发演示企业', status: '启用', lastLoginAt: nowIso() },
    { id: 'u4', username: '复核人员A', email: 'reviewer@example.com', role: 'REVIEWER', companyName: '智选优发演示企业', status: '启用', lastLoginAt: nowIso() },
    { id: 'u5', username: '管理人员A', email: 'manager@example.com', role: 'MANAGER', companyName: '智选优发演示企业', status: '启用', lastLoginAt: nowIso() },
    { id: 'u6', username: '系统管理员A', email: 'sysadmin@example.com', role: 'SYSTEM_ADMIN', companyName: '平台方', status: '启用', lastLoginAt: nowIso() },
];
let mockTasks = [];
let mockReports = [];
let mockRules = [
    { id: 'r1', ruleId: 'r1', name: '禁用绝对化用语', type: '广告合规', platform: 'Amazon', market: '全球通用', category: '通用', riskLevel: '高风险', keywords: ['最强', '100%有效'], suggestion: '改为客观描述', status: '启用', updatedAt: nowIso() },
];
let mockReviews = [];
let mockLogs = [];
let mockRuleApprovals = [];
let mockRuleVersions = [];
let mockCustomers = [];
let mockPlans = [];
let mockSubscriptions = [];
let mockUsageRecords = [];
let mockFiles = [];
let mockCompanies = [];
let mockBatchTasks = [];
let mockMaterialVersions = [];
let mockReportTemplates = [];
function seedDetection(score, riskLevel, decision) {
    const explanation = `综合分${score}，主要基于素材完整性、准确性、规范性、吸引力、市场适配5个维度评估。`;
    return {
        score,
        totalScore: score,
        detectedAt: nowIso(),
        riskLevel,
        decision,
        dimensionScores: {
            completeness: Math.min(100, score + 4),
            compliance: Math.max(60, score - 6),
            localization: Math.max(60, score - 3),
            attractiveness: Math.max(58, score - 5),
            accuracy: Math.max(60, score - 4),
        },
        matchedRules: [
            {
                name: '绝对化表述风险',
                position: 'title',
                riskLevel,
                description: '存在绝对化营销表达，可能触发平台合规问题。',
                suggestion: '替换为客观、可验证描述。',
            },
        ],
        issues: [
            {
                position: 'adText',
                type: '广告合规',
                riskLevel,
                hitContent: '最强',
                description: '文案包含绝对化表达。',
                suggestion: '改成中性描述，避免绝对承诺。',
            },
        ],
        suggestions: [
            {
                before: '最强效果，立刻见效',
                after: '性能表现稳定，适用于多数日常场景',
                reason: '降低违规风险并提升可信度',
            },
        ],
        parseResult: {
            text: {
                keywords: ['便携', '大容量', '快充'],
                sensitiveWords: ['最强'],
                promiseExpressions: ['立刻见效'],
                language: 'zh-CN',
            },
            image: {
                objects: ['杯体', '果汁', '品牌Logo'],
                colors: ['蓝色', '白色'],
                ocrText: ['便携榨汁杯', '新品'],
                risks: ['文字占比偏高'],
            },
        },
        optimization: {
            titleVariants: ['便携榨汁杯 轻量大容量款', '双杯便携榨汁杯 Type-C快充', '便携榨汁杯 户外办公两用'],
            sellingPointRewrite: {
                before: ['最强动力', '立刻见效', '超级好用'],
                after: ['高转速搅拌，口感更细腻', '一键启动，操作便捷', '食品级材质，日常使用更安心'],
            },
            detailStructureAdvice: {
                missingModules: ['规格参数', '售后说明'],
                suggestions: ['补充容量/功率/重量等参数', '增加质保周期与退换政策'],
            },
            adCopyVariants: [
                { style: '正式', text: '便携榨汁杯，满足通勤与办公场景的鲜榨需求。' },
                { style: '亲和', text: '随手一杯鲜果汁，出门也能元气满满。' },
                { style: '促销', text: '限时优惠，便携榨汁杯到手更划算。' },
            ],
        },
        explanation,
    };
}
const MOCK_SEED_CONFIG = {
    seed: 20260530,
    days: 90,
    taskCount: 54,
    reportCount: 32,
    reviewCount: 12,
    logCount: 180,
    batchCount: 6,
    materialVersionCount: 40,
    peakWindows: [
        { startDay: 22, length: 7, factor: 1.7 },
        { startDay: 58, length: 7, factor: 1.7 },
    ],
};
function createSeededRandom(seed) {
    let state = seed % 2147483647;
    if (state <= 0)
        state += 2147483646;
    return () => {
        state = (state * 16807) % 2147483647;
        return (state - 1) / 2147483646;
    };
}
function shuffleWithRandom(list, random) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function buildPoolFromCounts(counts) {
    const pool = [];
    Object.keys(counts).forEach((key) => {
        const n = counts[key];
        for (let i = 0; i < n; i += 1)
            pool.push(key);
    });
    return pool;
}
function weightedPickIndex(weights, random) {
    const total = weights.reduce((sum, x) => sum + x, 0);
    let r = random() * total;
    for (let i = 0; i < weights.length; i += 1) {
        r -= weights[i];
        if (r <= 0)
            return i;
    }
    return weights.length - 1;
}
function buildMockTimeline(config, random) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - (config.days - 1));
    const points = [];
    for (let i = 0; i < config.days; i += 1) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        let weight = isWeekend ? 0.76 : 1.08;
        weight += random() * 0.42;
        for (const peak of config.peakWindows) {
            if (i >= peak.startDay && i < peak.startDay + peak.length) {
                weight *= peak.factor;
            }
        }
        points.push({ dayIndex: i, date: d, weight });
    }
    return points;
}
function buildMockTasks(config, timeline, random) {
    const statusCounts = {
        DRAFT: 6,
        PENDING_DETECTION: 7,
        DETECTING: 3,
        COMPLETED: 24,
        REPORTED: 8,
        REVIEW_REQUIRED: 6,
    };
    const platformCounts = {
        Amazon: 19,
        'TikTok Shop': 11,
        Shopee: 11,
        Lazada: 5,
        eBay: 4,
        Temu: 4,
    };
    const marketCounts = {
        欧美: 22,
        东南亚: 16,
        中东: 11,
        拉美: 5,
    };
    const riskCounts = {
        低风险: 17,
        中风险: 14,
        高风险: 8,
        严重风险: 2,
    };
    const statusPool = shuffleWithRandom(buildPoolFromCounts(statusCounts), random);
    const platformPool = shuffleWithRandom(buildPoolFromCounts(platformCounts), random);
    const marketPool = shuffleWithRandom(buildPoolFromCounts(marketCounts), random);
    const categories = ['家居用品', '3C电子', '美妆个护', '运动户外', '母婴用品', '宠物用品', '食品饮料', '服饰配件'];
    const purposes = ['上架前审核', '广告投放前审核', '活动素材审核', '新品发布前审核'];
    const productBase = ['便携榨汁杯', '蓝牙降噪耳机', '防晒喷雾', '瑜伽弹力带', '婴儿湿巾', '宠物牵引绳', '速食燕麦杯', '防水登山包', '磁吸充电宝', '保温运动水壶'];
    const riskMap = {
        低风险: { min: 86, max: 96, decision: '可发布' },
        中风险: { min: 72, max: 84, decision: '优化后发布' },
        高风险: { min: 56, max: 69, decision: '人工复核' },
        严重风险: { min: 40, max: 49, decision: '暂缓发布' },
    };
    const riskPool = shuffleWithRandom(buildPoolFromCounts(riskCounts), random);
    const weights = timeline.map((x) => x.weight);
    const allocatedDayIndex = [];
    for (let i = 0; i < config.taskCount; i += 1) {
        allocatedDayIndex.push(weightedPickIndex(weights, random));
    }
    const recentOffsets = [0, 1, 2, 3, 4, 5, 6, 2];
    recentOffsets.forEach((offset, idx) => {
        if (idx < allocatedDayIndex.length) {
            allocatedDayIndex[idx] = timeline.length - 1 - offset;
        }
    });
    const tasks = [];
    let riskCursor = 0;
    for (let i = 0; i < config.taskCount; i += 1) {
        const status = statusPool[i];
        const platform = platformPool[i];
        const market = marketPool[i];
        const productName = `${productBase[i % productBase.length]} 第${Math.floor(i / productBase.length) + 1}批`;
        const category = categories[i % categories.length];
        const day = timeline[allocatedDayIndex[i]];
        const created = new Date(day.date);
        created.setHours(8 + Math.floor(random() * 10), Math.floor(random() * 60), Math.floor(random() * 60), 0);
        const updated = new Date(created);
        updated.setHours(updated.getHours() + 4 + Math.floor(random() * 48));
        const materialKeyword = ['高转速', '食品级', '轻量化', '多场景', '快充', '低延迟', '防泼水', '高回弹'][i % 8];
        const task = {
            id: `task-seed-90d-${String(i + 1).padStart(3, '0')}`,
            taskNo: `TSK-DEMO-${String(1001 + i).padStart(4, '0')}`,
            sku: `SKU-DEMO-${String(1001 + i).padStart(4, '0')}`,
            productName,
            category,
            platform,
            market,
            purpose: purposes[i % purposes.length],
            status,
            createdAt: created.toISOString(),
            updatedAt: updated.toISOString(),
            materialContent: {
                title: `${productName} ${materialKeyword}升级款`,
                sellingPoints: [`${materialKeyword}核心卖点`, '本土化表达优化', '多平台合规表达'],
                detailText: `面向${market}市场，突出${materialKeyword}与使用场景，适配${platform}素材规范。`,
                adText: `围绕${productName}的核心卖点进行合规传播，避免夸张承诺。`,
                imageUrls: [`mock://img/${1001 + i}-main.jpg`, `mock://img/${1001 + i}-scene.jpg`],
            },
        };
        if (['COMPLETED', 'REPORTED', 'REVIEW_REQUIRED', 'DETECTING'].includes(status)) {
            const riskLevel = riskPool[riskCursor] || '中风险';
            riskCursor += 1;
            const riskRule = riskMap[riskLevel];
            const score = riskRule.min + Math.floor(random() * (riskRule.max - riskRule.min + 1));
            const detection = seedDetection(score, riskLevel, riskRule.decision);
            detection.detectedAt = new Date(updated.getTime() - Math.floor(random() * 3) * 3600 * 1000).toISOString();
            detection.matchedRules = [
                {
                    name: `${platform} 合规模板规则`,
                    position: 'title',
                    riskLevel,
                    description: '检测到营销表达与平台规范存在偏差。',
                    suggestion: '使用可验证、可量化的中性表达。',
                },
                {
                    name: `${market} 本土化语义适配`,
                    position: 'adText',
                    riskLevel: riskLevel === '低风险' ? '中风险' : riskLevel,
                    description: '关键词与目标市场消费语境匹配度存在提升空间。',
                    suggestion: '根据目标市场语感重写短句，提升自然度。',
                },
            ];
            detection.issues = [
                {
                    position: 'title',
                    type: '平台合规',
                    riskLevel,
                    hitContent: riskLevel === '低风险' ? '高效体验' : '最佳效果',
                    description: '文案存在敏感营销表达风险。',
                    suggestion: '替换为事实描述与参数证据。',
                },
            ];
            detection.suggestions = [
                {
                    before: '全网最佳效果，立即见效',
                    after: '经内部测试表现稳定，适配常见使用场景',
                    reason: '降低违规风险，提升可信度',
                },
            ];
            task.detectionResult = detection;
        }
        tasks.push(task);
    }
    tasks.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return tasks;
}
function buildMockReports(tasks, config, random) {
    const candidates = tasks.filter((t) => ['COMPLETED', 'REPORTED'].includes(t.status) && t.detectionResult);
    const picked = candidates.slice(0, config.reportCount);
    return picked.map((task, idx) => {
        const createdAt = new Date(task.updatedAt || task.createdAt);
        createdAt.setHours(createdAt.getHours() + Math.floor(random() * 8));
        const report = {
            id: `report-seed-90d-${String(idx + 1).padStart(3, '0')}`,
            taskId: task.id,
            reportNo: `RPT-DEMO-${String(3001 + idx).padStart(4, '0')}`,
            title: `${task.productName} 审核报告`,
            summary: `综合评分 ${task.detectionResult.totalScore}，建议 ${task.detectionResult.decision}`,
            createdAt: createdAt.toISOString(),
            updatedAt: createdAt.toISOString(),
            task,
            result: {
                ...task.detectionResult,
                reportMeta: {
                    scoreDimensions: task.detectionResult.dimensionScores,
                    matchedRuleCount: (task.detectionResult.matchedRules || []).length,
                    recommendationCount: (task.detectionResult.suggestions || []).length,
                },
            },
            logs: [
                { time: createdAt.toISOString(), action: '生成报告', operator: '系统' },
                { time: new Date(createdAt.getTime() - 40 * 60 * 1000).toISOString(), action: '汇总检测结果', operator: '系统' },
            ],
        };
        task.report = report;
        return report;
    });
}
function buildMockReviews(tasks, config, random) {
    const highRiskTasks = tasks.filter((t) => ['高风险', '严重风险'].includes(t.detectionResult?.riskLevel || ''));
    const mediumTasks = tasks.filter((t) => (t.detectionResult?.riskLevel || '') === '中风险');
    const reviewCandidates = [...highRiskTasks, ...mediumTasks].slice(0, config.reviewCount);
    const pendingCount = 5;
    const reviewers = ['复核人员A', '复核人员B', '管理人员A', '企业管理员A'];
    const processedDecisions = ['通过发布', '退回优化', '暂缓发布'];
    const processedReasons = ['风险词已替换并补充证据', '需要补充参数说明与场景图', '合规风险仍高，建议暂缓投放'];
    return reviewCandidates.map((task, idx) => {
        const submittedAt = new Date(task.updatedAt || task.createdAt);
        submittedAt.setHours(submittedAt.getHours() + 1 + Math.floor(random() * 8));
        const assignee = reviewers[idx % reviewers.length];
        const isPending = idx < pendingCount;
        const decision = isPending ? null : processedDecisions[idx % processedDecisions.length];
        const reason = isPending ? null : processedReasons[idx % processedReasons.length];
        const processedAt = isPending ? null : new Date(submittedAt.getTime() + (8 + Math.floor(random() * 48)) * 3600 * 1000).toISOString();
        const history = [{ time: submittedAt.toISOString(), action: '提交人工复核', note: '系统命中高风险规则，进入人工复核流转。' }];
        if (!isPending) {
            history.unshift({
                time: processedAt || submittedAt.toISOString(),
                action: '人工复核处理',
                decision,
                reason,
                operator: assignee,
            });
        }
        return {
            id: `review-seed-90d-${String(idx + 1).padStart(3, '0')}`,
            reviewId: `review-seed-90d-${String(idx + 1).padStart(3, '0')}`,
            taskId: task.id,
            taskNo: task.taskNo,
            productName: task.productName,
            platform: task.platform,
            market: task.market,
            riskLevel: task.detectionResult?.riskLevel || '高风险',
            systemDecision: task.detectionResult?.decision || '人工复核',
            status: isPending ? '待复核' : idx % 3 === 0 ? '复核通过' : idx % 3 === 1 ? '退回优化' : '暂缓发布',
            submittedAt: submittedAt.toISOString(),
            processor: assignee,
            decision,
            reason,
            processedAt,
            history,
        };
    });
}
function buildMockUsageRecords(tasks, random) {
    const records = [];
    const detectedTasks = tasks.filter((t) => t.detectionResult);
    detectedTasks.forEach((task, idx) => {
        const createdAt = new Date(task.updatedAt || task.createdAt);
        createdAt.setMinutes(createdAt.getMinutes() + Math.floor(random() * 30));
        records.push({
            id: `usage-seed-${String(idx + 1).padStart(3, '0')}`,
            usageType: 'DETECT',
            amount: 1,
            taskId: task.id,
            companyName: '智选优发演示企业',
            planName: '专业版',
            createdAt: createdAt.toISOString(),
        });
    });
    return records.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
function buildMockBatchTasks(config, timeline, random) {
    const records = [];
    for (let i = 0; i < config.batchCount; i += 1) {
        const totalCount = 8 + Math.floor(random() * 13);
        const day = timeline[Math.max(0, timeline.length - 8 - i * 6)];
        const createdAt = new Date(day.date);
        createdAt.setHours(10 + i, 20, 0, 0);
        const items = [];
        let successCount = 0;
        let failedCount = 0;
        for (let row = 0; row < totalCount; row += 1) {
            const forceFail = row === totalCount - 1;
            const shouldFail = forceFail || random() < 0.2;
            if (shouldFail)
                failedCount += 1;
            else
                successCount += 1;
            items.push({
                id: makeId('bitem'),
                rowNo: row + 1,
                payload: {
                    sku: `BATCH-SKU-${i + 1}-${row + 1}`,
                    productName: `批量素材${i + 1}-${row + 1}`,
                    platform: ['Amazon', 'TikTok Shop', 'Shopee'][row % 3],
                    market: ['欧美', '东南亚', '中东'][row % 3],
                    title: `批量任务素材 ${row + 1}`,
                    sellingPoints: '稳定合规\n本土化优化\n多场景适配',
                    detailText: '用于评委演示的批量检测样本',
                    adText: '突出卖点并避免违规表达',
                },
                status: shouldFail ? 'FAILED' : 'DONE',
                taskId: shouldFail ? null : `task-seed-from-batch-${i + 1}-${row + 1}`,
                error: shouldFail ? '图片缺失或字段不完整' : '',
            });
        }
        records.push({
            id: `batch-seed-90d-${String(i + 1).padStart(2, '0')}`,
            name: `活动波峰批量检测-${i + 1}`,
            status: failedCount > 0 ? 'DONE_WITH_ERRORS' : 'DONE',
            totalCount,
            successCount,
            failedCount,
            items,
            createdAt: createdAt.toISOString(),
            updatedAt: new Date(createdAt.getTime() + 2 * 3600 * 1000).toISOString(),
        });
    }
    return records.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
function buildMockMaterialVersions(tasks, config, random) {
    const candidates = tasks.filter((t) => t.materialContent).slice(0, 20);
    const records = [];
    const versionCounter = {};
    candidates.forEach((task) => {
        for (let i = 0; i < 2; i += 1) {
            const v = (versionCounter[task.id] || 0) + 1;
            versionCounter[task.id] = v;
            const baseTime = new Date(task.createdAt);
            baseTime.setHours(baseTime.getHours() + 6 * v + Math.floor(random() * 5));
            records.push({
                id: makeId('mv'),
                taskId: task.id,
                versionNo: v,
                title: `${task.materialContent.title} v${v}`,
                sellingPoints: task.materialContent.sellingPoints,
                detailText: `${task.materialContent.detailText}（第${v}次修订）`,
                adText: `${task.materialContent.adText}（版本${v}）`,
                imageUrls: task.materialContent.imageUrls || [],
                scoreSnapshot: task.detectionResult?.score ?? null,
                riskSnapshot: task.detectionResult?.riskLevel ?? null,
                createdAt: baseTime.toISOString(),
            });
        }
    });
    return records.slice(0, config.materialVersionCount).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
function buildMockLogs(tasks, reports, reviews, timeline, config, random) {
    const logs = [];
    const actors = [
        { username: '系统管理员A', role: 'SYSTEM_ADMIN' },
        { username: '运营人员A', role: 'OPERATOR' },
        { username: '设计人员A', role: 'DESIGNER' },
        { username: '复核人员A', role: 'REVIEWER' },
        { username: '企业管理员A', role: 'ENTERPRISE_ADMIN' },
        { username: '管理人员A', role: 'MANAGER' },
    ];
    const pushLog = (payload) => logs.push({ id: makeId('log'), logId: makeId('log'), ip: '127.0.0.1', result: '成功', ...payload });
    for (let i = 0; i < 26; i += 1) {
        const d = timeline[Math.max(0, timeline.length - 1 - i * 3)]?.date || new Date();
        const actor = actors[i % actors.length];
        pushLog({
            operator: actor.username,
            role: actor.role,
            action: '用户登录',
            target: `${actor.username.toLowerCase().replace('人员', '').replace('管理员', 'admin')}@example.com`,
            note: '日常登录',
            createdAt: new Date(d.getTime() + 9 * 3600 * 1000).toISOString(),
        });
    }
    tasks.forEach((task, idx) => {
        const creator = actors[idx % actors.length];
        pushLog({
            operator: creator.username,
            role: creator.role,
            action: '创建任务',
            target: task.taskNo,
            note: `${task.productName}/${task.platform}/${task.market}`,
            createdAt: task.createdAt,
        });
        if (task.detectionResult) {
            pushLog({
                operator: '系统',
                role: 'SYSTEM_ADMIN',
                action: '启动检测',
                target: task.taskNo,
                note: `${task.detectionResult.riskLevel}/${task.detectionResult.decision}`,
                createdAt: task.detectionResult.detectedAt || task.updatedAt,
            });
        }
    });
    reports.forEach((report) => {
        pushLog({
            operator: '系统',
            role: 'SYSTEM_ADMIN',
            action: '生成审核报告',
            target: report.reportNo,
            note: report.summary,
            createdAt: report.createdAt,
        });
    });
    reviews.forEach((review) => {
        pushLog({
            operator: '系统',
            role: 'SYSTEM_ADMIN',
            action: '提交人工复核',
            target: review.taskNo,
            note: `风险:${review.riskLevel}`,
            createdAt: review.submittedAt,
        });
        if (review.processedAt) {
            pushLog({
                operator: review.processor || '复核人员A',
                role: 'REVIEWER',
                action: '人工复核操作',
                target: review.taskNo,
                note: `${review.decision}/${review.reason}`,
                createdAt: review.processedAt,
            });
        }
    });
    const extraActions = ['规则更新', '规则审批', '套餐变更', '下载报告', '批量任务执行'];
    while (logs.length < config.logCount) {
        const action = extraActions[Math.floor(random() * extraActions.length)];
        const actor = actors[Math.floor(random() * actors.length)];
        const day = timeline[Math.floor(random() * timeline.length)]?.date || new Date();
        const createdAt = new Date(day);
        createdAt.setHours(8 + Math.floor(random() * 12), Math.floor(random() * 60), Math.floor(random() * 60), 0);
        pushLog({
            operator: actor.username,
            role: actor.role,
            action,
            target: action === '下载报告' ? reports[Math.floor(random() * reports.length)]?.reportNo || '-' : `OBJ-${1000 + logs.length}`,
            note: '演示环境运营记录',
            createdAt: createdAt.toISOString(),
        });
    }
    return logs
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, config.logCount);
}
function initMockData() {
    if (mockTasks.length > 0)
        return;
    const random = createSeededRandom(MOCK_SEED_CONFIG.seed);
    const timeline = buildMockTimeline(MOCK_SEED_CONFIG, random);
    mockTasks = buildMockTasks(MOCK_SEED_CONFIG, timeline, random);
    mockReports = buildMockReports(mockTasks, MOCK_SEED_CONFIG, random);
    mockReviews = buildMockReviews(mockTasks, MOCK_SEED_CONFIG, random);
    mockUsageRecords = buildMockUsageRecords(mockTasks, random);
    mockBatchTasks = buildMockBatchTasks(MOCK_SEED_CONFIG, timeline, random);
    mockMaterialVersions = buildMockMaterialVersions(mockTasks, MOCK_SEED_CONFIG, random);
    mockLogs = buildMockLogs(mockTasks, mockReports, mockReviews, timeline, MOCK_SEED_CONFIG, random);
    mockRuleVersions = mockRules.map((r) => ({
        id: makeId('rv'),
        ruleId: r.id,
        version: r.version || 'v1.0.0',
        snapshot: { ...r },
        createdAt: nowIso(),
        createdBy: '系统管理员A',
    }));
    mockRuleApprovals = [
        {
            id: makeId('ra'),
            ruleId: mockRules[0].id,
            ruleName: mockRules[0].name,
            action: 'UPDATE',
            status: 'PENDING',
            version: mockRules[0].version || 'v1.0.0',
            submittedAt: nowIso(),
            submittedBy: '运营人员A',
        },
    ];
    mockCustomers = [
        {
            id: 'cust-1',
            name: '智选优发演示企业',
            plan: '企业版',
            quotaTotal: 5000,
            quotaUsed: 1260,
            expireAt: '2027-01-01',
            memberCount: 24,
            status: '正常',
        },
        {
            id: 'cust-2',
            name: '跨境增长实验室',
            plan: '专业版',
            quotaTotal: 1200,
            quotaUsed: 880,
            expireAt: '2026-10-31',
            memberCount: 9,
            status: '正常',
        },
    ];
    mockPlans = [
        { id: 'plan-1', name: '体验包/按次检测', customerType: '新客户、低频客户、试用客户', priceText: '99元/次 或 299元/10次', billingCycle: '按次', quota: 10, supportedMarkets: 1, canExportReport: false, canBatchDetect: false, canUseApi: false, canPrivateDeploy: false, canUseCustomRules: false, canUseCustomReportTemplate: false, features: { list: ['基础检测', '在线报告查看', '导出受限'] }, sortOrder: 1 },
        { id: 'plan-2', name: '基础版', customerType: '成长型中小卖家、学生实训店铺', priceText: '499元/月 或 4999元/年', billingCycle: '月/年', quota: 200, supportedMarkets: 3, canExportReport: true, canBatchDetect: false, canUseApi: false, canPrivateDeploy: false, canUseCustomRules: false, canUseCustomReportTemplate: false, features: { list: ['基础检测', '基础报告导出'] }, sortOrder: 2 },
        { id: 'plan-3', name: '专业版', customerType: '高频上新卖家、精品店铺、内容运营团队', priceText: '1999元/月 或 19999元/年', billingCycle: '月/年', quota: 1000, supportedMarkets: 8, canExportReport: true, canBatchDetect: true, canUseApi: true, canPrivateDeploy: false, canUseCustomRules: true, canUseCustomReportTemplate: false, features: { list: ['完整报告导出', '批量检测', '增强看板'] }, sortOrder: 3 },
        { id: 'plan-4', name: '企业版', customerType: '代运营机构、大型卖家、多店铺团队', priceText: '5万—8万元/年', billingCycle: '年', quota: 20000, supportedMarkets: 20, canExportReport: true, canBatchDetect: true, canUseApi: true, canPrivateDeploy: false, canUseCustomRules: true, canUseCustomReportTemplate: true, features: { list: ['团队协作', '人工复核流转', '客户报告归档'] }, sortOrder: 4 },
        { id: 'plan-5', name: '定制版', customerType: '品牌企业、产业带机构、外贸服务机构', priceText: '10万—30万元/项目', billingCycle: '项目制', quota: null, supportedMarkets: null, canExportReport: true, canBatchDetect: true, canUseApi: true, canPrivateDeploy: true, canUseCustomRules: true, canUseCustomReportTemplate: true, features: { list: ['私有化部署', '专属规则库', '专属报告模板'] }, sortOrder: 5 },
        { id: 'plan-6', name: 'API接口版', customerType: 'ERP、服务商平台、跨境工具平台', priceText: '5万—10万元/年 或 按调用量', billingCycle: '年/调用量', quota: null, supportedMarkets: null, canExportReport: true, canBatchDetect: true, canUseApi: true, canPrivateDeploy: false, canUseCustomRules: false, canUseCustomReportTemplate: false, features: { list: ['API Key', '调用额度', '接口调用统计'] }, sortOrder: 6 },
    ];
    const pro = mockPlans.find((p) => p.name === '专业版');
    mockSubscriptions = [
        {
            id: 'sub-1',
            companyName: '智选优发演示企业',
            planId: pro?.id,
            status: 'ACTIVE',
            startAt: nowIso(),
            endAt: null,
            quotaTotal: pro?.quota || 1000,
            quotaUsed: mockUsageRecords.length,
            quotaRemaining: Math.max(0, (pro?.quota || 1000) - mockUsageRecords.length),
        },
    ];
    mockCompanies = [
        { id: 'comp-1', name: '智选优发演示企业', industryType: '跨境电商', contactPerson: '张三', contactPhone: '13800000000', targetMarkets: ['欧美', '中东'], planType: '专业版', serviceStatus: '试点中', createdAt: nowIso(), members: 6 },
    ];
    mockReportTemplates = [
        { id: 'tpl-1', name: '标准审核报告模板', code: 'MVP_STANDARD', scope: 'SYSTEM', versionNo: 1, schema: { sections: ['封面', '基础信息', '评分', '风险', '建议', '复核'] } },
    ];
}
initMockData();
function appendLog(action, target, remark) {
    const user = getUserProfile();
    mockLogs.unshift({
        id: makeId('log'),
        logId: makeId('log'),
        operator: user?.username || '当前用户',
        role: user?.role || 'OPERATOR',
        action,
        target,
        targetType: 'RESOURCE',
        targetId: target,
        result: '成功',
        ip: '127.0.0.1',
        note: remark || '',
        createdAt: nextMockIso(),
    });
}
function currentCompanyName() {
    const user = getUserProfile();
    return user?.companyName || '智选优发演示企业';
}
function getCurrentSubscriptionMock() {
    const companyName = currentCompanyName();
    let sub = mockSubscriptions.find((s) => s.companyName === companyName && s.status === 'ACTIVE');
    if (!sub) {
        const fallback = mockPlans.find((p) => p.name === '专业版') || mockPlans[0];
        sub = {
            id: makeId('sub'),
            companyName,
            planId: fallback?.id,
            status: 'ACTIVE',
            startAt: nowIso(),
            endAt: null,
            quotaTotal: fallback?.quota || 1000,
            quotaUsed: 0,
            quotaRemaining: fallback?.quota || 1000,
        };
        mockSubscriptions.unshift(sub);
    }
    const plan = mockPlans.find((p) => p.id === sub?.planId) || null;
    return { sub, plan };
}
function resolveMockRoleByEmail(email) {
    const v = (email || '').toLowerCase();
    if (v.includes('sysadmin'))
        return 'SYSTEM_ADMIN';
    if (v.includes('enterprise'))
        return 'ENTERPRISE_ADMIN';
    if (v.includes('operator'))
        return 'OPERATOR';
    if (v.includes('designer'))
        return 'DESIGNER';
    if (v.includes('reviewer'))
        return 'REVIEWER';
    if (v.includes('manager'))
        return 'MANAGER';
    return 'OPERATOR';
}
export function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
export function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
export function setUserProfile(user) { localStorage.setItem(USER_KEY, JSON.stringify(user || {})); }
export function getUserProfile() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function clearToken() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
async function request(path, method, body) {
    const token = getToken();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
    }
    catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new ApiError('请求超时，请稍后重试');
        }
        throw new ApiError('网络异常，请检查网络或稍后重试');
    }
    finally {
        window.clearTimeout(timeout);
    }
    const raw = (await response.json().catch(() => ({})));
    if (!response.ok) {
        if (response.status === 401)
            clearToken();
        throw new ApiError(raw.message || '请求失败', response.status);
    }
    if (typeof raw.code === 'number') {
        if (raw.code !== 0)
            throw new ApiError(raw.message || '请求失败', response.status);
        return raw.data;
    }
    return raw;
}
async function run(live, mock) {
    startGlobalLoading();
    try {
        if (USE_MOCK)
            return await mock();
        return await live();
    }
    finally {
        endGlobalLoading();
    }
}
function toRiskText(value) {
    const v = String(value || '').toUpperCase();
    if (v === 'LOW' || String(value).includes('低'))
        return '低风险';
    if (v === 'MEDIUM' || String(value).includes('中'))
        return '中风险';
    if (v === 'HIGH' || String(value).includes('高'))
        return '高风险';
    if (String(value).includes('严重'))
        return '严重风险';
    return String(value || '-');
}
function toDecisionText(value) {
    const v = String(value || '').toUpperCase();
    if (v === 'APPROVE' || String(value).includes('可发布'))
        return '可发布';
    if (v === 'OPTIMIZE_AND_REVIEW' || String(value).includes('优化'))
        return '优化后发布';
    if (v === 'REJECT' || String(value).includes('复核'))
        return '人工复核';
    if (v === 'HOLD' || String(value).includes('暂缓'))
        return '暂缓发布';
    return String(value || '-');
}
function parsePsObjectString(text) {
    const raw = text.trim();
    if (!raw.startsWith('@{') || !raw.endsWith('}'))
        return null;
    const body = raw.slice(2, -1).trim();
    if (!body)
        return {};
    const result = {};
    for (const part of body.split(';')) {
        const p = part.trim();
        if (!p)
            continue;
        const idx = p.indexOf('=');
        if (idx <= 0)
            continue;
        const key = p.slice(0, idx).trim();
        const val = p.slice(idx + 1).trim();
        result[key] = val;
    }
    return result;
}
function normalizeUnknownObject(value, fallback) {
    if (value == null)
        return fallback;
    if (typeof value === 'object')
        return value;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed)
            return fallback;
        try {
            return JSON.parse(trimmed);
        }
        catch {
            const parsed = parsePsObjectString(trimmed);
            if (parsed)
                return parsed;
        }
    }
    return fallback;
}
function normalizeObjectArray(value) {
    if (Array.isArray(value)) {
        return value.map((item) => {
            if (typeof item === 'object' && item)
                return item;
            if (typeof item === 'string')
                return parsePsObjectString(item) || { value: item };
            return { value: String(item ?? '') };
        });
    }
    if (typeof value === 'string') {
        const parsed = normalizeUnknownObject(value, []);
        return Array.isArray(parsed) ? parsed : [];
    }
    return [];
}
function normalizeDetectionResult(raw) {
    if (!raw)
        return null;
    const parsed = normalizeUnknownObject(raw, {});
    const totalScore = Number(parsed.totalScore ?? parsed.score ?? 0);
    return {
        ...parsed,
        score: Number(parsed.score ?? totalScore),
        totalScore,
        riskLevel: toRiskText(parsed.riskLevel),
        decision: toDecisionText(parsed.decision),
        issues: normalizeObjectArray(parsed.issues),
        suggestions: normalizeObjectArray(parsed.suggestions),
        matchedRules: normalizeObjectArray(parsed.matchedRules),
        dimensionScores: {
            completeness: parsed.dimensionScores?.completeness ?? parsed.completenessScore ?? '-',
            accuracy: parsed.dimensionScores?.accuracy ?? parsed.accuracyScore ?? '-',
            compliance: parsed.dimensionScores?.compliance ?? parsed.complianceScore ?? '-',
            attractiveness: parsed.dimensionScores?.attractiveness ?? parsed.attractivenessScore ?? '-',
            localization: parsed.dimensionScores?.localization ?? parsed.localizationScore ?? '-',
        },
    };
}
function normalizeTask(raw) {
    if (!raw)
        return raw;
    return {
        ...raw,
        detectionResult: normalizeDetectionResult(raw.detectionResult),
        report: raw.report ? normalizeReport(raw.report) : raw.report,
    };
}
function normalizeReport(raw) {
    if (!raw)
        return raw;
    const content = normalizeUnknownObject(raw.content, {});
    const contentTask = normalizeUnknownObject(content.task, {});
    const contentResult = normalizeDetectionResult(content.result);
    const directResult = normalizeDetectionResult(raw.result);
    const taskResult = normalizeDetectionResult(raw.task?.detectionResult);
    return {
        ...raw,
        content,
        task: raw.task || contentTask || undefined,
        result: directResult || contentResult || taskResult || null,
        logs: Array.isArray(raw.logs) ? raw.logs : [],
    };
}
function normalizeRule(raw) {
    if (!raw)
        return raw;
    const keywordsParsed = normalizeUnknownObject(raw.keywords, raw.keywords);
    const keywords = Array.isArray(keywordsParsed)
        ? keywordsParsed.map((x) => String(x))
        : typeof keywordsParsed === 'string'
            ? keywordsParsed.split(/[，,]/).map((x) => x.trim()).filter(Boolean)
            : [];
    const typeMap = {
        PLATFORM: 'PLATFORM',
        MARKET_CULTURE: 'MARKET_CULTURE',
        CATEGORY: 'CATEGORY',
        SENSITIVE_WORD: 'SENSITIVE_WORD',
    };
    return {
        ...raw,
        type: typeMap[String(raw.type || '').toUpperCase()] || raw.type || '-',
        riskLevel: String(raw.riskLevel || '').toUpperCase() || raw.riskLevel || '-',
        keywords,
        status: raw.enabled === false ? '停用' : raw.status || '启用',
    };
}
function ensureDetection(task) {
    const score = Math.floor(45 + Math.random() * 51);
    const riskLevel = riskByScore(score);
    const decision = decisionByRisk(riskLevel);
    const explanation = `综合分${score}，主要基于素材完整性、准确性、规范性、吸引力、市场适配5个维度评估。`;
    return {
        score,
        totalScore: score,
        detectedAt: nowIso(),
        dimensionScores: {
            completeness: Math.min(100, score + 3),
            accuracy: Math.max(60, score - 5),
            compliance: Math.max(55, score - 8),
            attractiveness: Math.max(60, score - 2),
            localization: Math.max(58, score - 4),
        },
        riskLevel,
        decision,
        issues: [
            {
                position: 'title',
                type: '表达风险',
                riskLevel: riskLevel === '低风险' ? '中风险' : riskLevel,
                hitContent: '最强',
                description: '存在绝对化表达。',
                suggestion: '改为客观、可验证描述。',
            },
        ],
        suggestions: [
            { target: 'title', problem: '绝对化表达', suggestion: '改为可量化或客观描述。', recommendedText: '性能稳定，满足日常高频使用。' },
            { target: 'sellingPoints', problem: '卖点结构分散', suggestion: '按功能/场景/保障重组。' },
        ],
        titleVariants: [
            `${task.productName} 轻量便携款`,
            `${task.productName} 多场景适配版`,
            `${task.productName} 高性价比优选`,
        ],
        sellingPointRewrite: {
            before: task.materialContent?.sellingPoints || [],
            after: ['核心功能突出', '场景明确', '售后保障表达清晰'],
        },
        parseResult: {
            text: {
                keywords: ['便携', '高续航', '快充'],
                sensitiveWords: ['最强'],
                promiseExpressions: ['立刻见效'],
                language: 'zh-CN',
            },
            image: {
                objects: ['商品主体', '场景背景', '文字标识'],
                colors: ['蓝色', '白色'],
                ocrText: ['新品', '限时'],
                risks: ['疑似文字占比过高'],
            },
        },
        optimization: {
            titleVariants: [
                `${task.productName} 轻量便携款`,
                `${task.productName} 多场景适配版`,
                `${task.productName} 高性价比优选`,
            ],
            sellingPointRewrite: {
                before: task.materialContent?.sellingPoints || [],
                after: ['核心卖点前置', '场景化描述增强', '保障条款更清晰'],
            },
            detailStructureAdvice: {
                missingModules: ['规格参数', '使用说明'],
                suggestions: ['补全核心参数表', '增加使用步骤和注意事项'],
            },
            adCopyVariants: [
                { style: '正式', text: `${task.productName}，满足多场景稳定使用需求。` },
                { style: '亲和', text: `带上${task.productName}，随时享受便捷体验。` },
                { style: '促销', text: `${task.productName}限时优惠中，立即抢购。` },
            ],
        },
        explanation,
    };
}
export const api = {
    logout() {
        appendLog('用户退出', getUserProfile()?.email || '当前用户');
        clearToken();
    },
    register(payload) {
        return run(() => request('/auth/register', 'POST', payload), () => {
            const user = { id: makeId('user'), username: payload.username, email: payload.email, role: 'OPERATOR', companyName: payload.companyName || '智选优发演示企业' };
            mockUsers.push(user);
            return user;
        });
    },
    login(payload) {
        return run(async () => {
            const result = await request('/auth/login', 'POST', payload);
            setToken(result.accessToken);
            setUserProfile(result.user);
            return result;
        }, async () => {
            const email = (payload.email || '').trim();
            const password = (payload.password || '').trim();
            if (!email || !password) {
                throw new ApiError('请输入邮箱和密码');
            }
            if (password !== '123456') {
                throw new ApiError('账号或密码错误');
            }
            const role = resolveMockRoleByEmail(payload.email);
            const user = mockUsers.find((u) => u.email === email) || {
                id: makeId('user'),
                username: email.split('@')[0],
                email,
                role,
                companyName: '智选优发演示企业',
            };
            const result = { accessToken: 'mock-token', user };
            setToken(result.accessToken);
            setUserProfile(result.user);
            appendLog('用户登录', email, 'Mock 登录成功');
            return result;
        });
    },
    forgotPassword(payload) {
        return run(() => request('/auth/forgot-password', 'POST', payload), () => ({ success: true, message: '重置口令已生成（演示）', resetToken: 'DEMO2026' }));
    },
    resetPassword(payload) {
        return run(() => request('/auth/reset-password', 'POST', payload), () => ({ success: true, message: '密码重置成功（演示）' }));
    },
    getTaskList() {
        return run(async () => {
            const data = await request('/tasks', 'GET');
            const items = Array.isArray(data) ? data : (data.items || []);
            return items.map(normalizeTask);
        }, () => mockTasks);
    },
    getTaskDetail(taskId) {
        return run(async () => normalizeTask(await request(`/tasks/${taskId}`, 'GET')), () => mockTasks.find((t) => t.id === taskId));
    },
    createTask(payload) {
        return run(() => request('/tasks', 'POST', payload), () => {
            const user = getUserProfile();
            const bypass = user?.role === 'SYSTEM_ADMIN' || user?.role === 'ADMIN';
            const { sub } = getCurrentSubscriptionMock();
            if (!bypass && sub.quotaRemaining <= 0) {
                throw new ApiError('当前套餐检测额度不足，请升级套餐或联系团队开通试点额度');
            }
            const createdAt = nextMockIso();
            const updatedAt = nextMockIso(30000 + Math.floor(Math.random() * 90000));
            const task = {
                id: makeId('task'),
                taskNo: nextMockNo('TSK'),
                status: 'DRAFT',
                createdAt,
                updatedAt,
                ...payload,
                materialContent: {
                    title: payload.title,
                    sellingPoints: payload.sellingPoints.split('\n').filter(Boolean),
                    detailText: payload.detailText,
                    adText: payload.adText,
                    videoScript: payload.videoScript || '',
                    mainImageUrls: payload.mainImageUrls || [],
                    sceneImageUrls: payload.sceneImageUrls || [],
                    imageUrls: payload.imageUrls || [...(payload.mainImageUrls || []), ...(payload.sceneImageUrls || [])],
                },
            };
            mockTasks.unshift(task);
            appendLog('创建任务', task.id, payload.productName);
            return task;
        });
    },
    updateTask(taskId, payload) {
        return run(() => request(`/tasks/${taskId}`, 'PATCH', payload), () => {
            mockTasks = mockTasks.map((t) => (t.id === taskId ? { ...t, ...payload, updatedAt: nowIso() } : t));
            appendLog('编辑任务', taskId);
            return mockTasks.find((t) => t.id === taskId);
        });
    },
    updateTaskStatus(taskId, status) {
        return run(() => request(`/tasks/${taskId}/status`, 'PATCH', { status }), () => {
            mockTasks = mockTasks.map((t) => (t.id === taskId ? { ...t, status, updatedAt: nowIso() } : t));
            return { id: taskId, status };
        });
    },
    deleteTask(taskId) {
        return run(() => request(`/tasks/${taskId}`, 'DELETE'), () => {
            mockTasks = mockTasks.filter((t) => t.id !== taskId);
            mockReports = mockReports.filter((r) => r.taskId !== taskId);
            mockReviews = mockReviews.filter((r) => r.taskId !== taskId);
            appendLog('删除任务', taskId);
            return { success: true, id: taskId };
        });
    },
    saveTaskMaterials(taskId, payload) {
        return run(() => request(`/tasks/${taskId}/materials`, 'POST', payload), () => {
            mockTasks = mockTasks.map((t) => (t.id === taskId ? { ...t, materialContent: { ...(t.materialContent || {}), ...payload }, updatedAt: nowIso() } : t));
            appendLog('上传素材', taskId);
            return { taskId, ...payload };
        });
    },
    analyzeTask(taskId, modelConfig) {
        return run(() => request(`/tasks/${taskId}/detect`, 'POST', modelConfig || {}), () => {
            const task = mockTasks.find((t) => t.id === taskId);
            if (!task)
                throw new ApiError('任务不存在');
            const user = getUserProfile();
            const bypass = user?.role === 'SYSTEM_ADMIN' || user?.role === 'ADMIN';
            const { sub, plan } = getCurrentSubscriptionMock();
            if (!bypass && sub.quotaRemaining <= 0) {
                throw new ApiError('当前套餐检测额度不足，请升级套餐或联系团队开通试点额度');
            }
            const result = ensureDetection(task);
            const detectAt = nextMockIso(40000 + Math.floor(Math.random() * 140000));
            result.detectedAt = detectAt;
            task.detectionResult = result;
            task.status = 'COMPLETED';
            task.updatedAt = detectAt;
            if (!bypass) {
                sub.quotaUsed += 1;
                sub.quotaRemaining = Math.max(0, sub.quotaRemaining - 1);
                mockUsageRecords.unshift({
                    id: makeId('usage'),
                    usageType: 'DETECT',
                    amount: 1,
                    taskId,
                    companyName: sub.companyName,
                    planName: plan?.name || '-',
                    createdAt: nextMockIso(20000 + Math.floor(Math.random() * 70000)),
                });
            }
            if (result.decision === '人工复核') {
                const reviewSubmitAt = nextMockIso(30000 + Math.floor(Math.random() * 120000));
                const review = {
                    id: makeId('review'),
                    reviewId: makeId('review'),
                    taskId,
                    taskNo: task.taskNo,
                    productName: task.productName,
                    platform: task.platform,
                    market: task.market,
                    riskLevel: result.riskLevel,
                    systemDecision: result.decision,
                    status: '待复核',
                    submittedAt: reviewSubmitAt,
                    history: [],
                };
                mockReviews.unshift(review);
            }
            appendLog('启动检测', taskId);
            return result;
        });
    },
    getDetectionResult(taskId) {
        return run(async () => normalizeDetectionResult(await request(`/tasks/${taskId}/result`, 'GET')), () => {
            const task = mockTasks.find((t) => t.id === taskId);
            if (!task)
                throw new ApiError('任务不存在');
            if (!task.detectionResult)
                task.detectionResult = ensureDetection(task);
            return task.detectionResult;
        });
    },
    requestManualReview(taskId, note) {
        return run(() => request(`/tasks/${taskId}/manual-review`, 'POST', { note }), () => {
            const task = mockTasks.find((t) => t.id === taskId);
            if (!task)
                throw new ApiError('任务不存在');
            task.status = 'REVIEW_REQUIRED';
            const submittedAt = nextMockIso(35000 + Math.floor(Math.random() * 110000));
            if (!mockReviews.some((r) => r.taskId === taskId)) {
                mockReviews.unshift({
                    id: makeId('review'),
                    reviewId: makeId('review'),
                    taskId,
                    taskNo: task.taskNo,
                    productName: task.productName,
                    platform: task.platform,
                    market: task.market,
                    riskLevel: task.detectionResult?.riskLevel || '高风险',
                    systemDecision: task.detectionResult?.decision || '人工复核',
                    status: '待复核',
                    submittedAt,
                    history: [{ time: submittedAt, action: '提交人工复核', note: note || '' }],
                });
            }
            appendLog('提交人工复核', taskId, note);
            return { taskId, reviewRequested: true, note: note || '已提交人工复核' };
        });
    },
    generateReport(taskId) {
        return run(() => request(`/tasks/${taskId}/report`, 'POST'), async () => {
            const task = mockTasks.find((t) => t.id === taskId);
            if (!task)
                throw new ApiError('任务不存在');
            const result = await api.getDetectionResult(taskId);
            const reportCreatedAt = nextMockIso(40000 + Math.floor(Math.random() * 130000));
            const report = {
                id: makeId('report'),
                taskId,
                reportNo: nextMockNo('RPT'),
                title: `${task.productName} 审核报告`,
                summary: `综合评分 ${result.totalScore}，建议 ${result.decision}`,
                createdAt: reportCreatedAt,
                updatedAt: reportCreatedAt,
                task,
                result,
                logs: [{ time: reportCreatedAt, action: '生成报告', operator: '系统' }],
            };
            mockReports.unshift(report);
            task.report = report;
            appendLog('生成审核报告', taskId, report.reportNo);
            return report;
        });
    },
    getReportList(params) {
        return run(async () => {
            const q = new URLSearchParams();
            if (params?.page)
                q.set('page', String(params.page));
            if (params?.pageSize)
                q.set('pageSize', String(params.pageSize));
            if (params?.platform)
                q.set('platform', params.platform);
            if (params?.market)
                q.set('market', params.market);
            if (params?.riskLevel)
                q.set('riskLevel', params.riskLevel);
            if (params?.keyword)
                q.set('keyword', params.keyword);
            const path = q.size ? `/reports?${q.toString()}` : '/reports';
            const data = await request(path, 'GET');
            const items = Array.isArray(data) ? data : (data.items || []);
            return items.map(normalizeReport);
        }, () => mockReports);
    },
    getReportDetail(reportId) {
        return run(async () => normalizeReport(await request(`/reports/${reportId}`, 'GET')), () => mockReports.find((r) => r.id === reportId));
    },
    deleteReport(reportId) {
        return run(() => request(`/reports/${reportId}`, 'DELETE'), () => {
            mockReports = mockReports.filter((r) => r.id !== reportId);
            appendLog('删除报告', reportId);
            return { success: true, id: reportId };
        });
    },
    async downloadReport(reportId, format = 'pdf') {
        if (USE_MOCK) {
            const report = mockReports.find((r) => r.id === reportId);
            if (!report)
                throw new ApiError('报告不存在');
            const user = getUserProfile();
            const bypass = user?.role === 'SYSTEM_ADMIN' || user?.role === 'ADMIN';
            const { plan } = getCurrentSubscriptionMock();
            if (!bypass && plan?.name?.includes('体验包')) {
                throw new ApiError('当前套餐仅支持在线查看报告，导出请升级套餐');
            }
            const payload = JSON.stringify(report, null, 2);
            const mimeByFormat = {
                pdf: 'application/pdf',
                docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                json: 'application/json',
            };
            const blob = new Blob([payload], { type: mimeByFormat[format] || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const filename = `${report.reportNo || reportId}.${format}`;
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            link.remove();
            // Fallback for webviews that block download attribute silently.
            setTimeout(() => {
                try {
                    URL.revokeObjectURL(url);
                }
                catch { }
            }, 2000);
            appendLog('下载报告', reportId, format);
            return;
        }
        const token = getToken();
        const detail = (await api.getReportDetail(reportId));
        const response = await fetch(`${API_BASE_URL}/reports/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ taskId: detail?.taskId || detail?.task?.id || reportId, format }),
        });
        if (!response.ok) {
            const raw = await response.json().catch(() => ({}));
            throw new ApiError(raw?.message || '下载失败', response.status);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${reportId}.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    },
    getRules() {
        return run(async () => (await request('/rules', 'GET')).map(normalizeRule), () => mockRules);
    },
    createRule(payload) {
        return run(async () => normalizeRule(await request('/rules', 'POST', payload)), () => {
            const rule = { ...payload, id: makeId('rule'), ruleId: makeId('rule'), updatedAt: nowIso(), status: payload.status || '启用' };
            mockRules.unshift(rule);
            mockRuleVersions.unshift({
                id: makeId('rv'),
                ruleId: rule.id,
                version: rule.version || 'v1.0.0',
                snapshot: { ...rule },
                createdAt: nowIso(),
                createdBy: getUserProfile()?.username || '当前用户',
            });
            mockRuleApprovals.unshift({
                id: makeId('ra'),
                ruleId: rule.id,
                ruleName: rule.name,
                action: 'CREATE',
                status: 'PENDING',
                version: rule.version || 'v1.0.0',
                submittedAt: nowIso(),
                submittedBy: getUserProfile()?.username || '当前用户',
            });
            appendLog('新增规则', rule.id, rule.name);
            return rule;
        });
    },
    updateRule(ruleId, payload) {
        return run(async () => normalizeRule(await request(`/rules/${ruleId}`, 'PATCH', payload)), () => {
            let updated = null;
            mockRules = mockRules.map((r) => {
                if (r.id === ruleId || r.ruleId === ruleId) {
                    updated = { ...r, ...payload, updatedAt: nowIso() };
                    return updated;
                }
                return r;
            });
            if (updated) {
                mockRuleVersions.unshift({
                    id: makeId('rv'),
                    ruleId: updated.id,
                    version: updated.version || 'v1.0.0',
                    snapshot: { ...updated },
                    createdAt: nowIso(),
                    createdBy: getUserProfile()?.username || '当前用户',
                });
                mockRuleApprovals.unshift({
                    id: makeId('ra'),
                    ruleId: updated.id,
                    ruleName: updated.name,
                    action: 'UPDATE',
                    status: 'PENDING',
                    version: updated.version || 'v1.0.0',
                    submittedAt: nowIso(),
                    submittedBy: getUserProfile()?.username || '当前用户',
                });
            }
            return updated;
        });
    },
    deleteRule(ruleId) {
        return run(() => request(`/rules/${ruleId}`, 'DELETE'), () => {
            mockRules = mockRules.filter((r) => r.id !== ruleId && r.ruleId !== ruleId);
            return { id: ruleId, success: true };
        });
    },
    getRuleApprovals() {
        return Promise.resolve(mockRuleApprovals);
    },
    approveRule(approvalId, approved, comment) {
        const item = mockRuleApprovals.find((a) => a.id === approvalId);
        if (!item)
            throw new ApiError('审批记录不存在');
        item.status = approved ? 'APPROVED' : 'REJECTED';
        item.comment = comment || '';
        item.reviewedAt = nowIso();
        item.reviewedBy = getUserProfile()?.username || '当前用户';
        appendLog('规则审批', item.ruleId, `${item.status}`);
        return Promise.resolve(item);
    },
    getRuleVersions(ruleId) {
        return run(() => request(`/rules/${ruleId}/versions`, 'GET'), () => Promise.resolve(mockRuleVersions.filter((v) => v.ruleId === ruleId)));
    },
    rollbackRuleVersion(ruleId, versionId) {
        return run(() => request(`/rules/${ruleId}/clone-version`, 'POST', { createdBy: getUserProfile()?.username || '当前用户', note: `rollback:${versionId}` }), () => {
            const target = mockRuleVersions.find((v) => v.id === versionId && v.ruleId === ruleId);
            if (!target)
                throw new ApiError('版本不存在');
            mockRules = mockRules.map((r) => (r.id === ruleId ? { ...target.snapshot, updatedAt: nowIso() } : r));
            appendLog('规则回滚', ruleId, target.version);
            return mockRules.find((r) => r.id === ruleId);
        });
    },
    getCustomers() {
        return Promise.resolve(mockCustomers);
    },
    updateCustomerPlan(customerId, payload) {
        const item = mockCustomers.find((c) => c.id === customerId);
        if (!item)
            throw new ApiError('客户不存在');
        Object.assign(item, payload);
        appendLog('客户套餐调整', customerId, JSON.stringify(payload));
        return Promise.resolve(item);
    },
    getPlans() {
        return run(() => request('/plans', 'GET'), () => ({ notice: '当前为演示版套餐体系，真实支付、合同开通和企业定制将在商业化阶段接入。', plans: mockPlans }));
    },
    getMySubscription() {
        return run(() => request('/subscription/me', 'GET'), () => {
            const { sub, plan } = getCurrentSubscriptionMock();
            const planName = plan?.name || '';
            let suggestion = '如需API接口或私有化部署，可申请API接口版或定制版服务。';
            if (planName.includes('体验包') || planName.includes('基础版'))
                suggestion = '升级专业版可获得批量检测、完整报告导出和增强数据看板。';
            else if (planName.includes('专业版'))
                suggestion = '升级企业版可获得多账号团队、人工复核流转和客户报告归档。';
            return {
                notice: '当前为演示版套餐体系，真实支付、合同开通和企业定制将在商业化阶段接入。',
                companyName: currentCompanyName(),
                isUnlimited: ['SYSTEM_ADMIN', 'ADMIN'].includes(String(getUserProfile()?.role || '')),
                subscription: { ...sub, plan },
                suggestion,
            };
        });
    },
    getSubscriptionUsage() {
        return run(() => request('/subscription/usage', 'GET'), () => {
            const { sub, plan } = getCurrentSubscriptionMock();
            const currentMonth = nowIso().slice(0, 7);
            const monthlyUsed = mockUsageRecords.filter((x) => String(x.createdAt || '').startsWith(currentMonth)).length;
            return {
                subscription: { ...sub, plan },
                monthlyUsed,
                quotaTotal: sub.quotaTotal,
                quotaUsed: sub.quotaUsed,
                quotaRemaining: sub.quotaRemaining,
                privileges: {
                    canExportReport: !!plan?.canExportReport,
                    canBatchDetect: !!plan?.canBatchDetect,
                    canUseApi: !!plan?.canUseApi,
                    canPrivateDeploy: !!plan?.canPrivateDeploy,
                    canUseCustomRules: !!plan?.canUseCustomRules,
                    canUseCustomReportTemplate: !!plan?.canUseCustomReportTemplate,
                },
            };
        });
    },
    selectSubscription(planName) {
        return run(() => request('/subscription/select', 'POST', { planName }), () => {
            const plan = mockPlans.find((p) => p.name === planName);
            if (!plan)
                throw new ApiError('套餐不存在');
            const { sub } = getCurrentSubscriptionMock();
            sub.planId = plan.id;
            sub.quotaTotal = plan.quota || 0;
            sub.quotaUsed = 0;
            sub.quotaRemaining = plan.quota || 0;
            sub.updatedAt = nowIso();
            return { subscription: { ...sub, plan } };
        });
    },
    upgradeSubscription(planName) {
        return run(() => request('/subscription/upgrade', 'POST', { planName }), () => api.selectSubscription(planName));
    },
    quotaCheck() {
        return run(() => request('/tasks/quota-check', 'POST'), async () => {
            const usage = await api.getSubscriptionUsage();
            return {
                quotaTotal: usage.quotaTotal,
                quotaUsed: usage.quotaUsed,
                quotaRemaining: usage.quotaRemaining,
                planName: usage.subscription?.plan?.name || '-',
                message: usage.quotaRemaining > 0 ? '额度充足' : '当前套餐检测额度不足，请升级套餐或联系团队开通试点额度',
            };
        });
    },
    async uploadFile(file, taskId) {
        startGlobalLoading();
        try {
            if (USE_MOCK) {
                const rec = {
                    id: makeId('file'),
                    userId: getUserProfile()?.id || 'mock-user',
                    taskId: taskId || '',
                    originalName: file.name,
                    fileName: `${Date.now()}-${file.name}`,
                    mimeType: file.type || 'image/*',
                    size: file.size,
                    storageProvider: 'local',
                    storagePath: `/uploads/${Date.now()}-${file.name}`,
                    url: URL.createObjectURL(file),
                    createdAt: nowIso(),
                };
                mockFiles.unshift(rec);
                appendLog('上传素材文件', rec.id, rec.originalName);
                return rec;
            }
            const token = getToken();
            const formData = new FormData();
            formData.append('file', file);
            const q = taskId ? `?taskId=${encodeURIComponent(taskId)}` : '';
            const response = await fetch(`${API_BASE_URL}/files/upload${q}`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: formData,
            });
            const raw = await response.json();
            if (!response.ok || raw?.code !== 0)
                throw new ApiError(raw?.message || '上传失败');
            return raw.data;
        }
        finally {
            endGlobalLoading();
        }
    },
    getFiles(taskId) {
        return run(() => request(taskId ? `/files?taskId=${encodeURIComponent(taskId)}` : '/files', 'GET'), () => taskId ? mockFiles.filter((f) => f.taskId === taskId) : mockFiles);
    },
    applyCommercial(payload) {
        return run(() => request('/commercial/apply', 'POST', payload), () => ({ submitted: true, message: '已提交试点申请。当前功能属于商业化阶段规划，团队会线下联系开通。' }));
    },
    getCompanies() {
        return run(() => request('/companies', 'GET'), () => mockCompanies);
    },
    createCompany(payload) {
        return run(() => request('/companies', 'POST', payload), () => {
            const item = { id: makeId('comp'), createdAt: nowIso(), ...payload };
            mockCompanies.unshift(item);
            return item;
        });
    },
    deleteCompany(companyId) {
        return run(() => request(`/companies/${companyId}`, 'DELETE'), () => {
            const idx = mockCompanies.findIndex((x) => x.id === companyId);
            if (idx < 0)
                throw new ApiError('企业不存在');
            mockCompanies.splice(idx, 1);
            return { id: companyId, success: true };
        });
    },
    addCompanyMember(companyId, userId, role) {
        return run(() => request(`/companies/${companyId}/members`, 'POST', { userId, role }), () => ({ companyId, userId, role, status: 'ACTIVE' }));
    },
    getCustomersList(params) {
        return run(() => {
            const q = new URLSearchParams();
            if (params?.keyword)
                q.set('keyword', params.keyword);
            if (params?.serviceStatus)
                q.set('serviceStatus', params.serviceStatus);
            const path = q.size ? `/customers?${q.toString()}` : '/customers';
            return request(path, 'GET');
        }, () => mockCustomers);
    },
    createCustomer(payload) {
        return run(() => request('/customers', 'POST', payload), () => {
            const item = { id: makeId('cust'), createdAt: nowIso(), updatedAt: nowIso(), ...payload };
            mockCustomers.unshift(item);
            return item;
        });
    },
    updateCustomer(customerId, payload) {
        return run(() => request(`/customers/${customerId}`, 'PATCH', payload), () => {
            const item = mockCustomers.find((x) => x.id === customerId);
            if (!item)
                throw new ApiError('客户不存在');
            Object.assign(item, payload, { updatedAt: nowIso() });
            return item;
        });
    },
    getBatchTasks() {
        return run(() => request('/batch-tasks', 'GET'), () => mockBatchTasks);
    },
    getBatchTaskDetail(batchId) {
        return run(() => request(`/batch-tasks/${batchId}`, 'GET'), () => {
            const item = mockBatchTasks.find((x) => x.id === batchId);
            if (!item)
                throw new ApiError('批量任务不存在');
            return item;
        });
    },
    createBatchTask(payload) {
        return run(() => request('/batch-tasks', 'POST', payload), () => {
            const item = {
                id: makeId('batch'),
                name: payload.name,
                status: 'PENDING',
                totalCount: payload.items?.length || 0,
                successCount: 0,
                failedCount: 0,
                items: (payload.items || []).map((it, idx) => ({ id: makeId('bitem'), rowNo: idx + 1, payload: it, status: 'PENDING' })),
                createdAt: nowIso(),
            };
            mockBatchTasks.unshift(item);
            return item;
        });
    },
    runBatchTask(batchId) {
        return run(() => request(`/batch-tasks/${batchId}/run`, 'POST'), async () => {
            const batch = mockBatchTasks.find((x) => x.id === batchId);
            if (!batch)
                throw new ApiError('批量任务不存在');
            batch.status = 'RUNNING';
            let success = 0;
            let failed = 0;
            for (const row of batch.items || []) {
                try {
                    const p = row.payload || {};
                    const task = await api.createTask({
                        sku: p.sku || `BATCH-${Date.now()}`,
                        productName: p.productName,
                        category: p.category,
                        platform: p.platform,
                        market: p.market,
                        purpose: p.purpose,
                        title: p.title,
                        sellingPoints: p.sellingPoints,
                        detailText: p.detailText,
                        adText: p.adText,
                    });
                    await api.analyzeTask(task.id);
                    row.status = 'DONE';
                    row.taskId = task.id;
                    success += 1;
                }
                catch (e) {
                    row.status = 'FAILED';
                    row.errorMsg = e?.message || '失败';
                    failed += 1;
                }
            }
            batch.successCount = success;
            batch.failedCount = failed;
            batch.status = failed > 0 ? (success > 0 ? 'PARTIAL_FAILED' : 'FAILED') : 'DONE';
            return batch;
        });
    },
    getMaterialVersions(taskId) {
        return run(() => request(`/tasks/${taskId}/material-versions`, 'GET'), () => mockMaterialVersions.filter((x) => x.taskId === taskId).sort((a, b) => b.versionNo - a.versionNo));
    },
    snapshotMaterialVersion(taskId, payload) {
        return run(() => request(`/tasks/${taskId}/material-versions`, 'POST', payload), () => {
            const history = mockMaterialVersions.filter((x) => x.taskId === taskId);
            const versionNo = (history[0]?.versionNo || 0) + 1;
            const task = mockTasks.find((t) => t.id === taskId);
            const rec = {
                id: makeId('mv'),
                taskId,
                versionNo,
                title: payload.title ?? task?.materialContent?.title ?? '',
                sellingPoints: payload.sellingPoints ?? task?.materialContent?.sellingPoints ?? '',
                detailText: payload.detailText ?? task?.materialContent?.detailText ?? '',
                adText: payload.adText ?? task?.materialContent?.adText ?? '',
                imageUrls: payload.imageUrls ?? task?.materialContent?.imageUrls ?? [],
                scoreSnapshot: task?.detectionResult?.score ?? task?.detectionResult?.totalScore ?? null,
                riskSnapshot: task?.detectionResult?.riskLevel ?? null,
                createdAt: nowIso(),
            };
            mockMaterialVersions.unshift(rec);
            return rec;
        });
    },
    getModelConfig() {
        return run(() => request('/model-config/me', 'GET'), () => ({
            enabled: false,
            provider: 'OPENAI_COMPATIBLE',
            apiUrl: '',
            modelName: 'gpt-4.1-mini',
            hasApiKey: false,
            maskedApiKey: '',
        }));
    },
    saveModelConfig(payload) {
        return run(() => request('/model-config/me', 'PATCH', payload), () => ({
            enabled: !!payload.enabled,
            provider: payload.provider || 'OPENAI_COMPATIBLE',
            apiUrl: payload.apiUrl || '',
            modelName: payload.modelName || 'gpt-4.1-mini',
            hasApiKey: !!payload.apiKey,
            maskedApiKey: payload.apiKey ? '已保存' : '',
        }));
    },
    testModelConfig(payload) {
        return run(() => request('/model-config/me/test', 'POST', payload), () => ({
            success: true,
            provider: payload.provider || 'OPENAI_COMPATIBLE',
            apiUrl: payload.apiUrl || '',
            modelName: payload.modelName || 'gpt-4.1-mini',
            statusCode: 200,
            latencyMs: 120,
            message: '连接成功',
            responsePreview: '',
        }));
    },
    getApiOpenCatalog() {
        return run(() => request('/api-open/catalog', 'GET'), () => ({
            notice: 'MVP试点版：接口服务规划/试点开放，后续接入API Key与签名校验。',
            apis: [
                { name: '素材检测接口', path: '/api/tasks/:taskId/detect', status: '可开放' },
                { name: '规则检测接口', path: '/api/rules', status: '可开放' },
                { name: '报告结果接口', path: '/api/reports/:id', status: '可开放' },
                { name: '额度查询接口', path: '/api/subscription/usage', status: '可开放' },
                { name: '调用记录接口', path: '/api/api-open/calls', status: 'MVP占位' },
            ],
        }));
    },
    getReportTemplates() {
        return run(() => request('/report-templates', 'GET'), () => mockReportTemplates);
    },
    createReportTemplate(payload) {
        return run(() => request('/report-templates', 'POST', payload), () => {
            const item = {
                id: makeId('tpl'),
                versionNo: Number(payload.versionNo || 1),
                scope: payload.scope || 'SYSTEM',
                schema: payload.schema || { sections: [] },
                createdAt: nowIso(),
                updatedAt: nowIso(),
                ...payload,
            };
            mockReportTemplates.unshift(item);
            return item;
        });
    },
    updateReportTemplate(templateId, payload) {
        return run(() => request(`/report-templates/${templateId}`, 'PATCH', payload), () => {
            const item = mockReportTemplates.find((x) => x.id === templateId);
            if (!item)
                throw new ApiError('模板不存在');
            Object.assign(item, payload, { updatedAt: nowIso() });
            return item;
        });
    },
    deleteReportTemplate(templateId) {
        return run(() => request(`/report-templates/${templateId}`, 'DELETE'), () => {
            const idx = mockReportTemplates.findIndex((x) => x.id === templateId);
            if (idx < 0)
                throw new ApiError('模板不存在');
            mockReportTemplates.splice(idx, 1);
            return { id: templateId, success: true };
        });
    },
    getReviewTasks() {
        return run(async () => {
            const data = await request('/reviews', 'GET');
            const items = Array.isArray(data) ? data : (data.items || []);
            return items.map((item) => {
                const task = item.task || {};
                const result = task.detectionResult || {};
                return {
                    ...item,
                    reviewId: item.reviewId || item.id,
                    taskNo: item.taskNo || task.taskNo || '-',
                    productName: item.productName || task.productName || '-',
                    platform: item.platform || task.platform || '-',
                    market: item.market || task.market || '-',
                    riskLevel: item.riskLevel || result.riskLevel || '-',
                    systemDecision: item.systemDecision || result.decision || '-',
                    submittedAt: item.submittedAt || item.createdAt || '-',
                };
            });
        }, () => mockReviews);
    },
    getReviewDetail(reviewId) {
        return run(() => request(`/reviews/${reviewId}`, 'GET'), () => {
            const review = mockReviews.find((r) => r.id === reviewId || r.reviewId === reviewId);
            if (!review)
                return null;
            const task = mockTasks.find((t) => t.id === review.taskId);
            return { ...review, task, result: task?.detectionResult, history: review.history || [] };
        });
    },
    startReview(reviewId) {
        return run(() => request(`/reviews/${reviewId}/start`, 'POST'), () => ({ success: true }));
    },
    submitReviewDecision(reviewId, payload) {
        return run(() => request(`/reviews/${reviewId}/decision`, 'POST', payload), () => {
            const review = mockReviews.find((r) => r.id === reviewId || r.reviewId === reviewId);
            if (!review)
                throw new ApiError('复核任务不存在');
            const task = mockTasks.find((t) => t.id === review.taskId);
            const statusMap = { 通过发布: '复核通过', 退回优化: '退回优化', 暂缓发布: '暂缓发布' };
            const decisionMap = { 通过发布: '可发布', 退回优化: '优化后发布', 暂缓发布: '暂缓发布' };
            const taskStatusMap = { 通过发布: 'COMPLETED', 退回优化: 'PENDING_DETECTION', 暂缓发布: 'HOLD' };
            review.status = statusMap[payload.decision];
            review.systemDecision = decisionMap[payload.decision];
            review.history = review.history || [];
            review.history.unshift({ time: nowIso(), action: '人工复核处理', ...payload });
            if (task) {
                task.status = taskStatusMap[payload.decision];
                if (task.detectionResult)
                    task.detectionResult.decision = decisionMap[payload.decision];
            }
            const report = mockReports.find((r) => r.taskId === review.taskId);
            if (report) {
                report.result = { ...(report.result || {}), decision: decisionMap[payload.decision], reviewStatus: review.status, reviewOpinion: `${payload.reason} ${payload.comment || ''}`.trim() };
                report.logs = [{ time: nowIso(), action: '人工复核处理', note: `${payload.decision}/${payload.reason}` }, ...(report.logs || [])];
            }
            appendLog('人工复核操作', reviewId, `${payload.decision}/${payload.reason}`);
            return { success: true };
        });
    },
    getUsers() {
        return run(() => request('/users', 'GET'), () => mockUsers);
    },
    createUser(payload) {
        return run(async () => {
            const created = await request('/auth/register', 'POST', payload);
            if (payload.role && created?.id) {
                try {
                    await request(`/users/${created.id}`, 'PATCH', { role: payload.role });
                    created.role = payload.role;
                }
                catch {
                    // 角色更新失败时仍返回已创建用户，避免前端中断
                }
            }
            return created;
        }, () => {
            const user = {
                id: makeId('u'),
                username: payload.username,
                email: payload.email,
                companyName: payload.companyName || '未分配企业',
                role: payload.role || 'OPERATOR',
                status: '启用',
                lastLoginAt: null,
            };
            mockUsers.unshift(user);
            appendLog('新增用户', user.id, `${user.username}/${user.role}`);
            return user;
        });
    },
    updateUser(userId, payload) {
        return run(() => request(`/users/${userId}`, 'PATCH', payload), () => {
            const user = mockUsers.find((u) => u.id === userId);
            if (!user)
                throw new ApiError('用户不存在');
            Object.assign(user, payload);
            return user;
        });
    },
    deleteUser(userId) {
        return run(() => request(`/users/${userId}`, 'DELETE'), () => {
            const idx = mockUsers.findIndex((u) => u.id === userId);
            if (idx >= 0)
                mockUsers.splice(idx, 1);
            return { id: userId, success: true };
        });
    },
    getLogs() {
        return run(async () => {
            const data = await request('/logs', 'GET');
            return Array.isArray(data) ? data : (data.items || []);
        }, () => mockLogs);
    },
    getDashboardData() {
        return run(() => request('/dashboard', 'GET'), () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const highRiskSet = new Set(['高风险', '严重风险']);
            const aggregate = (list, getter) => {
                const bucket = {};
                list.forEach((item) => {
                    const key = getter(item) || '未知';
                    bucket[key] = (bucket[key] || 0) + 1;
                });
                return bucket;
            };
            const highRiskTasks = mockTasks.filter((t) => highRiskSet.has(t.detectionResult?.riskLevel || ''));
            const byPlan = aggregate(mockCustomers, (x) => x.plan || x.planType || '未分配');
            const byPlatform = aggregate(mockTasks, (x) => x.platform || '未知');
            const byMarket = aggregate(mockTasks, (x) => x.market || '未知');
            const byCategory = aggregate(mockTasks, (x) => x.category || '未知');
            const byRisk = aggregate(mockTasks.filter((t) => t.detectionResult), (x) => x.detectionResult?.riskLevel || '未知');
            return {
                metrics: {
                    todayTaskCount: mockTasks.filter((t) => +new Date(t.createdAt) >= +today).length,
                    pendingReviewCount: mockReviews.filter((r) => r.status === '待复核').length,
                    highRiskCount: highRiskTasks.length,
                    reportCount: mockReports.length,
                },
                highRiskTasks: highRiskTasks
                    .map((t) => ({
                    id: t.id,
                    productName: t.productName,
                    platform: t.platform,
                    market: t.market,
                    riskLevel: t.detectionResult?.riskLevel || '高风险',
                    decision: t.detectionResult?.decision || '人工复核',
                }))
                    .slice(0, 10),
                enhanced: {
                    byPlan,
                    byPlatform,
                    byMarket,
                    byCategory,
                    byRisk,
                    reportCount: mockReports.length,
                    reviewCount: mockReviews.length,
                    highRiskCount: highRiskTasks.length,
                    usageCount: mockUsageRecords.length,
                    batchCount: mockBatchTasks.length,
                    suggestionAdoptionRate: null,
                    notice: 'MVP试点版统计：建议采纳率为占位指标。',
                },
            };
        });
    },
};
export function getFriendlyError(error) {
    if (error instanceof Error) {
        if (/^Cannot (GET|POST|PATCH|DELETE) \//i.test(error.message)) {
            return '接口未找到，请检查后端服务是否已重启。';
        }
        if (/network|fetch/i.test(error.message) && error.message.includes('Failed to fetch')) {
            return '网络请求失败，请检查后端服务是否已启动。';
        }
        return error.message;
    }
    return '操作失败，请稍后重试';
}
