<template>
  <div class="skeleton" :style="{ height }" />
</template>
<script setup lang="ts">
withDefaults(defineProps<{ height?: string }>(), { height: "18px" });
</script>

