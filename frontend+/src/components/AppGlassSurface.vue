<template>
  <component :is="as" :class="surfaceClass" :style="surfaceStyle">
    <LiquidGlass
      v-if="dynamicEnabled"
      class="app-glass-surface__liquid"
      :mode="runtimeMode"
      :effect="runtimeEffect"
      :displacement-scale="runtimeDisplacement"
      :blur-amount="runtimeBlur"
      :saturation="runtimeSaturation"
      :aberration-intensity="runtimeAberration"
      :elasticity="runtimeElasticity"
      :corner-radius="radius"
      padding="0"
      :style="overlayStyle"
    >
      <span class="app-glass-surface__fill" />
    </LiquidGlass>
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import { GlassMode, LiquidGlass } from "@wxperia/liquid-glass-vue";
import { useGlassCapability } from "@/composables/useGlassCapability";

type SurfaceVariant = "default" | "soft" | "elevated" | "flat";

const props = withDefaults(
  defineProps<{
    variant?: SurfaceVariant;
    interactive?: boolean;
    padding?: string;
    radius?: number;
    as?: string;
    class?: string;
    forceStatic?: boolean;
  }>(),
  {
    variant: "default",
    interactive: false,
    padding: "",
    radius: 20,
    as: "section",
    class: "",
    forceStatic: false,
  },
);

const capability = useGlassCapability();

const dynamicEnabled = computed(() => capability.enabled.value && capability.mode.value !== "static" && !props.forceStatic);

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

const overlayStyle = computed<CSSProperties>(() => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "100%",
  height: "100%",
  pointerEvents: "none" as const,
}));
</script>

<style scoped>
.app-glass-surface {
  position: relative;
  border-radius: var(--surface-radius, 20px);
  isolation: isolate;
}

.app-glass-surface > :deep(.app-glass-surface__liquid) {
  z-index: 0;
}

.app-glass-surface > :deep(.app-glass-surface__liquid) :deep(.glass) {
  width: 100%;
  height: 100%;
}

.app-glass-surface__fill {
  display: block;
  width: 100%;
  height: 100%;
}

.app-glass-surface--dynamic {
  background: transparent;
  border-color: color-mix(in srgb, var(--glass-border) 74%, rgba(130, 185, 255, 0.26));
  box-shadow: 0 20px 46px rgba(35, 71, 142, 0.14), var(--inner-glow);
}

.app-glass-surface--dynamic > :not(.app-glass-surface__liquid) {
  position: relative;
  z-index: 1;
}

.app-glass-surface--soft {
  --blur-md: 2px;
}

.app-glass-surface--elevated {
  box-shadow: 0 24px 58px rgba(34, 69, 138, 0.2), var(--inner-glow);
}

.app-glass-surface--flat {
  box-shadow: var(--inner-glow);
}

.app-glass-surface--interactive {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.app-glass-surface--interactive:hover {
  transform: translateY(-1px);
}
</style>
