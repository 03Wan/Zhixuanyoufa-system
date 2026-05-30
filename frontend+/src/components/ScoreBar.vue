<template>
  <div class="score-wrap">
    <div class="row-between text-muted"><span>{{ label }}</span><span>{{ value }}</span></div>
    <div class="score-bar"><div class="score-fill" :style="{ width: `${Math.max(0, Math.min(100, value))}%` }" /></div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ label: string; value: number }>();
</script>

