<template>
  <AppShell title="我的套餐">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" v-if="loading" class="card state loading center-loading">套餐数据加载中</AppGlassSurface>
      <AppGlassSurface as="section" v-else-if="error" class="card state error">{{ error }}</AppGlassSurface>
      <AppGlassSurface as="section" class="card" v-else-if="data">
        <h2 class="section-title">我的套餐</h2>
        <div class="grid-3">
          <AppGlassSurface as="article" class="card kpi"><p>当前套餐</p><h3>{{ data.subscription.plan.name }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>套餐价格</p><h3>{{ data.subscription.plan.priceText }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>计费周期</p><h3>{{ data.subscription.plan.billingCycle }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>套餐状态</p><h3>{{ statusText(data.subscription.status) }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>当前检测额度</p><h3>{{ usage.quotaTotal }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>已使用次数</p><h3>{{ usage.quotaUsed }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>剩余次数</p><h3>{{ usage.quotaRemaining }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>报告导出权限</p><h3>{{ yesNo(usage.privileges?.canExportReport) }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>批量检测</p><h3>{{ yesNo(usage.privileges?.canBatchDetect) }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>API接口</p><h3>{{ yesNo(usage.privileges?.canUseApi) }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>私有化部署</p><h3>{{ yesNo(usage.privileges?.canPrivateDeploy) }}</h3></AppGlassSurface>
        </div>
        <AppGlassSurface as="section" class="card" style="margin-top:10px;">
          <h3>升级建议</h3>
          <p>{{ data.suggestion }}</p>
          <p>可申请平台模型包、人工风险抽检、API验证包或企业定制服务。</p>
          <div class="actions">
            <button class="btn btn-primary" @click="goPlans">升级套餐</button>
            <button class="btn btn-secondary" @click="apply">联系定制</button>
          </div>
        </AppGlassSurface>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { notify } from '@/lib/dialog';

const router = useRouter();
const data = ref<any>(null);
const usage = ref<any>({ privileges: {} });
const loading = ref(true);
const error = ref('');

function yesNo(v: boolean) { return v ? '支持' : '不支持/受限'; }
function statusText(status?: string) {
  const map: Record<string, string> = { ACTIVE: '生效中', INACTIVE: '未生效', EXPIRED: '已到期', CANCELLED: '已取消' };
  return map[String(status || '').toUpperCase()] || status || '-';
}
function goPlans() { router.push('/plans'); }

async function apply() {
  await api.applyCommercial({ type: '企业方案咨询', note: '我的套餐页发起' });
  await notify('已提交企业方案需求，团队会线下联系。');
}

onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    data.value = await api.getMySubscription();
    usage.value = await api.getSubscriptionUsage();
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.center-loading { min-height: 360px; }
.grid-3 { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.kpi { border-radius: 10px; padding: 10px; }
.kpi p { margin: 0; color: var(--muted); }
.kpi h3 { margin: 6px 0 0; font-size: 20px; }
.actions { display: flex; gap: 8px; }
.notice { color: #b45309; }
@media (max-width: 1000px) { .grid-3 { grid-template-columns: 1fr; } }
</style>
