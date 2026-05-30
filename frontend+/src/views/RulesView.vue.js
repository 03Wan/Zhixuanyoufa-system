import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { notify } from '@/lib/dialog';
const rules = ref([]);
const selectedRule = ref(null);
const versions = ref([]);
const loading = ref(false);
const error = ref('');
const modal = ref({ type: '' });
const editing = ref({ mode: 'create', ruleId: '', form: emptyForm() });
function emptyForm() { return { name: '', type: '', platform: '', market: '', riskLevel: 'MEDIUM', status: '启用', keywordsText: '', suggestion: '' }; }
function time(v) { if (!v)
    return '-'; const d = new Date(v); if (Number.isNaN(d.getTime()))
    return '-'; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
function typeText(v) { const map = { PLATFORM: '平台规则', MARKET_CULTURE: '市场文化', CATEGORY: '品类规范' }; return map[String(v || '').toUpperCase()] || v || '-'; }
function riskText(v) { const map = { LOW: '低风险', MEDIUM: '中风险', HIGH: '高风险' }; const raw = String(v || '').toUpperCase(); return map[raw] || v || '-'; }
function statusText(status, enabled) { if (status === '启用' || status === '停用')
    return status; if (enabled === false)
    return '停用'; return '启用'; }
function asText(value) { if (Array.isArray(value))
    return value.length ? value.join('、') : '-'; if (typeof value === 'string')
    return value || '-'; if (value && typeof value === 'object')
    return JSON.stringify(value); return '-'; }
function summarizeRule(rule) { const keyword = Array.isArray(rule.keywords) && rule.keywords.length ? `关键词：${rule.keywords.join('、')}` : ''; return keyword || asText(rule.suggestion || rule.description); }
async function loadAll() { loading.value = true; error.value = ''; try {
    rules.value = await api.getRules();
}
catch (e) {
    error.value = getFriendlyError(e);
}
finally {
    loading.value = false;
} }
function closeModal() { modal.value.type = ''; }
function openCreateModal() { editing.value = { mode: 'create', ruleId: '', form: emptyForm() }; modal.value.type = 'create'; }
function openEditModal(rule) { editing.value = { mode: 'edit', ruleId: rule.id, form: { name: rule.name || '', type: typeText(rule.type) === '-' ? '' : typeText(rule.type), platform: rule.platform || '', market: rule.market || '', riskLevel: String(rule.riskLevel || 'MEDIUM').toUpperCase(), status: statusText(rule.status, rule.enabled), keywordsText: Array.isArray(rule.keywords) ? rule.keywords.join(', ') : '', suggestion: asText(rule.suggestion || rule.description) } }; modal.value.type = 'edit'; }
function openDetailModal(rule) { selectedRule.value = rule; modal.value.type = 'detail'; }
async function openVersionModal(rule) { selectedRule.value = rule; versions.value = await api.getRuleVersions(rule.id); modal.value.type = 'version'; }
async function saveEditing() {
    const f = editing.value.form;
    const keywords = String(f.keywordsText || '').split(',').map((s) => s.trim()).filter(Boolean);
    const payload = { name: f.name, type: f.type, platform: f.platform || null, market: f.market || null, riskLevel: f.riskLevel, enabled: f.status === '启用', status: f.status, keywords, suggestion: f.suggestion };
    if (!payload.name || !payload.type) {
        await notify('请填写规则名称和类型。');
        return;
    }
    if (editing.value.mode === 'create')
        await api.createRule(payload);
    else
        await api.updateRule(editing.value.ruleId, payload);
    closeModal();
    await loadAll();
}
async function toggleStatus(rule) { const nextEnabled = statusText(rule.status, rule.enabled) !== '启用'; await api.updateRule(rule.id, { enabled: nextEnabled, status: nextEnabled ? '启用' : '停用' }); await loadAll(); }
async function rollback(versionId) { if (!selectedRule.value)
    return; await api.rollbackRuleVersion(selectedRule.value.id, versionId); versions.value = await api.getRuleVersions(selectedRule.value.id); await loadAll(); }
onMounted(loadAll);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['span-2']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppShell, typeof AppShell, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppShell, new AppShell({
    title: "规则管理",
}));
const __VLS_1 = __VLS_0({
    title: "规则管理",
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.openCreateModal) },
    ...{ class: "btn btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.loadAll) },
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.loading),
});
(__VLS_ctx.loading ? '刷新中' : '刷新');
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "state loading" },
    });
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "state error" },
    });
    (__VLS_ctx.error);
}
else if (__VLS_ctx.rules.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ...{ class: "table rules-table" },
    });
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({
        ...{ class: "actions-col" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [r] of __VLS_getVForSourceType((__VLS_ctx.rules))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            key: (r.id),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (r.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.typeText(r.type));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (r.platform || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (r.market || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.riskText(r.riskLevel));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "content-cell" },
        });
        (__VLS_ctx.summarizeRule(r));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (r.version || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (__VLS_ctx.statusText(r.status, r.enabled));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
            ...{ class: "actions actions-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.rules.length))
                        return;
                    __VLS_ctx.openEditModal(r);
                } },
            ...{ class: "btn btn-secondary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.rules.length))
                        return;
                    __VLS_ctx.openDetailModal(r);
                } },
            ...{ class: "btn btn-secondary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.rules.length))
                        return;
                    __VLS_ctx.openVersionModal(r);
                } },
            ...{ class: "btn btn-secondary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    if (!(__VLS_ctx.rules.length))
                        return;
                    __VLS_ctx.toggleStatus(r);
                } },
            ...{ class: "btn btn-secondary" },
        });
        (__VLS_ctx.statusText(r.status, r.enabled) === '启用' ? '停用' : '启用');
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "empty" },
    });
}
var __VLS_6;
if (__VLS_ctx.modal.type) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "modal-mask" },
    });
    if (__VLS_ctx.modal.type === 'create' || __VLS_ctx.modal.type === 'edit') {
        /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
            as: "section",
            ...{ class: "card modal-panel" },
        }));
        const __VLS_8 = __VLS_7({
            as: "section",
            ...{ class: "card modal-panel" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_9.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "modal-title" },
        });
        (__VLS_ctx.modal.type === 'create' ? '新增规则' : '编辑规则');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            placeholder: "例如：绝对化用语风险",
        });
        (__VLS_ctx.editing.form.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            placeholder: "平台规则 / 市场文化 / 品类规范",
        });
        (__VLS_ctx.editing.form.type);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            placeholder: "Amazon / Shopee / TikTok Shop",
        });
        (__VLS_ctx.editing.form.platform);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            placeholder: "欧美 / 中东 / 东南亚",
        });
        (__VLS_ctx.editing.form.market);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: (__VLS_ctx.editing.form.riskLevel),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "LOW",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "MEDIUM",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "HIGH",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: (__VLS_ctx.editing.form.status),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "span-2" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            placeholder: "最强, 100%有效",
        });
        (__VLS_ctx.editing.form.keywordsText);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "span-2" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
            ...{ class: "input" },
            rows: "3",
            value: (__VLS_ctx.editing.form.suggestion),
            placeholder: "建议替换为客观、可验证的描述。",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.saveEditing) },
            ...{ class: "btn btn-primary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closeModal) },
            ...{ class: "btn btn-secondary" },
        });
        var __VLS_9;
    }
    else if (__VLS_ctx.modal.type === 'detail' && __VLS_ctx.selectedRule) {
        /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
            as: "section",
            ...{ class: "card modal-panel" },
        }));
        const __VLS_11 = __VLS_10({
            as: "section",
            ...{ class: "card modal-panel" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        __VLS_12.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "modal-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "rule-detail" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.selectedRule.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.typeText(__VLS_ctx.selectedRule.type));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.selectedRule.platform || '-');
        (__VLS_ctx.selectedRule.market || '-');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.riskText(__VLS_ctx.selectedRule.riskLevel));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.asText(__VLS_ctx.selectedRule.keywords));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.asText(__VLS_ctx.selectedRule.suggestion || __VLS_ctx.selectedRule.description));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closeModal) },
            ...{ class: "btn btn-secondary" },
        });
        var __VLS_12;
    }
    else if (__VLS_ctx.modal.type === 'version' && __VLS_ctx.selectedRule) {
        /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
            as: "section",
            ...{ class: "card modal-panel" },
        }));
        const __VLS_14 = __VLS_13({
            as: "section",
            ...{ class: "card modal-panel" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "modal-title" },
        });
        (__VLS_ctx.selectedRule.name);
        if (__VLS_ctx.versions.length) {
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
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
            for (const [v] of __VLS_getVForSourceType((__VLS_ctx.versions))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                    key: (v.id),
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                (v.version);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                (v.createdBy);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                (__VLS_ctx.time(v.createdAt));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.modal.type))
                                return;
                            if (!!(__VLS_ctx.modal.type === 'create' || __VLS_ctx.modal.type === 'edit'))
                                return;
                            if (!!(__VLS_ctx.modal.type === 'detail' && __VLS_ctx.selectedRule))
                                return;
                            if (!(__VLS_ctx.modal.type === 'version' && __VLS_ctx.selectedRule))
                                return;
                            if (!(__VLS_ctx.versions.length))
                                return;
                            __VLS_ctx.rollback(v.id);
                        } },
                    ...{ class: "btn btn-secondary" },
                });
            }
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "empty" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closeModal) },
            ...{ class: "btn btn-secondary" },
        });
        var __VLS_15;
    }
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['rules-table']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-col']} */ ;
/** @type {__VLS_StyleScopedClasses['content-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['span-2']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['rule-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            AppShell: AppShell,
            rules: rules,
            selectedRule: selectedRule,
            versions: versions,
            loading: loading,
            error: error,
            modal: modal,
            editing: editing,
            time: time,
            typeText: typeText,
            riskText: riskText,
            statusText: statusText,
            asText: asText,
            summarizeRule: summarizeRule,
            loadAll: loadAll,
            closeModal: closeModal,
            openCreateModal: openCreateModal,
            openEditModal: openEditModal,
            openDetailModal: openDetailModal,
            openVersionModal: openVersionModal,
            saveEditing: saveEditing,
            toggleStatus: toggleStatus,
            rollback: rollback,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
