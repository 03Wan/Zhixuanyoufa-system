import { computed } from "vue";
const props = defineProps();
const tone = computed(() => {
    const map = {
        "低风险": "risk-low", LOW: "risk-low",
        "中风险": "risk-medium", MEDIUM: "risk-medium",
        "高风险": "risk-high", HIGH: "risk-high",
        "严重风险": "risk-critical",
    };
    return map[props.level] || "risk-default";
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: (['risk-badge', __VLS_ctx.tone]) },
});
(__VLS_ctx.level);
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            tone: tone,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
