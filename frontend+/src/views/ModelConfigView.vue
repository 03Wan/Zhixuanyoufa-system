<template>
  <AppShell title="模型配置">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card block">
        <div class="row-between">
          <div>
            <h2 class="section-title">大模型服务配置</h2>
            <p class="text-muted">平台可提供 GPT、Gemini、Claude Code 等模型服务，需用户购买后开通；也支持用户自行配置大模型 API。</p>
          </div>
          <button class="btn btn-secondary" @click="load">重置</button>
        </div>
        <div class="model-grid">
          <button v-for="item in modelPlans" :key="item.key" type="button" class="model-card" :class="{ active: selectedPlan?.key === item.key }" @click="selectPlan(item)">
            <strong>{{ item.name }}</strong>
            <b>{{ item.price }}</b>
          </button>
        </div>
        <section v-if="selectedPlan" class="model-detail">
          <div class="row-between">
            <div><h3>{{ selectedPlan.name }}</h3><p>{{ selectedPlan.desc }}</p></div>
            <button class="btn btn-primary" @click="choosePlan(selectedPlan)">选择该模型服务</button>
          </div>
          <div class="feature-tags"><span v-for="f in selectedPlan.features" :key="f">{{ f }}</span></div>
        </section>
        <div class="field"><label><input type="checkbox" v-model="form.enabled" /> 启用自有 API 配置</label></div>
        <div class="field"><label>API URL</label><input class="input" v-model.trim="form.apiUrl" placeholder="https://.../v1/chat/completions" /></div>
        <div class="field"><label>API Key</label><input class="input" v-model.trim="form.apiKey" placeholder="sk-..." /></div>
        <div class="field"><label>模型名</label><input class="input" v-model.trim="form.modelName" placeholder="gpt5.5" /></div>
        <div class="actions"><button class="btn btn-primary" @click="save">保存配置</button></div>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { notify } from '@/lib/dialog';

type ModelPlan = { key: string; name: string; modelName: string; price: string; desc: string; features: string[] };
const modelPlans: ModelPlan[] = [
  { key: 'gpt', name: 'GPT 系列', modelName: 'gpt5.5', price: '按量计费 / 套餐开通', desc: '适用于文案检测、风险解释、优化建议生成。', features: ['文本检测', '优化建议', '报告摘要'] },
  { key: 'gemini', name: 'Gemini 系列', modelName: 'gemini-pro', price: '按量计费 / 套餐开通', desc: '适用于图文混合素材、多模态理解与平台适配判断。', features: ['图文理解', '多市场适配', '素材归因'] },
  { key: 'claude', name: 'Claude Code', modelName: 'claude-code', price: '企业版开通', desc: '适用于规则解释、结构化输出和复杂审核流程辅助。', features: ['规则解释', '结构化输出', '企业流程'] },
];
const selectedPlan = ref<ModelPlan | null>(null);
const form = reactive({ enabled: false, apiUrl: '', apiKey: '', modelName: 'gpt5.5' });

function selectPlan(plan: ModelPlan) { selectedPlan.value = plan; }
async function choosePlan(plan: ModelPlan) { form.modelName = plan.modelName; await notify(`已选择 ${plan.name}，具体价格和开通方式需购买后由团队配置。`); }
function load() {
  try {
    const raw = localStorage.getItem('zyyf_model_config');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    form.enabled = !!parsed.enabled;
    form.apiUrl = String(parsed.apiUrl || '');
    form.apiKey = String(parsed.apiKey || '');
    form.modelName = String(parsed.modelName || 'gpt5.5');
  } catch {}
}
async function save() { localStorage.setItem('zyyf_model_config', JSON.stringify(form)); await notify('模型配置已保存。'); }
load();
</script>

<style scoped>
.block { display: grid; gap: 12px; }
.field { display: grid; gap: 6px; }
.actions { display: flex; gap: 8px; }
.model-grid { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.model-card { border: 1px solid var(--border); border-radius: 12px; background: var(--card-strong); padding: 14px; display: grid; gap: 8px; text-align:left; color:inherit; cursor:pointer; }
.model-card.active { border-color: var(--brand-1); box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-1) 18%, transparent); }
.model-card b { color: var(--brand-1); font-size: 13px; }
.model-detail { border: 1px solid var(--border); border-radius: 14px; background: var(--card-strong); padding: 12px; }
.model-detail h3 { margin: 0 0 4px; }
.model-detail p { margin: 0; color: var(--muted); }
.feature-tags { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
.feature-tags span { border:1px solid var(--border); border-radius:999px; padding:4px 8px; font-size:12px; }
@media (max-width: 900px) { .model-grid { grid-template-columns: 1fr; } }
</style>
