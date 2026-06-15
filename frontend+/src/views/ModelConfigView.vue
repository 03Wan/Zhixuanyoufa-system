<template>
  <AppShell title="模型配置">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card block">
        <div class="row-between">
          <div>
            <h2 class="section-title">大模型服务配置</h2>
            <p class="text-muted">模型配置保存在服务端，API Key 会加密存储，仅用于当前账号发起的检测任务。</p>
          </div>
          <button class="btn btn-secondary" :disabled="loading" @click="load">刷新</button>
        </div>

        <div class="model-grid">
          <button
            v-for="item in modelPlans"
            :key="item.key"
            type="button"
            class="model-card"
            :class="{ active: form.modelName === item.modelName }"
            @click="selectPlan(item)"
          >
            <strong>{{ item.name }}</strong>
            <b>{{ item.price }}</b>
          </button>
        </div>

        <div class="field"><label><input type="checkbox" v-model="form.enabled" /> 启用服务端模型配置</label></div>
        <div class="field"><label>API URL</label><input class="input" v-model.trim="form.apiUrl" placeholder="https://.../v1/chat/completions" /></div>
        <div class="field"><label>API Key</label><input class="input" v-model.trim="form.apiKey" :placeholder="hasApiKey ? '留空则保持当前密钥不变' : 'sk-...'" /></div>
        <div class="field"><label>模型名</label><input class="input" v-model.trim="form.modelName" placeholder="gpt-4.1-mini" /></div>
        <p v-if="hasApiKey" class="text-muted">当前状态：服务端已保存 API Key。</p>
        <div class="actions"><button class="btn btn-primary" :disabled="saving || loading" @click="save">{{ saving ? '保存中...' : '保存配置' }}</button></div>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { notify } from '@/lib/dialog';

type ModelPlan = { key: string; name: string; modelName: string; price: string };
const modelPlans: ModelPlan[] = [
  { key: 'gpt', name: 'GPT 系列', modelName: 'gpt-4.1-mini', price: '按量计费 / 套餐开通' },
  { key: 'gemini', name: 'Gemini 系列', modelName: 'gemini-2.5-flash', price: '按量计费 / 套餐开通' },
  { key: 'claude', name: 'Claude 系列', modelName: 'claude-3-5-sonnet', price: '企业版开通' },
];

const form = reactive({ enabled: false, apiUrl: '', apiKey: '', modelName: 'gpt-4.1-mini', provider: 'OPENAI_COMPATIBLE' });
const loading = ref(false);
const saving = ref(false);
const hasApiKey = ref(false);

function selectPlan(plan: ModelPlan) {
  form.modelName = plan.modelName;
}

async function load() {
  loading.value = true;
  try {
    const data: any = await api.getModelConfig();
    form.enabled = !!data.enabled;
    form.apiUrl = String(data.apiUrl || '');
    form.apiKey = '';
    form.modelName = String(data.modelName || 'gpt-4.1-mini');
    form.provider = String(data.provider || 'OPENAI_COMPATIBLE');
    hasApiKey.value = !!data.hasApiKey;
  } catch (error) {
    await notify(getFriendlyError(error));
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    const data: any = await api.saveModelConfig({
      enabled: form.enabled,
      apiUrl: form.apiUrl,
      apiKey: form.apiKey,
      modelName: form.modelName,
      provider: form.provider,
    });
    hasApiKey.value = !!data.hasApiKey;
    form.apiKey = '';
    await notify('模型配置已保存到服务端。');
  } catch (error) {
    await notify(getFriendlyError(error));
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.block { display: grid; gap: 12px; }
.field { display: grid; gap: 6px; }
.actions { display: flex; gap: 8px; }
.model-grid { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.model-card { border: 1px solid var(--border); border-radius: 12px; background: var(--card-strong); padding: 14px; display: grid; gap: 8px; text-align:left; color:inherit; cursor:pointer; }
.model-card.active { border-color: var(--brand-1); box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-1) 18%, transparent); }
.model-card b { color: var(--brand-1); font-size: 13px; }
@media (max-width: 900px) { .model-grid { grid-template-columns: 1fr; } }
</style>
