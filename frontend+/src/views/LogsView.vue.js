import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api } from '@/lib/api';
import { ROLE_LABELS, normalizeRole } from '@/lib/permissions';
const loading = ref(true);
const rows = ref([]);
const page = ref(1);
const pageSize = 10;
const lastSyncAt = ref(0);
const syncTimer = ref(null);
const filters = reactive({ operator: '', action: '', result: '', startDate: '', endDate: '' });
const ACTION_MAP = {
    USER_LOGIN: '用户登录', USER_LOGOUT: '用户退出', CREATE_TASK: '创建任务', UPDATE_TASK: '编辑任务', EDIT_TASK: '编辑任务',
    UPLOAD_MATERIAL: '上传素材', RUN_DETECTION: '启动检测', REQUEST_MANUAL_REVIEW: '提交人工复核', REVIEW_ACTION: '人工复核操作',
    GENERATE_REPORT: '生成审核报告', DOWNLOAD_REPORT: '下载报告', CREATE_RULE: '新增规则', UPDATE_RULE: '编辑规则', RULE_APPROVAL: '规则审批',
    RULE_ROLLBACK: '规则回滚', CUSTOMER_PLAN_UPDATE: '客户套餐调整', SEED_CREATE_TASK: '初始化任务',
};
const TARGET_MAP = { MATERIAL_TASK: '检测任务', REPORT: '审核报告', RULE: '规则', USER: '用户', REVIEW_TASK: '复核任务', RESOURCE: '资源' };
const actionOptions = Object.entries(ACTION_MAP).map(([value, label]) => ({ value, label }));
const operatorOptions = computed(() => Array.from(new Set(rows.value.map((row) => row.operator).filter(Boolean))).sort());
function time(v) { if (!v)
    return '-'; const d = new Date(v); if (Number.isNaN(d.getTime()))
    return '-'; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
function roleLabel(role) { return role ? ROLE_LABELS[normalizeRole(role)] : '-'; }
function actionLabel(action) { const key = String(action || '').toUpperCase(); return ACTION_MAP[key] || action || '-'; }
function shortId(id) { if (!id)
    return '-'; return id.length > 12 ? id.slice(-12) : id; }
function objectLabel(row) { const targetName = TARGET_MAP[String(row.targetType || '').toUpperCase()] || '对象'; const detail = row.detail || {}; const fromDetail = detail.productName || detail.reportNo || detail.ruleName || detail.taskNo || detail.targetName || ''; const id = row.targetId || row.target || ''; return `${targetName}：${fromDetail || shortId(id)}`; }
const filteredRows = computed(() => rows.value.filter((row) => {
    const action = String(row.action || row.actionType || '').toUpperCase();
    const result = row.result || '成功';
    const at = new Date(row.createdAt || row.actionTime || 0).getTime();
    const start = filters.startDate ? new Date(`${filters.startDate}T00:00:00`).getTime() : 0;
    const end = filters.endDate ? new Date(`${filters.endDate}T23:59:59`).getTime() : Number.MAX_SAFE_INTEGER;
    return (!filters.operator || row.operator === filters.operator) && (!filters.action || action === filters.action) && (!filters.result || result === filters.result) && at >= start && at <= end;
}));
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)));
const pagedRows = computed(() => filteredRows.value.slice((page.value - 1) * pageSize, (page.value - 1) * pageSize + pageSize));
const lastSyncText = computed(() => lastSyncAt.value ? time(new Date(lastSyncAt.value).toISOString()) : '-');
watch(filteredRows, () => { if (page.value > totalPages.value)
    page.value = 1; });
async function load() { loading.value = true; try {
    rows.value = await api.getLogs();
    lastSyncAt.value = Date.now();
}
finally {
    loading.value = false;
} }
onMounted(async () => { await load(); syncTimer.value = window.setInterval(load, 8000); });
onUnmounted(() => { if (syncTimer.value)
    clearInterval(syncTimer.value); });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['filter-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppShell, typeof AppShell, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppShell, new AppShell({
    title: "操作日志",
}));
const __VLS_1 = __VLS_0({
    title: "操作日志",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-stack fade-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row-between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "text-muted" },
});
(__VLS_ctx.lastSyncText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.load) },
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.loading),
});
(__VLS_ctx.loading ? '刷新中' : '刷新日志');
/** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
    as: "section",
    ...{ class: "card block" },
}));
const __VLS_5 = __VLS_4({
    as: "section",
    ...{ class: "card block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_6.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.filters.operator),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
for (const [name] of __VLS_getVForSourceType((__VLS_ctx.operatorOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (name),
        value: (name),
    });
    (name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.filters.action),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
for (const [a] of __VLS_getVForSourceType((__VLS_ctx.actionOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (a.value),
        value: (a.value),
    });
    (a.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.filters.result),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "成功",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "失败",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
    type: "date",
});
(__VLS_ctx.filters.startDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
    type: "date",
});
(__VLS_ctx.filters.endDate);
var __VLS_6;
/** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
    as: "section",
    ...{ class: "card" },
}));
const __VLS_8 = __VLS_7({
    as: "section",
    ...{ class: "card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_9.slots.default;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "state loading" },
    });
}
else if (__VLS_ctx.pagedRows.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "state" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [row] of __VLS_getVForSourceType((__VLS_ctx.pagedRows))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            key: (row.logId || row.id),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.time(row.createdAt || row.actionTime));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (row.operator || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.roleLabel(row.role));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.actionLabel(row.action || row.actionType));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.objectLabel(row));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (['tag', (row.result || '成功') === '成功' ? 'tag-success' : 'tag-danger']) },
        });
        (row.result || '成功');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (row.ip || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (row.note || row.remark || '-');
    }
}
if (__VLS_ctx.totalPages > 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pager" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.totalPages > 1))
                    return;
                __VLS_ctx.page--;
            } },
        ...{ class: "btn btn-secondary" },
        disabled: (__VLS_ctx.page === 1),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.page);
    (__VLS_ctx.totalPages);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.totalPages > 1))
                    return;
                __VLS_ctx.page++;
            } },
        ...{ class: "btn btn-secondary" },
        disabled: (__VLS_ctx.page === __VLS_ctx.totalPages),
    });
}
var __VLS_9;
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['pager']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            AppShell: AppShell,
            loading: loading,
            page: page,
            filters: filters,
            actionOptions: actionOptions,
            operatorOptions: operatorOptions,
            time: time,
            roleLabel: roleLabel,
            actionLabel: actionLabel,
            objectLabel: objectLabel,
            totalPages: totalPages,
            pagedRows: pagedRows,
            lastSyncText: lastSyncText,
            load: load,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
