<template>
  <span :class="['risk-badge', tone]">{{ level }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{ level: string }>();
const tone = computed(() => {
  const map: Record<string, string> = {
    "低风险": "risk-low", LOW: "risk-low",
    "中风险": "risk-medium", MEDIUM: "risk-medium",
    "高风险": "risk-high", HIGH: "risk-high",
    "严重风险": "risk-critical",
  };
  return map[props.level] || "risk-default";
});
</script>

