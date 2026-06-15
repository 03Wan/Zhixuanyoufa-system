import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { GlassMode, LiquidGlass } from "@wxperia/liquid-glass-vue";
import { useGlassCapability } from "@/composables/useGlassCapability";
const props = withDefaults(defineProps(), {
    variant: "default",
    interactive: false,
    padding: "",
    radius: 20,
    as: "section",
    class: "",
    forceStatic: false,
});
const capability = useGlassCapability();
const isDark = ref(false);
let themeObserver = null;
function syncThemeMode() {
    if (typeof document === "undefined")
        return;
    isDark.value = document.documentElement.classList.contains("dark");
}
onMounted(() => {
    syncThemeMode();
    if (typeof MutationObserver === "undefined" || typeof document === "undefined")
        return;
    themeObserver = new MutationObserver(syncThemeMode);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
});
onBeforeUnmount(() => {
    themeObserver?.disconnect();
    themeObserver = null;
});
const dynamicEnabled = computed(() => capability.enabled.value && capability.mode.value !== "static" && !props.forceStatic && !isDark.value);
const runtimeMode = computed(() => (capability.mode.value === "shader" ? GlassMode.shader : GlassMode.standard));
const runtimeEffect = computed(() => (capability.mode.value === "shader" ? "liquidGlass" : "transparentIce"));
const runtimeDisplacement = computed(() => (capability.mode.value === "shader" ? 70 : 52));
const runtimeBlur = computed(() => (capability.mode.value === "shader" ? 0.0625 : 0.05));
const runtimeSaturation = computed(() => (capability.mode.value === "shader" ? 140 : 125));
const runtimeAberration = computed(() => (capability.mode.value === "shader" ? 2 : 0.9));
const runtimeElasticity = computed(() => (capability.mode.value === "shader" ? 0.15 : 0.06));
const surfaceClass = computed(() => [
    "glass",
    "app-glass-surface",
    `app-glass-surface--${props.variant}`,
    {
        "app-glass-surface--interactive": props.interactive,
        "app-glass-surface--dynamic": dynamicEnabled.value,
    },
    props.class,
]);
const surfaceStyle = computed(() => ({
    "--surface-radius": `${props.radius}px`,
    ...(props.padding ? { padding: props.padding } : {}),
}));
const overlayStyle = computed(() => ({
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
}));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    variant: "default",
    interactive: false,
    padding: "",
    radius: 20,
    as: "section",
    class: "",
    forceStatic: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['app-glass-surface']} */ ;
/** @type {__VLS_StyleScopedClasses['app-glass-surface']} */ ;
/** @type {__VLS_StyleScopedClasses['app-glass-surface__liquid']} */ ;
/** @type {__VLS_StyleScopedClasses['app-glass-surface--dynamic']} */ ;
/** @type {__VLS_StyleScopedClasses['app-glass-surface__liquid']} */ ;
/** @type {__VLS_StyleScopedClasses['app-glass-surface--interactive']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = ((__VLS_ctx.as));
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: (__VLS_ctx.surfaceClass) },
    ...{ style: (__VLS_ctx.surfaceStyle) },
}));
const __VLS_2 = __VLS_1({
    ...{ class: (__VLS_ctx.surfaceClass) },
    ...{ style: (__VLS_ctx.surfaceStyle) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
if (__VLS_ctx.dynamicEnabled) {
    const __VLS_5 = {}.LiquidGlass;
    /** @type {[typeof __VLS_components.LiquidGlass, typeof __VLS_components.LiquidGlass, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        ...{ class: "app-glass-surface__liquid" },
        mode: (__VLS_ctx.runtimeMode),
        effect: (__VLS_ctx.runtimeEffect),
        displacementScale: (__VLS_ctx.runtimeDisplacement),
        blurAmount: (__VLS_ctx.runtimeBlur),
        saturation: (__VLS_ctx.runtimeSaturation),
        aberrationIntensity: (__VLS_ctx.runtimeAberration),
        elasticity: (__VLS_ctx.runtimeElasticity),
        cornerRadius: (__VLS_ctx.radius),
        padding: "0",
        ...{ style: (__VLS_ctx.overlayStyle) },
    }));
    const __VLS_7 = __VLS_6({
        ...{ class: "app-glass-surface__liquid" },
        mode: (__VLS_ctx.runtimeMode),
        effect: (__VLS_ctx.runtimeEffect),
        displacementScale: (__VLS_ctx.runtimeDisplacement),
        blurAmount: (__VLS_ctx.runtimeBlur),
        saturation: (__VLS_ctx.runtimeSaturation),
        aberrationIntensity: (__VLS_ctx.runtimeAberration),
        elasticity: (__VLS_ctx.runtimeElasticity),
        cornerRadius: (__VLS_ctx.radius),
        padding: "0",
        ...{ style: (__VLS_ctx.overlayStyle) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_8.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
        ...{ class: "app-glass-surface__fill" },
    });
    var __VLS_8;
}
var __VLS_9 = {};
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['app-glass-surface__liquid']} */ ;
/** @type {__VLS_StyleScopedClasses['app-glass-surface__fill']} */ ;
// @ts-ignore
var __VLS_10 = __VLS_9;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            LiquidGlass: LiquidGlass,
            dynamicEnabled: dynamicEnabled,
            runtimeMode: runtimeMode,
            runtimeEffect: runtimeEffect,
            runtimeDisplacement: runtimeDisplacement,
            runtimeBlur: runtimeBlur,
            runtimeSaturation: runtimeSaturation,
            runtimeAberration: runtimeAberration,
            runtimeElasticity: runtimeElasticity,
            surfaceClass: surfaceClass,
            surfaceStyle: surfaceStyle,
            overlayStyle: overlayStyle,
        };
    },
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
