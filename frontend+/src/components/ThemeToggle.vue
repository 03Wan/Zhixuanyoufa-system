<template>
  <button class="btn btn-secondary" @click="toggleTheme">
    <component :is="dark ? Sun : Moon" :size="16" />
    <span v-if="!compact">{{ dark ? "浅色模式" : "深色模式" }}</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { useTheme } from "@/composables/useTheme";

defineProps<{ compact?: boolean }>();
const { dark, initTheme, toggleTheme } = useTheme();
onMounted(initTheme);
</script>

