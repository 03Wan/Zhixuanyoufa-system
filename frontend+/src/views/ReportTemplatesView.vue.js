import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { confirmDialog, notify, toast } from '@/lib/dialog';
const presetSections = ['封面', '基础信息', '评分', '风险', '建议', '复核'];
const rows = ref([]);
const loading = ref(true);
const saving = ref(false);
const editor = reactive({
    open: false,
    id: '',
    name: '',
    code: '',
    scope: 'SYSTEM',
    versionNo: 1,
    sections: [],
    customSection: '',
});
function sections(schema) {
    return (schema?.sections || []).join('、') || '-';
}
function codeText(code) {
    const map = { MVP_STANDARD: '标准审核模板' };
    return map[String(code || '')] || code || '-';
}
function scopeText(scope) {
    const map = { SYSTEM: '系统通用', COMPANY: '企业专属', CUSTOM: '定制模板' };
    return map[String(scope || '').toUpperCase()] || scope || '-';
}
function normalizeSections(input) {
    const list = Array.isArray(input?.sections) ? input.sections : [];
    const cleaned = list.map((x) => String(x || '').trim()).filter(Boolean);
    return Array.from(new Set(cleaned));
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
    Object.assign(editor, {
        open: true,
        id: '',
        name: '',
        code: '',
        scope: 'SYSTEM',
        versionNo: 1,
        sections: [...presetSections],
        customSection: '',
    });
}
function openEdit(item) {
    Object.assign(editor, {
        open: true,
        id: item.id,
        name: item.name || '',
        code: item.code || '',
        scope: item.scope || 'SYSTEM',
        versionNo: item.versionNo || 1,
        sections: normalizeSections(item.schema),
        customSection: '',
    });
}
function closeEditor() {
    editor.open = false;
}
function togglePreset(section) {
    if (editor.sections.includes(section)) {
        editor.sections = editor.sections.filter((x) => x !== section);
        return;
    }
    editor.sections = [...editor.sections, section];
}
async function addCustomSection() {
    const value = String(editor.customSection || '').trim();
    if (!value) {
        await notify('请输入自定义模块名称。');
        return;
    }
    if (!editor.sections.includes(value)) {
        editor.sections = [...editor.sections, value];
    }
    editor.customSection = '';
}
function removeSection(section) {
    editor.sections = editor.sections.filter((x) => x !== section);
}
function parseSections() {
    const cleaned = editor.sections.map((x) => String(x || '').trim()).filter(Boolean);
    return Array.from(new Set(cleaned));
}
async function saveTemplate() {
    if (!editor.name || !editor.code) {
        await notify('请填写模板名称和编码。');
        return;
    }
    const sectionList = parseSections();
    if (!sectionList.length) {
        await notify('请至少选择一个结构模块。');
        return;
    }
    saving.value = true;
    try {
        const payload = {
            name: editor.name,
            code: editor.code,
            scope: editor.scope,
            versionNo: editor.versionNo || 1,
            schema: { sections: sectionList },
        };
        if (editor.id)
            await api.updateReportTemplate(editor.id, payload);
        else
            await api.createReportTemplate(payload);
        closeEditor();
        await load();
        toast('模板已保存', 'success');
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
        toast('模板已删除', 'success');
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
/** @type {__VLS_StyleScopedClasses['preset-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-row']} */ ;
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
var __VLS_6;
const __VLS_7 = {}.Teleport;
/** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
    to: "body",
}));
const __VLS_9 = __VLS_8({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_10.slots.default;
if (__VLS_ctx.editor.open) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeEditor) },
        ...{ class: "modal-mask" },
    });
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card modal-panel template-modal" },
    }));
    const __VLS_12 = __VLS_11({
        as: "section",
        ...{ class: "card modal-panel template-modal" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_13.slots.default;
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "section-picker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "picker-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preset-grid" },
    });
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.presetSections))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            key: (section),
            ...{ class: "preset-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onChange: (...[$event]) => {
                    if (!(__VLS_ctx.editor.open))
                        return;
                    __VLS_ctx.togglePreset(section);
                } },
            type: "checkbox",
            checked: (__VLS_ctx.editor.sections.includes(section)),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (section);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "custom-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onKeydown: (__VLS_ctx.addCustomSection) },
        ...{ class: "input" },
        placeholder: "新增自定义模块，如：合规声明",
    });
    (__VLS_ctx.editor.customSection);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.addCustomSection) },
        ...{ class: "btn btn-secondary" },
        type: "button",
    });
    if (__VLS_ctx.editor.sections.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "picked-list" },
        });
        for (const [section] of __VLS_getVForSourceType((__VLS_ctx.editor.sections))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "picked-tag" },
                key: (section),
            });
            (section);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.editor.open))
                            return;
                        if (!(__VLS_ctx.editor.sections.length))
                            return;
                        __VLS_ctx.removeSection(section);
                    } },
                type: "button",
                ...{ class: "tag-remove" },
            });
        }
    }
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
    var __VLS_13;
}
var __VLS_10;
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
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
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['template-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['section-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['picker-title']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['preset-item']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-row']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['picked-list']} */ ;
/** @type {__VLS_StyleScopedClasses['picked-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-remove']} */ ;
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
            AppGlassSurface: AppGlassSurface,
            AppShell: AppShell,
            presetSections: presetSections,
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
            togglePreset: togglePreset,
            addCustomSection: addCustomSection,
            removeSection: removeSection,
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
