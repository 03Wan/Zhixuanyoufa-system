import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
const loading = ref(true);
const error = ref('');
const tasks = ref([]);
const reports = ref([]);
const dashboard = ref({ metrics: {}, highRiskTasks: [] });
const trendRef = ref(null);
const riskRef = ref(null);
const platformRef = ref(null);
const topRiskRef = ref(null);
let ec = null;
let trendChart = null;
let riskChart = null;
let platformChart = null;
let topRiskChart = null;
function riskLabel(task) {
    const value = String(task?.detectionResult?.riskLevel || task?.riskLevel || '');
    if (value.includes('高') || value.toUpperCase() === 'HIGH')
        return '高风险';
    if (value.includes('中') || value.toUpperCase() === 'MEDIUM')
        return '中风险';
    if (value.includes('严重'))
        return '严重风险';
    return value || '低风险';
}
function initChart(el, current) {
    if (!el || !ec)
        return null;
    current?.dispose();
    return ec.init(el);
}
const trendData = computed(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { key: d.toISOString().slice(0, 10), label: `${d.getMonth() + 1}/${d.getDate()}`, count: 0 };
    });
    for (const task of tasks.value) {
        const row = days.find((d) => d.key === String(task.createdAt || '').slice(0, 10));
        if (row)
            row.count += 1;
    }
    return days;
});
const riskDistribution = computed(() => {
    const map = { 高风险: 0, 中风险: 0, 低风险: 0 };
    for (const task of tasks.value)
        map[riskLabel(task)] = (map[riskLabel(task)] || 0) + 1;
    return Object.entries(map).map(([name, value]) => ({ name, value }));
});
const platformBars = computed(() => {
    const map = new Map();
    for (const task of tasks.value) {
        if (riskLabel(task) === '低风险')
            continue;
        const key = task.platform || '未知平台';
        map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
});
const topRiskTypes = computed(() => {
    const map = new Map();
    for (const report of reports.value) {
        for (const rule of report?.result?.matchedRules || []) {
            const key = rule.type || rule.name || '合规风险';
            map.set(key, (map.get(key) || 0) + 1);
        }
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
});
function renderCharts() {
    if (!ec || loading.value)
        return;
    trendChart = initChart(trendRef.value, trendChart);
    riskChart = initChart(riskRef.value, riskChart);
    platformChart = initChart(platformRef.value, platformChart);
    topRiskChart = initChart(topRiskRef.value, topRiskChart);
    trendChart?.setOption({ tooltip: { trigger: 'axis' }, grid: { left: 36, right: 18, top: 24, bottom: 30 }, xAxis: { type: 'category', data: trendData.value.map((d) => d.label) }, yAxis: { type: 'value', minInterval: 1 }, series: [{ type: 'line', smooth: true, areaStyle: {}, data: trendData.value.map((d) => d.count), lineStyle: { width: 3 }, color: '#2563eb' }] });
    riskChart?.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['45%', '70%'], itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 }, data: riskDistribution.value, color: ['#ef4444', '#f59e0b', '#10b981'] }] });
    platformChart?.setOption({ tooltip: { trigger: 'axis' }, grid: { left: 36, right: 18, top: 24, bottom: 36 }, xAxis: { type: 'category', data: platformBars.value.map((d) => d.name), axisLabel: { interval: 0, rotate: 20 } }, yAxis: { type: 'value', minInterval: 1 }, series: [{ type: 'bar', data: platformBars.value.map((d) => d.value), itemStyle: { borderRadius: [8, 8, 0, 0] }, color: '#2bb8ff' }] });
    topRiskChart?.setOption({ tooltip: { trigger: 'axis' }, grid: { left: 90, right: 18, top: 24, bottom: 24 }, xAxis: { type: 'value', minInterval: 1 }, yAxis: { type: 'category', data: topRiskTypes.value.map((d) => d.name) }, series: [{ type: 'bar', data: topRiskTypes.value.map((d) => d.value), itemStyle: { borderRadius: [0, 8, 8, 0] }, color: '#f59e0b' }] });
}
function resizeCharts() { trendChart?.resize(); riskChart?.resize(); platformChart?.resize(); topRiskChart?.resize(); }
async function loadData() {
    loading.value = true;
    error.value = '';
    try {
        const [taskList, reportList, dash] = await Promise.all([api.getTaskList(), api.getReportList(), api.getDashboardData()]);
        tasks.value = taskList || [];
        reports.value = reportList || [];
        dashboard.value = dash || { metrics: {}, highRiskTasks: [] };
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        loading.value = false;
        await nextTick();
        renderCharts();
        setTimeout(resizeCharts, 60);
    }
}
watch([trendData, riskDistribution, platformBars, topRiskTypes], () => renderCharts());
onMounted(async () => {
    const [{ use }, charts, comps, renderers, echartsCore] = await Promise.all([import('echarts/core'), import('echarts/charts'), import('echarts/components'), import('echarts/renderers'), import('echarts/core')]);
    use([charts.LineChart, charts.BarChart, charts.PieChart, comps.TooltipComponent, comps.LegendComponent, comps.GridComponent, renderers.CanvasRenderer]);
    ec = echartsCore;
    await loadData();
    window.addEventListener('resize', resizeCharts);
});
onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCharts);
    trendChart?.dispose();
    riskChart?.dispose();
    platformChart?.dispose();
    topRiskChart?.dispose();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['kpi']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi']} */ ;
/** @type {__VLS_StyleScopedClasses['charts-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppShell, typeof AppShell, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppShell, new AppShell({
    title: "数据看板",
}));
const __VLS_1 = __VLS_0({
    title: "数据看板",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-stack fade-up" },
});
/** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
    as: "section",
    ...{ class: "card" },
}));
const __VLS_5 = __VLS_4({
    as: "section",
    ...{ class: "card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_6.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row-between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.loadData) },
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.loading),
});
(__VLS_ctx.loading ? '刷新中' : '刷新看板');
var __VLS_6;
if (__VLS_ctx.loading) {
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card state loading center-loading" },
    }));
    const __VLS_8 = __VLS_7({
        as: "section",
        ...{ class: "card state loading center-loading" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_9.slots.default;
    var __VLS_9;
}
else if (__VLS_ctx.error) {
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card state error" },
    }));
    const __VLS_11 = __VLS_10({
        as: "section",
        ...{ class: "card state error" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_12.slots.default;
    (__VLS_ctx.error);
    var __VLS_12;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid-4" },
    });
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "article",
        ...{ class: "card kpi" },
    }));
    const __VLS_14 = __VLS_13({
        as: "article",
        ...{ class: "card kpi" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.dashboard.metrics?.todayTaskCount || 0);
    var __VLS_15;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "article",
        ...{ class: "card kpi" },
    }));
    const __VLS_17 = __VLS_16({
        as: "article",
        ...{ class: "card kpi" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_18.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.dashboard.metrics?.pendingReviewCount || 0);
    var __VLS_18;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "article",
        ...{ class: "card kpi" },
    }));
    const __VLS_20 = __VLS_19({
        as: "article",
        ...{ class: "card kpi" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_21.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.dashboard.metrics?.highRiskCount || 0);
    var __VLS_21;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "article",
        ...{ class: "card kpi" },
    }));
    const __VLS_23 = __VLS_22({
        as: "article",
        ...{ class: "card kpi" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.dashboard.metrics?.reportCount || 0);
    var __VLS_24;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "charts-grid" },
    });
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card chart-card" },
    }));
    const __VLS_26 = __VLS_25({
        as: "section",
        ...{ class: "card chart-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "trendRef",
        ...{ class: "chart" },
    });
    /** @type {typeof __VLS_ctx.trendRef} */ ;
    var __VLS_27;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card chart-card" },
    }));
    const __VLS_29 = __VLS_28({
        as: "section",
        ...{ class: "card chart-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    __VLS_30.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "riskRef",
        ...{ class: "chart" },
    });
    /** @type {typeof __VLS_ctx.riskRef} */ ;
    var __VLS_30;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card chart-card" },
    }));
    const __VLS_32 = __VLS_31({
        as: "section",
        ...{ class: "card chart-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    __VLS_33.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "platformRef",
        ...{ class: "chart" },
    });
    /** @type {typeof __VLS_ctx.platformRef} */ ;
    var __VLS_33;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card chart-card" },
    }));
    const __VLS_35 = __VLS_34({
        as: "section",
        ...{ class: "card chart-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "topRiskRef",
        ...{ class: "chart" },
    });
    /** @type {typeof __VLS_ctx.topRiskRef} */ ;
    var __VLS_36;
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['center-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-4']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['kpi']} */ ;
/** @type {__VLS_StyleScopedClasses['charts-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            AppShell: AppShell,
            loading: loading,
            error: error,
            dashboard: dashboard,
            trendRef: trendRef,
            riskRef: riskRef,
            platformRef: platformRef,
            topRiskRef: topRiskRef,
            loadData: loadData,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
