import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { confirmDialog } from '@/lib/dialog';
const route = useRoute();
const router = useRouter();
const loading = reactive({ tasks: false, detail: false, detect: false, report: false, review: false });
const detectStep = ref('');
const error = ref('');
const tip = ref('');
const searchKeyword = ref('');
const tasks = ref([]);
function getRouteTaskId() {
    return String(route.params.id || route.query.taskId || '');
}
const selectedTaskId = ref(getRouteTaskId());
const showTaskList = ref(!selectedTaskId.value);
const noResult = ref(false);
const taskMeta = ref(null);
const result = ref(null);
const filteredTasks = computed(() => {
    const kw = searchKeyword.value.toLowerCase();
    if (!kw)
        return tasks.value;
    return tasks.value.filter((t) => [t.taskNo, t.productName, shortNo(t.id)].some((v) => String(v || '').toLowerCase().includes(kw)));
});
const riskItems = computed(() => {
    const ruleItems = (result.value?.matchedRules || []).map((r) => ({
        riskType: r.riskLevel || '中风险',
        position: positionLabel(r.position),
        ruleName: r.name || '-',
        description: r.description || '-',
        suggestion: r.suggestion || '-',
    }));
    const issueItems = (result.value?.issues || []).map((i) => ({
        riskType: i.riskLevel || '中风险',
        position: positionLabel(i.position),
        ruleName: i.type || '规则命中',
        description: i.description || '-',
        suggestion: i.suggestion || '请按建议调整后复检',
    }));
    return [...ruleItems, ...issueItems];
});
const suggestionItems = computed(() => {
    return (result.value?.suggestions || []).map((s) => ({
        before: s.before || s.problem || '-',
        after: s.after || s.suggestion || '-',
        reason: s.reason || '降低风险并提升可读性',
    }));
});
const dimensionItems = computed(() => {
    const ds = result.value?.dimensionScores || {};
    return [
        { key: 'completeness', label: '完整性', value: ds.completeness ?? '-' },
        { key: 'accuracy', label: '准确性', value: ds.accuracy ?? '-' },
        { key: 'compliance', label: '规范性', value: ds.compliance ?? '-' },
        { key: 'attractiveness', label: '吸引力', value: ds.attractiveness ?? '-' },
        { key: 'localization', label: '市场适配', value: ds.localization ?? '-' },
    ];
});
const actionHint = computed(() => {
    const decision = String(result.value?.decision || '');
    if (decision.includes('可发布'))
        return '可直接发布';
    if (decision.includes('优化'))
        return '先优化再发布';
    if (decision.includes('复核'))
        return '提交人工复核';
    if (decision.includes('暂缓'))
        return '暂停发布并整改';
    return '-';
});
function shortNo(id) {
    return `TSK-${String(id || '').slice(-6).toUpperCase()}`;
}
function formatTime(v) {
    if (!v)
        return '-';
    const d = new Date(v);
    if (Number.isNaN(d.getTime()))
        return '-';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`;
}
function riskClass(level) {
    const v = String(level || '');
    if (v.includes('高'))
        return 'tag-danger';
    if (v.includes('中'))
        return 'tag-warning';
    return 'tag-success';
}
function decisionClass(decision) {
    const v = String(decision || '');
    if (v.includes('暂缓'))
        return 'tag-danger';
    if (v.includes('复核') || v.includes('优化'))
        return 'tag-warning';
    return 'tag-success';
}
function decisionTextClass(v) {
    const t = String(v || '');
    if (t.includes('暂缓'))
        return 'text-danger';
    if (t.includes('复核') || t.includes('优化'))
        return 'text-warning';
    return 'text-success';
}
function riskTextClass(v) {
    const t = String(v || '');
    if (t.includes('严重') || t.includes('高'))
        return 'text-danger';
    if (t.includes('中'))
        return 'text-warning';
    return 'text-success';
}
function positionLabel(pos) {
    const map = {
        title: '商品标题',
        sellingPoints: '核心卖点',
        detailText: '详情文案',
        adText: '广告语',
        imageUrls: '图片素材',
    };
    return map[String(pos || '')] || pos || '-';
}
function statusLabel(status) {
    const map = {
        DRAFT: '草稿',
        PENDING_DETECTION: '待检测',
        DETECTING: '检测中',
        COMPLETED: '已完成',
        REPORTED: '已出报告',
        REVIEW_REQUIRED: '待复核',
        HOLD: '暂缓发布',
    };
    return map[String(status || '').toUpperCase()] || status || '-';
}
function resultReady(status) {
    const s = String(status || '').toUpperCase();
    return ['COMPLETED', 'REPORTED', 'REVIEW_REQUIRED'].includes(s);
}
function goTaskResult(taskId) {
    showTaskList.value = false;
    const query = route.query.embed === '1'
        ? { embed: '1', theme: String(route.query.theme || '') || undefined }
        : undefined;
    router.push({ path: `/tasks/${taskId}/result`, query });
}
function formatAsLine(value) {
    if (Array.isArray(value))
        return value.join('；');
    if (value == null)
        return '-';
    return String(value);
}
function normalizeResult(raw) {
    if (!raw)
        return null;
    const score = Number(raw.score ?? raw.totalScore ?? 0);
    return {
        ...raw,
        score,
        totalScore: Number(raw.totalScore ?? score),
        detectedAt: raw.detectedAt || raw.updatedAt || raw.createdAt || new Date().toISOString(),
        dimensionScores: {
            completeness: raw.dimensionScores?.completeness ?? raw.completenessScore ?? 0,
            accuracy: raw.dimensionScores?.accuracy ?? raw.accuracyScore ?? 0,
            compliance: raw.dimensionScores?.compliance ?? raw.complianceScore ?? 0,
            attractiveness: raw.dimensionScores?.attractiveness ?? raw.attractivenessScore ?? 0,
            localization: raw.dimensionScores?.localization ?? raw.localizationScore ?? 0,
        },
        riskLevel: raw.riskLevel || '-',
        decision: raw.decision || '-',
        issues: Array.isArray(raw.issues) ? raw.issues : [],
        suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
        matchedRules: Array.isArray(raw.matchedRules) ? raw.matchedRules : [],
    };
}
async function loadTasks() {
    loading.tasks = true;
    error.value = '';
    try {
        tasks.value = await api.getTaskList();
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        loading.tasks = false;
    }
}
async function loadResult(taskId) {
    tip.value = '';
    error.value = '';
    noResult.value = false;
    result.value = null;
    taskMeta.value = null;
    if (!taskId)
        return;
    loading.detail = true;
    try {
        const [detail, list] = await Promise.all([api.getTaskDetail(taskId), tasks.value.length ? Promise.resolve(tasks.value) : api.getTaskList()]);
        taskMeta.value = detail;
        if (!tasks.value.length)
            tasks.value = list;
        const taskRow = tasks.value.find((t) => t.id === taskId);
        const status = String(taskRow?.status || detail?.status || '').toUpperCase();
        if (!['COMPLETED', 'REPORTED', 'REVIEW_REQUIRED'].includes(status)) {
            noResult.value = true;
            return;
        }
        result.value = normalizeResult(await api.getDetectionResult(taskId));
    }
    catch (e) {
        noResult.value = true;
        error.value = getFriendlyError(e);
    }
    finally {
        loading.detail = false;
    }
}
async function reDetect() {
    if (!selectedTaskId.value)
        return;
    loading.detect = true;
    const startedAt = Date.now();
    error.value = '';
    tip.value = '';
    try {
        detectStep.value = '准备检测任务...';
        await new Promise((r) => setTimeout(r, 700));
        detectStep.value = '分析文本与图片素材...';
        await api.analyzeTask(selectedTaskId.value);
        detectStep.value = '生成风险评估与优化建议...';
        const elapsed = Date.now() - startedAt;
        if (elapsed < 2600) {
            await new Promise((r) => setTimeout(r, 2600 - elapsed));
        }
        await api.updateTaskStatus(selectedTaskId.value, 'COMPLETED');
        tip.value = '已完成重新检测。';
        await loadTasks();
        await loadResult(selectedTaskId.value);
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        detectStep.value = '';
        loading.detect = false;
    }
}
async function generateReport() {
    if (!selectedTaskId.value)
        return;
    loading.report = true;
    error.value = '';
    tip.value = '';
    try {
        const report = (await api.generateReport(selectedTaskId.value));
        tip.value = '报告已生成。';
        if (report?.id) {
            const query = route.query.embed === '1' ? { embed: '1', theme: String(route.query.theme || '') || undefined } : undefined;
            router.push({ path: `/reports/${report.id}`, query });
        }
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        loading.report = false;
    }
}
async function submitReview() {
    if (!selectedTaskId.value)
        return;
    loading.review = true;
    error.value = '';
    tip.value = '';
    try {
        await api.requestManualReview(selectedTaskId.value, '检测结果页提交人工复核');
        await api.updateTaskStatus(selectedTaskId.value, 'REVIEW_REQUIRED');
        tip.value = '已提交人工复核。';
        await loadTasks();
        await loadResult(selectedTaskId.value);
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        loading.review = false;
    }
}
async function deleteTask(taskId) {
    if (!taskId)
        return;
    if (!(await confirmDialog('确认删除该检测任务及关联结果/报告吗？')))
        return;
    try {
        await api.deleteTask(taskId);
        tip.value = '任务已删除';
        if (selectedTaskId.value === taskId) {
            selectedTaskId.value = '';
            showTaskList.value = true;
            result.value = null;
            taskMeta.value = null;
            noResult.value = false;
            const query = route.query.embed === '1' ? { embed: '1', theme: String(route.query.theme || '') || undefined } : undefined;
            router.replace({ path: '/results', query });
        }
        await loadTasks();
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
}
async function deleteReport(reportId) {
    if (!reportId)
        return;
    if (!(await confirmDialog('确认删除该报告吗？')))
        return;
    try {
        await api.deleteReport(reportId);
        if (taskMeta.value?.report)
            taskMeta.value.report = null;
        tip.value = '报告已删除';
        await loadTasks();
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
}
function downloadSuggestion() {
    if (!result.value)
        return;
    const lines = [
        `任务：${taskMeta.value?.productName || '-'}`,
        `综合分：${result.value?.score ?? '-'}`,
        `风险等级：${result.value?.riskLevel || '-'}`,
        `发布决策：${result.value?.decision || '-'}`,
        '',
        '优化建议：',
        ...suggestionItems.value.map((s, idx) => `${idx + 1}. 原内容：${s.before}\n   建议内容：${s.after}\n   修改理由：${s.reason}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `检测建议-${taskMeta.value?.taskNo || shortNo(selectedTaskId.value)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
watch(selectedTaskId, async (id) => {
    if (id)
        showTaskList.value = false;
    const query = {};
    if (route.query.embed === '1') {
        query.embed = '1';
        if (route.query.theme)
            query.theme = String(route.query.theme);
    }
    if (route.path !== `/tasks/${id}/result`) {
        router.replace({ path: `/tasks/${id}/result`, query });
    }
    await loadResult(id);
});
watch(() => route.fullPath, async () => {
    const id = getRouteTaskId();
    if (!id || id === selectedTaskId.value)
        return;
    selectedTaskId.value = id;
    await loadResult(id);
});
onMounted(async () => {
    await loadTasks();
    if (selectedTaskId.value)
        await loadResult(selectedTaskId.value);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['score-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-card']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-card']} */ ;
/** @type {__VLS_StyleScopedClasses['task-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppShell, typeof AppShell, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppShell, new AppShell({
    title: "检测结果",
}));
const __VLS_1 = __VLS_0({
    title: "检测结果",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-stack fade-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "glass card result-list-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row-between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.loadTasks) },
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.loading.tasks),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "task-picker" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
    placeholder: "搜索任务编号/名称",
});
(__VLS_ctx.searchKeyword);
if (__VLS_ctx.loading.detect) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "state loading" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ style: {} },
    });
    (__VLS_ctx.detectStep);
}
if (__VLS_ctx.loading.tasks) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "state loading" },
    });
}
else if (__VLS_ctx.loading.detail && !__VLS_ctx.showTaskList) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "state loading" },
    });
}
if (__VLS_ctx.showTaskList && !__VLS_ctx.loading.tasks && !__VLS_ctx.loading.detail && __VLS_ctx.filteredTasks.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-wrap task-list-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ...{ class: "table" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [task] of __VLS_getVForSourceType((__VLS_ctx.filteredTasks))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            key: (task.id),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (task.taskNo || __VLS_ctx.shortNo(task.id));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (task.productName || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (task.platform || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (['tag', __VLS_ctx.resultReady(task.status) ? 'tag-success' : 'tag-warning']) },
        });
        (__VLS_ctx.statusLabel(task.status));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "actions-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showTaskList && !__VLS_ctx.loading.tasks && !__VLS_ctx.loading.detail && __VLS_ctx.filteredTasks.length))
                        return;
                    __VLS_ctx.goTaskResult(task.id);
                } },
            ...{ class: "btn btn-secondary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showTaskList && !__VLS_ctx.loading.tasks && !__VLS_ctx.loading.detail && __VLS_ctx.filteredTasks.length))
                        return;
                    __VLS_ctx.deleteTask(task.id);
                } },
            ...{ class: "btn btn-secondary" },
        });
    }
}
if (!__VLS_ctx.showTaskList && __VLS_ctx.selectedTaskId) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions-row back-list-btn" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.showTaskList && __VLS_ctx.selectedTaskId))
                    return;
                __VLS_ctx.showTaskList = true;
            } },
        ...{ class: "btn btn-secondary" },
    });
}
if (__VLS_ctx.showTaskList && !__VLS_ctx.loading.tasks && __VLS_ctx.filteredTasks.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "state" },
    });
}
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "error-text" },
    });
    (__VLS_ctx.error);
}
if (__VLS_ctx.selectedTaskId && __VLS_ctx.noResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "glass card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "warn-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.reDetect) },
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.loading.detect),
    });
    (__VLS_ctx.loading.detect ? '检测中...' : '开始检测');
}
if (__VLS_ctx.selectedTaskId && __VLS_ctx.taskMeta && __VLS_ctx.result && !__VLS_ctx.showTaskList) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "glass card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "k" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.taskMeta.taskNo || __VLS_ctx.shortNo(__VLS_ctx.taskMeta.id));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "k" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.taskMeta.productName || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "k" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.taskMeta.category || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "k" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.taskMeta.platform || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "k" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.taskMeta.market || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "k" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.taskMeta.purpose || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "glass card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-strip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: (__VLS_ctx.decisionTextClass(__VLS_ctx.result.decision)) },
    });
    (__VLS_ctx.result.decision || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
        ...{ class: (__VLS_ctx.riskTextClass(__VLS_ctx.result.riskLevel)) },
    });
    (__VLS_ctx.result.riskLevel || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.result.score ?? '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.actionHint);
    if (__VLS_ctx.result.explanation) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "summary-explain" },
        });
        (__VLS_ctx.result.explanation);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "glass card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "score-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    (__VLS_ctx.result.score);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "meta-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (['tag', __VLS_ctx.riskClass(__VLS_ctx.result.riskLevel)]) },
    });
    (__VLS_ctx.result.riskLevel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "meta-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (['tag', __VLS_ctx.decisionClass(__VLS_ctx.result.decision)]) },
    });
    (__VLS_ctx.result.decision);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "meta-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatTime(__VLS_ctx.result.detectedAt));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "glass card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dimension-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.dimensionItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ class: "dimension-card" },
            key: (item.key),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (item.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.value);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({
        ...{ class: "glass card detail-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-body" },
    });
    if (__VLS_ctx.riskItems.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "state" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "table-wrap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
            ...{ class: "table" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
        for (const [r, idx] of __VLS_getVForSourceType((__VLS_ctx.riskItems))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                key: (idx),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (r.riskType);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (r.position);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (r.ruleName);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (r.description);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (r.suggestion);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({
        ...{ class: "glass card detail-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "parse-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    ((__VLS_ctx.result.parseResult?.text?.keywords || []).join('、') || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    ((__VLS_ctx.result.parseResult?.text?.sensitiveWords || []).join('、') || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    ((__VLS_ctx.result.parseResult?.text?.promiseExpressions || []).join('、') || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.result.parseResult?.text?.language || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "parse-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    ((__VLS_ctx.result.parseResult?.image?.objects || []).join('、') || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    ((__VLS_ctx.result.parseResult?.image?.colors || []).join('、') || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    ((__VLS_ctx.result.parseResult?.image?.ocrText || []).join('、') || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    ((__VLS_ctx.result.parseResult?.image?.risks || []).join('、') || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({
        ...{ class: "glass card detail-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-body" },
    });
    if (__VLS_ctx.suggestionItems.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "state" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "suggestion-list" },
        });
        for (const [s, idx] of __VLS_getVForSourceType((__VLS_ctx.suggestionItems))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                key: (idx),
                ...{ class: "sug-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (s.before);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (s.after);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (s.reason);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({
        ...{ class: "glass card detail-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "suggestion-list" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "sug-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "list-inline" },
    });
    for (const [item, idx] of __VLS_getVForSourceType(((__VLS_ctx.result.optimization?.titleVariants || [])))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (`title-${idx}`),
        });
        (item);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "sug-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatAsLine(__VLS_ctx.result.optimization?.sellingPointRewrite?.before));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatAsLine(__VLS_ctx.result.optimization?.sellingPointRewrite?.after));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "sug-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatAsLine(__VLS_ctx.result.optimization?.detailStructureAdvice?.missingModules));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatAsLine(__VLS_ctx.result.optimization?.detailStructureAdvice?.suggestions));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "sug-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "list-inline" },
    });
    for (const [item, idx] of __VLS_getVForSourceType(((__VLS_ctx.result.optimization?.adCopyVariants || [])))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (`ad-${idx}`),
        });
        (item.style || '-');
        (item.text || '-');
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "glass card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.generateReport) },
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.loading.report),
    });
    (__VLS_ctx.loading.report ? '生成中...' : '生成报告');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.submitReview) },
        ...{ class: "btn btn-secondary" },
        disabled: (__VLS_ctx.loading.review),
    });
    (__VLS_ctx.loading.review ? '提交中...' : '提交复核');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.reDetect) },
        ...{ class: "btn btn-secondary" },
        disabled: (__VLS_ctx.loading.detect),
    });
    (__VLS_ctx.loading.detect ? '检测中...' : '重新检测');
    if (__VLS_ctx.taskMeta?.report?.id) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedTaskId && __VLS_ctx.taskMeta && __VLS_ctx.result && !__VLS_ctx.showTaskList))
                        return;
                    if (!(__VLS_ctx.taskMeta?.report?.id))
                        return;
                    __VLS_ctx.deleteReport(__VLS_ctx.taskMeta.report.id);
                } },
            ...{ class: "btn btn-secondary" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedTaskId && __VLS_ctx.taskMeta && __VLS_ctx.result && !__VLS_ctx.showTaskList))
                    return;
                __VLS_ctx.deleteTask(__VLS_ctx.selectedTaskId);
            } },
        ...{ class: "btn btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.downloadSuggestion) },
        ...{ class: "btn btn-secondary" },
    });
    if (__VLS_ctx.tip) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "tip-text" },
        });
        (__VLS_ctx.tip);
    }
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['task-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['task-list-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['back-list-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['error-text']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['warn-text']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['k']} */ ;
/** @type {__VLS_StyleScopedClasses['k']} */ ;
/** @type {__VLS_StyleScopedClasses['k']} */ ;
/** @type {__VLS_StyleScopedClasses['k']} */ ;
/** @type {__VLS_StyleScopedClasses['k']} */ ;
/** @type {__VLS_StyleScopedClasses['k']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-explain']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['score-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-card']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['list-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['list-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['tip-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppShell: AppShell,
            loading: loading,
            detectStep: detectStep,
            error: error,
            tip: tip,
            searchKeyword: searchKeyword,
            selectedTaskId: selectedTaskId,
            showTaskList: showTaskList,
            noResult: noResult,
            taskMeta: taskMeta,
            result: result,
            filteredTasks: filteredTasks,
            riskItems: riskItems,
            suggestionItems: suggestionItems,
            dimensionItems: dimensionItems,
            actionHint: actionHint,
            shortNo: shortNo,
            formatTime: formatTime,
            riskClass: riskClass,
            decisionClass: decisionClass,
            decisionTextClass: decisionTextClass,
            riskTextClass: riskTextClass,
            statusLabel: statusLabel,
            resultReady: resultReady,
            goTaskResult: goTaskResult,
            formatAsLine: formatAsLine,
            loadTasks: loadTasks,
            reDetect: reDetect,
            generateReport: generateReport,
            submitReview: submitReview,
            deleteTask: deleteTask,
            deleteReport: deleteReport,
            downloadSuggestion: downloadSuggestion,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
