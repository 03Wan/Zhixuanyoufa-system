import AppGlassSurface from '@/components/AppGlassSurface.vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { notify } from '@/lib/dialog';
import { onMounted, reactive, ref } from 'vue';
const providerPresets = [
    {
        key: 'openai',
        provider: 'OPENAI_COMPATIBLE',
        label: 'ChatGPT / OpenAI',
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        modelName: 'gpt-4.1-mini',
        note: 'OpenAI 官方 chat completions 接口',
    },
    {
        key: 'anthropic',
        provider: 'ANTHROPIC',
        label: 'Claude',
        apiUrl: 'https://api.anthropic.com/v1/messages',
        modelName: 'claude-sonnet-4-6',
        note: 'Anthropic Messages API',
    },
    {
        key: 'gemini',
        provider: 'GOOGLE_GEMINI',
        label: 'Gemini',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        modelName: 'gemini-2.5-flash',
        note: 'Google Gemini REST 接口',
    },
    {
        key: 'deepseek',
        provider: 'DEEPSEEK',
        label: 'DeepSeek',
        apiUrl: 'https://api.deepseek.com/chat/completions',
        modelName: 'deepseek-chat',
        note: 'OpenAI 兼容接口',
    },
    {
        key: 'kimi',
        provider: 'KIMI',
        label: 'Kimi',
        apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
        modelName: 'kimi-k2.6',
        note: 'Moonshot OpenAI 兼容接口',
    },
    {
        key: 'minimax',
        provider: 'MINIMAX',
        label: 'MiniMax',
        apiUrl: 'https://api.minimaxi.com/v1/chat/completions',
        modelName: 'MiniMax-M3',
        note: 'MiniMax OpenAI 兼容接口',
    },
];
const providerOptions = [
    ...providerPresets,
    {
        key: 'custom',
        provider: 'CUSTOM',
        label: '自定义',
        apiUrl: '',
        modelName: 'gpt-4.1-mini',
        note: '手动填写任意兼容地址',
    },
];
const form = reactive({
    enabled: false,
    apiUrl: '',
    apiKey: '',
    modelName: 'gpt-4.1-mini',
    provider: 'OPENAI_COMPATIBLE',
});
const loading = ref(false);
const saving = ref(false);
const testing = ref(false);
const hasApiKey = ref(false);
const testResult = ref(null);
function applyPreset(preset) {
    form.provider = preset.provider;
    form.apiUrl = preset.apiUrl;
    form.modelName = preset.modelName;
    testResult.value = null;
}
function syncPresetByProvider() {
    const preset = providerPresets.find((item) => item.provider === form.provider);
    if (!preset)
        return;
    form.apiUrl = preset.apiUrl;
    form.modelName = preset.modelName;
    testResult.value = null;
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
        testResult.value = null;
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
        await notify('模型配置已保存');
    }
    catch (error) {
        await notify(getFriendlyError(error));
    }
    finally {
        saving.value = false;
    }
}
async function testConnection() {
    testing.value = true;
    try {
        const data = (await api.testModelConfig({
            apiUrl: form.apiUrl,
            apiKey: form.apiKey,
            modelName: form.modelName,
            provider: form.provider,
        }));
        testResult.value = data;
        await notify(data.message);
    }
    catch (error) {
        const message = getFriendlyError(error);
        testResult.value = {
            success: false,
            provider: form.provider,
            apiUrl: form.apiUrl,
            modelName: form.modelName,
            statusCode: 0,
            latencyMs: 0,
            message,
            responsePreview: '',
        };
        await notify(message);
    }
    finally {
        testing.value = false;
    }
}
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['preset-card']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-card']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-card']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
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
    ...{ class: "row-between header-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-muted" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.load) },
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.loading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.testConnection) },
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.testing || __VLS_ctx.loading),
});
(__VLS_ctx.testing ? '测试中...' : '测试连通性');
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.save) },
    ...{ class: "btn btn-primary" },
    disabled: (__VLS_ctx.saving || __VLS_ctx.loading),
});
(__VLS_ctx.saving ? '保存中...' : '保存配置');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "preset-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.providerPresets))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.applyPreset(item);
            } },
        key: (item.key),
        type: "button",
        ...{ class: "preset-card hover-lift" },
        ...{ class: ({ active: __VLS_ctx.form.provider === item.provider }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preset-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.modelName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (item.note);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    ...{ onChange: (__VLS_ctx.syncPresetByProvider) },
    value: (__VLS_ctx.form.provider),
    ...{ class: "input" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.providerOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (item.provider),
        value: (item.provider),
    });
    (item.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "inline-check" },
});
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
    placeholder: "https://api.xxx.com/v1/...",
});
(__VLS_ctx.form.apiUrl);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
    placeholder: (__VLS_ctx.hasApiKey ? '留空则保留当前密钥' : '填写后会加密保存'),
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "state success glass-state" },
    });
}
if (__VLS_ctx.testResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "state glass-state" },
        ...{ class: (__VLS_ctx.testResult.success ? 'success' : 'error') },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.testResult.message);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.testResult.statusCode || '-');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.testResult.latencyMs);
    if (__VLS_ctx.testResult.responsePreview) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.testResult.responsePreview);
    }
}
var __VLS_6;
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['header-row']} */ ;
/** @type {__VLS_StyleScopedClasses['title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hover-lift']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-top']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-check']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-state']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-state']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            AppShell: AppShell,
            providerPresets: providerPresets,
            providerOptions: providerOptions,
            form: form,
            loading: loading,
            saving: saving,
            testing: testing,
            hasApiKey: hasApiKey,
            testResult: testResult,
            applyPreset: applyPreset,
            syncPresetByProvider: syncPresetByProvider,
            load: load,
            save: save,
            testConnection: testConnection,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
