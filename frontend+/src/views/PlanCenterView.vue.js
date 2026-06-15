import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
const plans = ref([]);
const modal = ref({ open: false, message: '' });
const loading = ref(true);
const error = ref('');
function yesNo(v) { return v ? '支持' : '不支持/受限'; }
function primaryAction(name) {
    if (name.includes('定制版'))
        return '联系定制';
    if (name.includes('API接口版'))
        return '申请API试点';
    if (name.includes('体验包') || name.includes('基础版'))
        return '立即选择';
    return '升级套餐';
}
async function choose(plan) {
    if (plan.name.includes('定制版') || plan.name.includes('API接口版')) {
        await openCommercial(plan, primaryAction(plan.name));
        return;
    }
    const result = await api.selectSubscription(plan.name);
    modal.value = { open: true, message: result?.notice || `已提交 ${plan.name} 的套餐变更申请。` };
}
async function openCommercial(plan, type) {
    await api.applyCommercial({ type, note: `${plan.name} - ${type}` });
    modal.value = { open: true, message: `已提交 ${plan.name} 的${type}申请。当前为商业化阶段规划能力，团队将线下联系。` };
}
onMounted(async () => {
    loading.value = true;
    error.value = '';
    try {
        const res = await api.getPlans();
        plans.value = res.plans || [];
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
/** @type {__VLS_StyleScopedClasses['plan-head']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-head']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['rights-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rights-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['rights-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppShell, typeof AppShell, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppShell, new AppShell({
    title: "套餐中心",
}));
const __VLS_1 = __VLS_0({
    title: "套餐中心",
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "plan-grid" },
    });
    for (const [plan] of __VLS_getVForSourceType((__VLS_ctx.plans))) {
        /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
            as: "article",
            ...{ class: "card plan-card" },
            key: (plan.id),
        }));
        const __VLS_14 = __VLS_13({
            as: "article",
            ...{ class: "card plan-card" },
            key: (plan.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_15.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "plan-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (plan.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (plan.priceText);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "plan-desc" },
        });
        (plan.customerType);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "plan-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (plan.billingCycle);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (plan.quota ?? '按合同配置');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (plan.supportedMarkets ?? '定制');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "rights-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ({ ok: plan.canExportReport }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ({ ok: plan.canBatchDetect }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ({ ok: plan.name.includes('企业版') || plan.name.includes('定制版') }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ({ ok: plan.canUseCustomRules }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ({ ok: plan.canUseApi }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ({ ok: plan.canPrivateDeploy }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "feature-tags" },
        });
        for (const [f, idx] of __VLS_getVForSourceType((plan.features?.list || []))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (idx),
            });
            (f);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    __VLS_ctx.choose(plan);
                } },
            ...{ class: "btn btn-primary" },
        });
        (__VLS_ctx.primaryAction(plan.name));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    __VLS_ctx.openCommercial(plan, 'API试点');
                } },
            ...{ class: "btn btn-secondary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.error))
                        return;
                    __VLS_ctx.openCommercial(plan, '联系定制');
                } },
            ...{ class: "btn btn-secondary" },
        });
        var __VLS_15;
    }
}
if (__VLS_ctx.modal.open) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.modal.open))
                    return;
                __VLS_ctx.modal.open = false;
            } },
        ...{ class: "modal-mask" },
    });
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card modal-panel" },
    }));
    const __VLS_17 = __VLS_16({
        as: "section",
        ...{ class: "card modal-panel" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_18.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.modal.message);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.modal.open))
                    return;
                __VLS_ctx.modal.open = false;
            } },
        ...{ class: "btn btn-secondary" },
    });
    var __VLS_18;
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['center-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-head']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['rights-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            AppShell: AppShell,
            plans: plans,
            modal: modal,
            loading: loading,
            error: error,
            primaryAction: primaryAction,
            choose: choose,
            openCommercial: openCommercial,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
