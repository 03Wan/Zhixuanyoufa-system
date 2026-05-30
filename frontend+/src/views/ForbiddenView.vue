<template>
  <main class="page-stack fade-up">
    <AppGlassSurface as="section" class="card" style="text-align:center; padding: 48px 24px;">
      <h1 style="margin:0; font-size:42px;">403</h1>
      <p class="text-muted" style="margin:10px 0 20px;">当前账号无权限访问该页面。</p>
      <router-link class="btn btn-primary" to="/">返回首页</router-link>
    </AppGlassSurface>
  </main>
</template>

<script setup lang="ts">
import AppGlassSurface from "@/components/AppGlassSurface.vue";
</script>