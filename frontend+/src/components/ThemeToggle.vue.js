import { onMounted } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { useTheme } from "@/composables/useTheme";
const __VLS_props = defineProps();
const { dark, initTheme, toggleTheme } = useTheme();
onMounted(initTheme);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleTheme) },
    ...{ class: "btn btn-secondary" },
});
const __VLS_0 = ((__VLS_ctx.dark ? __VLS_ctx.Sun : __VLS_ctx.Moon));
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    size: (16),
}));
const __VLS_2 = __VLS_1({
    size: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (!__VLS_ctx.compact) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.dark ? "浅色模式" : "深色模式");
}
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Moon: Moon,
            Sun: Sun,
            dark: dark,
            toggleTheme: toggleTheme,
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
