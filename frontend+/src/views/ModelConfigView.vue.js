import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { notify } from '@/lib/dialog';
const modelPlans = [
    { key: 'gpt', name: 'GPT 系列', modelName: 'gpt-4.1-mini', price: '按量计费 / 套餐开通' },
    { key: 'gemini', name: 'Gemini 系列', modelName: 'gemini-2.5-flash', price: '按量计费 / 套餐开通' },
    { key: 'claude', name: 'Claude 系列', modelName: 'claude-3-5-sonnet', price: '企业版开通' },
];
const form = reactive({ enabled: false, apiUrl: '', apiKey: '', modelName: 'gpt-4.1-mini', provider: 'OPENAI_COMPATIBLE' });
const loading = ref(false);
const saving = ref(false);
const hasApiKey = ref(false);
function selectPlan(plan) {
    form.modelName = plan.modelName;
}
async function load() {
    loading.value = true;
    try {
        const data = await api.getModelConfig();
        form.enabled = !!data.enabled;
        form.apiUrl = String(data.apiUrl || '');
        form.apiKey = '';
        form.modelName = String(data.modelName || 'gpt-4.1-mini');
        form.provider = String(data.provider || 'OPENAI_COMPATIBLE');
        hasApiKey.value = !!data.hasApiKey;
    }
    catch (error) {
        await notify(getFriendlyError(error));
    }
    finally {
        loading.value = false;
    }
}
async function save() {
    saving.value = true;
    try {
        const data = await api.saveModelConfig({
            enabled: form.enabled,
            apiUrl: form.apiUrl,
            apiKey: form.apiKey,
            modelName: form.modelName,
            provider: form.provider,
        });
        hasApiKey.value = !!data.hasApiKey;
        form.apiKey = '';
        await notify('模型配置已保存到服务端。');
    }
    catch (error) {
        await notify(getFriendlyError(error));
    }
    finally {
        saving.value = false;
    }
}
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['model-card']} */ ;
/** @type {__VLS_StyleScopedClasses['model-card']} */ ;
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
    disabled: (__VLS_ctx.loading),
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
        ...{ class: ({ active: __VLS_ctx.form.modelName === item.modelName }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
    (item.price);
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
    placeholder: (__VLS_ctx.hasApiKey ? '留空则保持当前密钥不变' : 'sk-...'),
});
(__VLS_ctx.form.apiKey);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
    placeholder: "gpt-4.1-mini",
});
(__VLS_ctx.form.modelName);
if (__VLS_ctx.hasApiKey) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-muted" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.save) },
    ...{ class: "btn btn-primary" },
    disabled: (__VLS_ctx.saving || __VLS_ctx.loading),
});
(__VLS_ctx.saving ? '保存中...' : '保存配置');
var __VLS_6;
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['model-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['model-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            AppShell: AppShell,
            modelPlans: modelPlans,
            form: form,
            loading: loading,
            saving: saving,
            hasApiKey: hasApiKey,
            selectPlan: selectPlan,
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
