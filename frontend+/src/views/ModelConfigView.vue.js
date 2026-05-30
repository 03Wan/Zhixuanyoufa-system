import { reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { notify } from '@/lib/dialog';
const modelPlans = [
    { key: 'gpt', name: 'GPT 系列', modelName: 'gpt5.5', price: '按量计费 / 套餐开通', desc: '适用于文案检测、风险解释、优化建议生成。', features: ['文本检测', '优化建议', '报告摘要'] },
    { key: 'gemini', name: 'Gemini 系列', modelName: 'gemini-pro', price: '按量计费 / 套餐开通', desc: '适用于图文混合素材、多模态理解与平台适配判断。', features: ['图文理解', '多市场适配', '素材归因'] },
    { key: 'claude', name: 'Claude Code', modelName: 'claude-code', price: '企业版开通', desc: '适用于规则解释、结构化输出和复杂审核流程辅助。', features: ['规则解释', '结构化输出', '企业流程'] },
];
const selectedPlan = ref(null);
const form = reactive({ enabled: false, apiUrl: '', apiKey: '', modelName: 'gpt5.5' });
function selectPlan(plan) { selectedPlan.value = plan; }
async function choosePlan(plan) { form.modelName = plan.modelName; await notify(`已选择 ${plan.name}，具体价格和开通方式需购买后由团队配置。`); }
function load() {
    try {
        const raw = localStorage.getItem('zyyf_model_config');
        if (!raw)
            return;
        const parsed = JSON.parse(raw);
        form.enabled = !!parsed.enabled;
        form.apiUrl = String(parsed.apiUrl || '');
        form.apiKey = String(parsed.apiKey || '');
        form.modelName = String(parsed.modelName || 'gpt5.5');
    }
    catch { }
}
async function save() { localStorage.setItem('zyyf_model_config', JSON.stringify(form)); await notify('模型配置已保存。'); }
load();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['model-card']} */ ;
/** @type {__VLS_StyleScopedClasses['model-card']} */ ;
/** @type {__VLS_StyleScopedClasses['model-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['model-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['model-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppShell, typeof AppShell, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppShell, new AppShell({
    title: "模型配置",
}));
const __VLS_1 = __VLS_0({
    title: "模型配置",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-stack fade-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "glass card block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row-between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-muted" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.load) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "model-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.modelPlans))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectPlan(item);
            } },
        key: (item.key),
        type: "button",
        ...{ class: "model-card" },
        ...{ class: ({ active: __VLS_ctx.selectedPlan?.key === item.key }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (item.price);
}
if (__VLS_ctx.selectedPlan) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "model-detail" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row-between" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.selectedPlan.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.selectedPlan.desc);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedPlan))
                    return;
                __VLS_ctx.choosePlan(__VLS_ctx.selectedPlan);
            } },
        ...{ class: "btn btn-primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "feature-tags" },
    });
    for (const [f] of __VLS_getVForSourceType((__VLS_ctx.selectedPlan.features))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (f),
        });
        (f);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.form.enabled);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
    placeholder: "https://.../v1/chat/completions",
});
(__VLS_ctx.form.apiUrl);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
    placeholder: "sk-...",
});
(__VLS_ctx.form.apiKey);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
    placeholder: "gpt5.5",
});
(__VLS_ctx.form.modelName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.save) },
    ...{ class: "btn btn-primary" },
});
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['model-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['model-card']} */ ;
/** @type {__VLS_StyleScopedClasses['model-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppShell: AppShell,
            modelPlans: modelPlans,
            selectedPlan: selectedPlan,
            form: form,
            selectPlan: selectPlan,
            choosePlan: choosePlan,
            load: load,
            save: save,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
