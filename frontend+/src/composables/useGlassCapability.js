import { computed, ref } from "vue";
function detectCapability() {
    if (typeof window === "undefined") {
        return { enabled: false, mode: "static", reason: "ssr" };
    }
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceMotion) {
        return { enabled: false, mode: "static", reason: "reduce-motion" };
    }
    const supportsBackdrop = typeof CSS !== "undefined" &&
        (CSS.supports("backdrop-filter", "blur(4px)") || CSS.supports("-webkit-backdrop-filter", "blur(4px)"));
    if (!supportsBackdrop) {
        return { enabled: false, mode: "static", reason: "no-backdrop-filter" };
    }
    const nav = navigator;
    const ua = String(nav.userAgent || "").toLowerCase();
    const isSafari = /safari/.test(ua) && !/chrome|chromium|android/.test(ua);
    const isFirefox = /firefox/.test(ua);
    const lowCore = (nav.hardwareConcurrency || 8) <= 4;
    const lowMemory = (nav.deviceMemory || 8) <= 4;
    const saveData = !!nav.connection?.saveData;
    const slowNetwork = ["slow-2g", "2g", "3g"].includes(String(nav.connection?.effectiveType || ""));
    if (saveData || slowNetwork || lowCore || lowMemory) {
        return { enabled: true, mode: "standard", reason: "perf-degrade" };
    }
    if (typeof Worker === "undefined") {
        return { enabled: true, mode: "standard", reason: "no-worker" };
    }
    if (isSafari || isFirefox) {
        return { enabled: true, mode: "standard", reason: "browser-partial-support" };
    }
    return { enabled: true, mode: "shader", reason: "full-support" };
}
const cached = ref(null);
export function useGlassCapability() {
    if (!cached.value) {
        cached.value = detectCapability();
    }
    const enabled = computed(() => cached.value?.enabled ?? false);
    const mode = computed(() => cached.value?.mode ?? "static");
    const reason = computed(() => cached.value?.reason ?? "unknown");
    return {
        enabled,
        mode,
        reason,
    };
}
