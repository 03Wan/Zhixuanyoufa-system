import { onMounted, reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { confirmDialog, notify } from '@/lib/dialog';
const rows = ref([]);
const loading = ref(true);
const saving = ref(false);
const editor = reactive({ open: false, id: '', name: '', code: '', scope: 'SYSTEM', versionNo: 1, sectionsText: '' });
function sections(schema) { return (schema?.sections || []).join('、') || '-'; }
function codeText(code) {
    const map = { MVP_STANDARD: '标准审核模板' };
    return map[String(code || '')] || code || '-';
}
function scopeText(scope) {
    const map = { SYSTEM: '系统通用', COMPANY: '企业专属', CUSTOM: '定制模板' };
    return map[String(scope || '').toUpperCase()] || scope || '-';
}
async function load() {
    loading.value = true;
    try {
        rows.value = await api.getReportTemplates();
    }
    catch (e) {
        await notify(getFriendlyError(e));
    }
    finally {
        loading.value = false;
    }
}
function openCreate() {
    Object.assign(editor, { open: true, id: '', name: '', code: '', scope: 'SYSTEM', versionNo: 1, sectionsText: '封面、基础信息、评分、风险、建议、复核' });
}
function openEdit(item) {
    Object.assign(editor, {
        open: true,
        id: item.id,
        name: item.name || '',
        code: item.code || '',
        scope: item.scope || 'SYSTEM',
        versionNo: item.versionNo || 1,
        sectionsText: sections(item.schema),
    });
}
function closeEditor() { editor.open = false; }
function parseSections() {
    return String(editor.sectionsText || '')
        .split(/[、,，\n]/)
        .map((x) => x.trim())
        .filter(Boolean);
}
async function saveTemplate() {
    if (!editor.name || !editor.code) {
        await notify('请填写模板名称和编码。');
        return;
    }
    saving.value = true;
    try {
        const payload = { name: editor.name, code: editor.code, scope: editor.scope, versionNo: editor.versionNo || 1, schema: { sections: parseSections() } };
        if (editor.id)
            await api.updateReportTemplate(editor.id, payload);
        else
            await api.createReportTemplate(payload);
        closeEditor();
        await load();
        await notify('模板已保存。');
    }
    catch (e) {
        await notify(getFriendlyError(e));
    }
    finally {
        saving.value = false;
    }
}
async function removeTemplate(item) {
    if (!item?.id)
        return;
    if (!(await confirmDialog(`确认删除模板「${item.name || '-'}」吗？`)))
        return;
    try {
        await api.deleteReportTemplate(item.id);
        await load();
    }
    catch (e) {
        await notify(getFriendlyError(e));
    }
}
onMounted(load);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppShell, typeof AppShell, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppShell, new AppShell({
    title: "报告模板",
}));
const __VLS_1 = __VLS_0({
    title: "报告模板",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-stack fade-up" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "glass card" },
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.load) },
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.loading),
});
(__VLS_ctx.loading ? '刷新中' : '刷新');
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.openCreate) },
    ...{ class: "btn btn-primary" },
});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "state loading center-loading" },
    });
}
else {
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
    for (const [t] of __VLS_getVForSourceType((__VLS_ctx.rows))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            key: (t.id),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (t.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.codeText(t.code));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.scopeText(t.scope));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (t.versionNo);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.sections(t.schema));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.openEdit(t);
                } },
            ...{ class: "btn btn-secondary btn-xs" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.removeTemplate(t);
                } },
            ...{ class: "btn btn-secondary btn-xs" },
        });
    }
}
if (__VLS_ctx.editor.open) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeEditor) },
        ...{ class: "modal-mask" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "glass card modal-panel template-modal" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "section-title" },
    });
    (__VLS_ctx.editor.id ? '编辑模板' : '新增模板');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ class: "input" },
        placeholder: "模板名称",
    });
    (__VLS_ctx.editor.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ class: "input" },
        placeholder: "模板编码",
    });
    (__VLS_ctx.editor.code);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ class: "input" },
        value: (__VLS_ctx.editor.scope),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "SYSTEM",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "COMPANY",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "CUSTOM",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ class: "input" },
        type: "number",
        placeholder: "版本号",
    });
    (__VLS_ctx.editor.versionNo);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        ...{ class: "input" },
        value: (__VLS_ctx.editor.sectionsText),
        placeholder: "模板结构，用中文顿号或逗号分隔，如：封面、基础信息、评分、风险、建议、复核",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions dialog-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeEditor) },
        ...{ class: "btn btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.saveTemplate) },
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.saving),
    });
    (__VLS_ctx.saving ? '保存中' : '保存');
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['center-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['template-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppShell: AppShell,
            rows: rows,
            loading: loading,
            saving: saving,
            editor: editor,
            sections: sections,
            codeText: codeText,
            scopeText: scopeText,
            load: load,
            openCreate: openCreate,
            openEdit: openEdit,
            closeEditor: closeEditor,
            saveTemplate: saveTemplate,
            removeTemplate: removeTemplate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
