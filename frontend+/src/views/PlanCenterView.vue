<template>
  <AppShell title="套餐中心">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card">
        <h2 class="section-title">套餐中心 / 版本选择</h2>
      </AppGlassSurface>

      <AppGlassSurface as="section" v-if="loading" class="card state loading center-loading">套餐加载中</AppGlassSurface>
      <AppGlassSurface as="section" v-else-if="error" class="card state error">{{ error }}</AppGlassSurface>
      <section v-else class="plan-grid">
        <AppGlassSurface as="article" class="card plan-card" v-for="plan in plans" :key="plan.id">
          <div class="plan-head">
            <h3>{{ plan.name }}</h3>
            <strong>{{ plan.priceText }}</strong>
          </div>
          <p class="plan-desc">{{ plan.customerType }}</p>
          <div class="plan-meta">
            <span>计费：{{ plan.billingCycle }}</span>
            <span>额度：{{ plan.quota ?? '按合同配置' }}</span>
            <span>市场：{{ plan.supportedMarkets ?? '定制' }}</span>
          </div>
          <div class="rights-grid">
            <span :class="{ ok: plan.canExportReport }">报告导出</span>
            <span :class="{ ok: plan.canBatchDetect }">批量检测</span>
            <span :class="{ ok: plan.name.includes('企业版') || plan.name.includes('定制版') }">团队账号</span>
            <span :class="{ ok: plan.canUseCustomRules }">规则库</span>
            <span :class="{ ok: plan.canUseApi }">API</span>
            <span :class="{ ok: plan.canPrivateDeploy }">私有化</span>
          </div>
          <div class="feature-tags">
            <span v-for="(f, idx) in plan.features?.list || []" :key="idx">{{ f }}</span>
          </div>
          <div class="actions">
            <button class="btn btn-primary" @click="choose(plan)">{{ primaryAction(plan.name) }}</button>
            <button class="btn btn-secondary" @click="openCommercial(plan, 'API试点')">申请API试点</button>
            <button class="btn btn-secondary" @click="openCommercial(plan, '联系定制')">联系定制</button>
          </div>
        </AppGlassSurface>
      </section>

      <div v-if="modal.open" class="modal-mask" @click.self="modal.open=false">
        <AppGlassSurface as="section" class="card modal-panel">
          <h3 class="section-title">商业化阶段能力说明</h3>
          <p>{{ modal.message }}</p>
          <div class="actions" style="justify-content:flex-end;">
            <button class="btn btn-secondary" @click="modal.open=false">关闭</button>
          </div>
        </AppGlassSurface>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';

const plans = ref<any[]>([]);
const modal = ref({ open: false, message: '' });
const loading = ref(true);
const error = ref('');

function yesNo(v: boolean) { return v ? '支持' : '不支持/受限'; }
function primaryAction(name: string) {
  if (name.includes('定制版')) return '联系定制';
  if (name.includes('API接口版')) return '申请API试点';
  if (name.includes('体验包') || name.includes('基础版')) return '立即选择';
  return '升级套餐';
}

async function choose(plan: any) {
  if (plan.name.includes('定制版') || plan.name.includes('API接口版')) {
    await openCommercial(plan, primaryAction(plan.name));
    return;
  }
  const result: any = await api.selectSubscription(plan.name);
  modal.value = { open: true, message: result?.notice || `已提交 ${plan.name} 的套餐变更申请。` };
}

async function openCommercial(plan: any, type: string) {
  await api.applyCommercial({ type, note: `${plan.name} - ${type}` });
  modal.value = { open: true, message: `已提交 ${plan.name} 的${type}申请。当前为商业化阶段规划能力，团队将线下联系。` };
}

onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const res: any = await api.getPlans();
    plans.value = res.plans || [];
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.plan-grid { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.plan-card { display: grid; gap: 10px; }
.plan-head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
.plan-head h3 { margin: 0; font-size: 20px; }
.plan-head strong { color: var(--brand-1); text-align: right; }
.plan-desc { margin: 0; color: var(--muted); min-height: 42px; }
.plan-meta, .feature-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.plan-meta span, .feature-tags span, .rights-grid span {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 8px;
  background: var(--card-strong);
  font-size: 12px;
}
.rights-grid { display: grid; gap: 6px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.rights-grid span { text-align: center; color: var(--muted); }
.rights-grid span.ok { color: #047857; border-color: rgba(16, 185, 129, .35); background: rgba(16, 185, 129, .1); }
.center-loading { min-height: 360px; }
.notice { color: #b45309; margin: 6px 0 0; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.modal-mask { position: fixed; inset: 0; background: rgba(15,23,42,.36); display: grid; place-items: center; z-index: 100; }
.modal-panel { width: fit-content; min-width: min(360px, calc(100vw - 32px)); max-width: min(680px, calc(100vw - 32px)); }
@media (max-width: 1200px) { .plan-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 900px) { .plan-grid { grid-template-columns: 1fr; } }
</style>
