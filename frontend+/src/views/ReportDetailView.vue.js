import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, getFriendlyError } from '@/lib/api';
const route = useRoute();
const router = useRouter();
const report = ref(null);
const loading = ref(true);
const error = ref('');
const downloading = ref(false);
const downloadFormat = ref('pdf');
const downloadTip = ref('');
const result = computed(() => report.value?.result || {});
const scoreValue = computed(() => result.value?.score ?? result.value?.totalScore ?? '-');
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
const dimensionItems = computed(() => {
    const ds = result.value?.dimensionScores || {};
    return [
        { key: 'completeness', label: '完整性', value: ds.completeness ?? '-', tip: '素材字段是否齐全' },
        { key: 'accuracy', label: '准确性', value: ds.accuracy ?? '-', tip: '表达是否明确可理解' },
        { key: 'compliance', label: '规范性', value: ds.compliance ?? '-', tip: '是否命中平台/合规风险' },
        { key: 'attractiveness', label: '吸引力', value: ds.attractiveness ?? '-', tip: '是否具备用户吸引力' },
        { key: 'localization', label: '市场适配', value: ds.localization ?? '-', tip: '是否符合目标市场表达' },
    ];
});
const issueRows = computed(() => {
    const rules = (result.value?.matchedRules || []).map((r) => ({
        riskLevel: r.riskLevel || '中风险',
        position: positionLabel(r.position),
        type: '规则命中',
        hit: r.name || '-',
        description: r.description || '-',
        suggestion: r.suggestion || '-',
    }));
    const issues = (result.value?.issues || []).map((i) => ({
        riskLevel: i.riskLevel || '中风险',
        position: positionLabel(i.position),
        type: i.type || '问题项',
        hit: i.hitContent || '-',
        description: i.description || '-',
        suggestion: i.suggestion || '建议按优化方案修改后复检',
    }));
    return [...rules, ...issues];
});
const suggestionRows = computed(() => {
    return (result.value?.suggestions || []).map((s) => ({
        problem: s.problem || s.before || '-',
        suggestion: s.suggestion || s.after || '-',
        recommendedText: s.recommendedText || '',
    }));
});
const hasOptimization = computed(() => {
    const opt = result.value?.optimization || {};
    return Boolean((opt.titleVariants && opt.titleVariants.length) ||
        opt.sellingPointRewrite ||
        opt.detailStructureAdvice ||
        (opt.adCopyVariants && opt.adCopyVariants.length));
});
const timelineRows = computed(() => {
    const rows = [];
    (report.value?.logs || []).forEach((l) => rows.push({ action: l.action || '系统操作', time: l.time || l.createdAt, operator: l.operator, note: l.note }));
    (report.value?.result?.reviewHistory || []).forEach((h) => rows.push({ action: h.action || '复核处理', time: h.time, operator: h.operator, note: `${h.reason || ''} ${h.comment || ''}`.trim() }));
    return rows.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
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
function toLine(value) {
    if (Array.isArray(value))
        return value.join('、');
    if (value == null)
        return '-';
    return String(value);
}
function riskClass(v) {
    const t = String(v || '');
    if (t.includes('严重') || t.includes('高'))
        return 'tag-danger';
    if (t.includes('中'))
        return 'tag-warning';
    return 'tag-success';
}
function decisionClass(v) {
    const t = String(v || '');
    if (t.includes('暂缓'))
        return 'tag-danger';
    if (t.includes('复核') || t.includes('优化'))
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
        localization: '市场适配',
    };
    return map[String(pos || '')] || pos || '-';
}
async function download() {
    if (!report.value?.id)
        return;
    downloading.value = true;
    downloadTip.value = '';
    try {
        await api.downloadReport(report.value.id, downloadFormat.value);
        downloadTip.value = `已触发下载：${downloadFormat.value.toUpperCase()}。如果浏览器拦截，请检查下载权限。`;
    }
    catch (e) {
        downloadTip.value = getFriendlyError(e);
    }
    finally {
        downloading.value = false;
    }
}
function print() {
    window.print();
}
function goBack() {
    if (window.history.length > 1)
        router.back();
    else
        router.push('/reports');
}
onMounted(async () => {
    try {
        report.value = await api.getReportDetail(String(route.params.id));
        if (route.query.print === '1')
            setTimeout(() => window.print(), 300);
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        loading.value = false;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['report-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-card']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-card']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['result-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "report-page fade-up" },
    id: "report-print-area",
});
/** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
    as: "section",
    ...{ class: "card no-print" },
}));
const __VLS_1 = __VLS_0({
    as: "section",
    ...{ class: "card no-print" },
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goBack) },
    ...{ class: "btn btn-secondary" },
});
var __VLS_2;
if (__VLS_ctx.loading) {
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card state loading" },
    }));
    const __VLS_4 = __VLS_3({
        as: "section",
        ...{ class: "card state loading" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    __VLS_5.slots.default;
    var __VLS_5;
}
else if (__VLS_ctx.error) {
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card state error" },
    }));
    const __VLS_7 = __VLS_6({
        as: "section",
        ...{ class: "card state error" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_8.slots.default;
    (__VLS_ctx.error);
    var __VLS_8;
}
else if (__VLS_ctx.report) {
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "header",
        ...{ class: "card report-cover" },
    }));
    const __VLS_10 = __VLS_9({
        as: "header",
        ...{ class: "card report-cover" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cover-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.reportNo || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.title || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatTime(__VLS_ctx.report.createdAt));
    var __VLS_11;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card report-section" },
    }));
    const __VLS_13 = __VLS_12({
        as: "section",
        ...{ class: "card report-section" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    __VLS_14.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
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
    (__VLS_ctx.scoreValue);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.actionHint);
    var __VLS_14;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card report-section" },
    }));
    const __VLS_16 = __VLS_15({
        as: "section",
        ...{ class: "card report-section" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    __VLS_17.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "kv-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.task?.productName || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.task?.sku || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.task?.platform || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.task?.market || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.task?.category || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.task?.taskNo || __VLS_ctx.shortNo(__VLS_ctx.report.task?.id || __VLS_ctx.report.taskId));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.materialCount ?? __VLS_ctx.report.fileAssets?.length ?? 0);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.report.hasManualReview ? '已复核' : '未复核');
    var __VLS_17;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card report-section" },
    }));
    const __VLS_19 = __VLS_18({
        as: "section",
        ...{ class: "card report-section" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    var __VLS_20;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card report-section" },
    }));
    const __VLS_22 = __VLS_21({
        as: "section",
        ...{ class: "card report-section" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "result-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.scoreValue);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "result-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (['tag', __VLS_ctx.riskClass(__VLS_ctx.result.riskLevel)]) },
    });
    (__VLS_ctx.result.riskLevel || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "result-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (['tag', __VLS_ctx.decisionClass(__VLS_ctx.result.decision)]) },
    });
    (__VLS_ctx.result.decision || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "result-card result-summary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.report.summary || __VLS_ctx.result.explanation || '-');
    var __VLS_23;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "details",
        ...{ class: "card report-section detail-block" },
        open: true,
    }));
    const __VLS_25 = __VLS_24({
        as: "details",
        ...{ class: "card report-section detail-block" },
        open: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    __VLS_26.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-body" },
    });
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
        (item.tip);
    }
    var __VLS_26;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "details",
        ...{ class: "card report-section detail-block" },
    }));
    const __VLS_28 = __VLS_27({
        as: "details",
        ...{ class: "card report-section detail-block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_29.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-body" },
    });
    if (__VLS_ctx.issueRows.length === 0) {
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
        for (const [row, idx] of __VLS_getVForSourceType((__VLS_ctx.issueRows))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                key: (idx),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: (['tag', __VLS_ctx.riskClass(row.riskLevel)]) },
            });
            (row.riskLevel);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.position);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.type);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.hit);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.description);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (row.suggestion);
        }
    }
    var __VLS_29;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "details",
        ...{ class: "card report-section detail-block" },
    }));
    const __VLS_31 = __VLS_30({
        as: "details",
        ...{ class: "card report-section detail-block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-body" },
    });
    if (__VLS_ctx.suggestionRows.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "state" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "suggestion-list" },
        });
        for (const [s, idx] of __VLS_getVForSourceType((__VLS_ctx.suggestionRows))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                ...{ class: "sug-card" },
                key: (idx),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (s.problem);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (s.suggestion);
            if (s.recommendedText) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                (s.recommendedText);
            }
        }
    }
    if (__VLS_ctx.hasOptimization) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "optimization-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "suggestion-list" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ class: "sug-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
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
        (__VLS_ctx.toLine(__VLS_ctx.result.optimization?.sellingPointRewrite?.before));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.toLine(__VLS_ctx.result.optimization?.sellingPointRewrite?.after));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ class: "sug-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.toLine(__VLS_ctx.result.optimization?.detailStructureAdvice?.missingModules));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.toLine(__VLS_ctx.result.optimization?.detailStructureAdvice?.suggestions));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ class: "sug-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
        for (const [item, idx] of __VLS_getVForSourceType(((__VLS_ctx.result.optimization?.adCopyVariants || [])))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: (`ad-${idx}`),
            });
            (item.style || '-');
            (item.text || '-');
        }
    }
    var __VLS_32;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "details",
        ...{ class: "card report-section detail-block" },
    }));
    const __VLS_34 = __VLS_33({
        as: "details",
        ...{ class: "card report-section detail-block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "parse-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "parse-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.toLine(__VLS_ctx.result.parseResult?.text?.keywords));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.toLine(__VLS_ctx.result.parseResult?.text?.sensitiveWords));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.toLine(__VLS_ctx.result.parseResult?.text?.promiseExpressions));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.result.parseResult?.text?.language || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "parse-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.toLine(__VLS_ctx.result.parseResult?.image?.objects));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.toLine(__VLS_ctx.result.parseResult?.image?.colors));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.toLine(__VLS_ctx.result.parseResult?.image?.ocrText));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.toLine(__VLS_ctx.result.parseResult?.image?.risks));
    var __VLS_35;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "details",
        ...{ class: "card report-section detail-block" },
    }));
    const __VLS_37 = __VLS_36({
        as: "details",
        ...{ class: "card report-section detail-block" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    __VLS_38.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-body" },
    });
    if (__VLS_ctx.timelineRows.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "state" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
            ...{ class: "timeline" },
        });
        for (const [item, idx] of __VLS_getVForSourceType((__VLS_ctx.timelineRows))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
                key: (idx),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "timeline-dot" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "timeline-title" },
            });
            (item.action);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "timeline-meta" },
            });
            (__VLS_ctx.formatTime(item.time));
            (item.operator || '系统');
            if (item.note) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "timeline-desc" },
                });
                (item.note);
            }
        }
    }
    var __VLS_38;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card report-actions no-print" },
    }));
    const __VLS_40 = __VLS_39({
        as: "section",
        ...{ class: "card report-actions no-print" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    __VLS_41.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "download-tip" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.downloadFormat),
        ...{ class: "download-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "pdf",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "docx",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "json",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.download) },
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.downloading),
    });
    (__VLS_ctx.downloading ? '下载中...' : '下载报告');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.print) },
        ...{ class: "btn btn-secondary" },
    });
    if (__VLS_ctx.downloadTip) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "download-tip" },
        });
        (__VLS_ctx.downloadTip);
    }
    var __VLS_41;
}
/** @type {__VLS_StyleScopedClasses['report-page']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['no-print']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['kv-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['result-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['optimization-block']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sug-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-card']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-block']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-title']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['report-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['no-print']} */ ;
/** @type {__VLS_StyleScopedClasses['download-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['download-select']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['download-tip']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            report: report,
            loading: loading,
            error: error,
            downloading: downloading,
            downloadFormat: downloadFormat,
            downloadTip: downloadTip,
            result: result,
            scoreValue: scoreValue,
            actionHint: actionHint,
            dimensionItems: dimensionItems,
            issueRows: issueRows,
            suggestionRows: suggestionRows,
            hasOptimization: hasOptimization,
            timelineRows: timelineRows,
            shortNo: shortNo,
            formatTime: formatTime,
            toLine: toLine,
            riskClass: riskClass,
            decisionClass: decisionClass,
            decisionTextClass: decisionTextClass,
            riskTextClass: riskTextClass,
            download: download,
            print: print,
            goBack: goBack,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
