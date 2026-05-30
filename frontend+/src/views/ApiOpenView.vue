<template>
  <AppShell title="API接口版">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card">
        <h2 class="section-title">API接口版</h2>
        <div v-if="loading" class="state loading center-loading">接口清单加载中</div>
        <template v-else>
        <p class="notice">{{ data.notice }}</p>
        <table class="table">
          <thead><tr><th>能力</th><th>路径</th><th>状态</th></tr></thead>
          <tbody><tr v-for="a in data.apis || []" :key="a.path"><td>{{ a.name }}</td><td>{{ a.path }}</td><td>{{ a.status }}</td></tr></tbody>
        </table>
        <div class="actions" style="margin-top:8px;">
          <button class="btn btn-primary" :disabled="saving" @click="apply">{{ saving ? '提交中' : '提交API试点申请' }}</button>
        </div>
        </template>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api } from '@/lib/api';
import { notify } from '@/lib/dialog';

const data = ref<any>({ apis: [] });
const loading = ref(true);
const saving = ref(false);

async function apply() {
  saving.value = true;
  try {
    await api.applyCommercial({ type: 'API接口版试点', note: 'API页面提交' });
    await notify('已提交API试点申请。');
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    data.value = await api.getApiOpenCatalog();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.notice { color:#b45309; }
.table { width:100%; border-collapse: collapse; }
.table th,.table td { border-bottom:1px solid var(--border); padding:8px; }
.actions{ display:flex; gap:8px; }
.center-loading { min-height: 300px; }
</style>
