<template>
  <AppShell title="套餐中心">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card">
        <h2 class="section-title">套餐中心 / 版本选择</h2>
        <p v-if="notice" class="notice">{{ notice }}</p>
      </AppGlassSurface>

      <AppGlassSurface as="section" v-if="loading" class="card state loading center-loading">套餐加载中</AppGlassSurface>
      <AppGlassSurface as="section" v-else-if="error" class="card state error">{{ error }}</AppGlassSurface>
      <section v-else class="plan-grid">
        <AppGlassSurface as="article" class="card plan-card" v-for="plan in plans" :key="plan.id">
          <div :class="['plan-head', { 'is-current': selectedPlan === plan.name }]">
            <div><h3>{{ plan.name }}</h3><span v-if="selectedPlan === plan.name" class="selected-plan">当前套餐</span></div>
            <strong>{{ displayPrice(plan) }}</strong>
          </div>
          <p class="plan-desc">{{ plan.customerType }}</p>
          <div class="plan-meta">
            <span>计费：{{ plan.billingCycle }}</span>
            <span>月额度：{{ plan.quota ?? '按合同配置' }}</span>
            <span>市场：{{ plan.supportedMarkets ?? '不限/定制' }}</span>
            <span>账号：{{ plan.includedSeats ?? '按需配置' }}</span>
          </div>
          <div class="rights-grid">
            <span :class="{ ok: plan.canExportReport }">报告导出</span>
            <span :class="{ ok: plan.canBatchDetect }">批量检测</span>
            <span :class="{ ok: plan.includedSeats == null || plan.includedSeats > 1 }">团队账号</span>
            <span :class="{ ok: plan.canUseCustomRules }">规则库</span>
            <span :class="{ ok: plan.canUseApi }">API</span>
            <span :class="{ ok: plan.canPrivateDeploy }">私有化</span>
          </div>
          <div class="feature-tags">
            <span v-for="(f, idx) in plan.features?.list || []" :key="idx">{{ f }}</span>
          </div>
          <div class="plan-actions">
            <button class="btn btn-primary plan-primary-action" :disabled="submitting || selectedPlan === plan.name" @click="choose(plan)">{{ submitting ? '正在提交…' : selectedPlan === plan.name ? '当前套餐' : primaryAction(plan.name) }}</button>
            <div v-if="selectedPlan !== plan.name" class="plan-secondary-actions">
              <button :disabled="submitting" @click="submitCommercial(plan, 'API服务')">申请 API 服务</button>
              <span aria-hidden="true"></span>
              <button :disabled="submitting" @click="submitCommercial(plan, '联系定制')">咨询定制方案</button>
            </div>
          </div>
        </AppGlassSurface>
      </section>

      <AppGlassSurface v-if="!loading && addOns.length" as="section" class="card">
        <h2 class="section-title">按需增购</h2>
        <p class="plan-desc">客户自带模型 Key 不收费；平台模型、48小时人工风险抽检和 API 验证独立计费。</p>
        <div class="addon-grid">
          <article v-for="item in addOns" :key="item.id">
            <span>{{ item.category }}</span><h3>{{ item.name }}</h3><strong>{{ item.price }}元 / {{ item.unit }}</strong><p>{{ item.description }}</p>
            <button class="btn btn-secondary" @click="openAddOn(item)">申请开通</button>
          </article>
        </div>
      </AppGlassSurface>

      <div v-if="modal.open" class="modal-mask" @click.self="modal.open=false">
        <AppGlassSurface as="section" class="card modal-panel">
          <h3 class="section-title">{{ modal.type === 'subscription' ? '套餐已更新' : '服务申请已提交' }}</h3>
          <p>{{ modal.message }}</p>
          <div v-if="modal.type === 'application' && !modal.submitted" class="application-form">
            <label>企业名称<input v-model.trim="applicationForm.companyName" placeholder="请输入企业名称" /></label>
            <label>联系人<input v-model.trim="applicationForm.contactName" placeholder="请输入联系人姓名" /></label>
            <label>邮箱<input v-model.trim="applicationForm.email" type="email" placeholder="name@company.com" /></label>
          </div>
          <div v-if="modal.planName" class="result-summary"><b>{{ modal.planName }}</b><span>{{ modal.type === 'subscription' ? '已成为当前套餐，权益和额度已同步更新。' : '申请已进入企业申请列表，系统管理员会收到通知。' }}</span></div>
          <div class="actions" style="justify-content:flex-end;">
            <button v-if="modal.type === 'subscription'" class="btn btn-primary" @click="goMyPlan">查看我的套餐</button>
            <button v-else-if="modal.submitted" class="btn btn-primary" @click="goApplications">查看申请进度</button>
            <button v-else class="btn btn-primary" :disabled="submitting" @click="submitApplication">{{ submitting ? '提交中…' : '提交申请' }}</button>
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
import { useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError, getUserProfile } from '@/lib/api';

const plans = ref<any[]>([]);
const addOns = ref<any[]>([]);
const notice = ref('');
const modal = ref({ open: false, message: '', planName: '', type: 'subscription' as 'subscription' | 'application', submitted: false });
const loading = ref(true);
const error = ref('');
const selectedPlan = ref('');
const submitting = ref(false);
const router = useRouter();
const applicationForm = ref({ companyName: '', contactName: '', email: '' });
const applicationType = ref('');

function primaryAction(name: string) {
  if (name === 'Enterprise') return '联系企业方案';
  if (name === '免费版' || name === 'Starter') return '立即选择';
  return '升级套餐';
}

function displayPrice(plan: any) {
  if (plan.name === '免费版') return '0元，永久免费';
  if (plan.isContactSales) return `共创价${plan.launchAnnualPrice}元/年起`;
  return `共创价${plan.launchMonthlyPrice}元/月 · ${plan.launchAnnualPrice}元/年`;
}

async function choose(plan: any) {
  submitting.value = true;
  try {
    if (plan.isContactSales) return await openCommercial(plan, primaryAction(plan.name));
    const result: any = await api.selectSubscription(plan.name);
    selectedPlan.value = plan.name;
    modal.value = { open: true, planName: plan.name, type: 'subscription', submitted: true, message: result?.notice || `已选择 ${plan.name}，当前套餐权益已刷新。` };
  } catch (e) { modal.value = { open: true, planName: '', type: 'subscription', submitted: false, message: getFriendlyError(e) }; } finally { submitting.value = false; }
}

function openCommercial(plan: any, type: string) {
  const user = getUserProfile() as any;
  applicationForm.value = { companyName: user?.companyName || '', contactName: user?.username || '', email: user?.email || '' };
  applicationType.value = type;
  modal.value = { open: true, planName: plan.name, type: 'application', submitted: false, message: `请填写申请 ${plan.name}${type} 所需的联系人信息。` };
}
async function submitCommercial(plan: any, type: string) {
  openCommercial(plan, type);
}
function openAddOn(item: any) {
  openCommercial({ name: item.name }, item.category);
}
async function submitApplication() {
  const { companyName, contactName, email } = applicationForm.value;
  if (!companyName || !contactName || !email) { modal.value.message = '请填写企业名称、联系人和邮箱。'; return; }
  submitting.value = true;
  try {
    const result: any = await api.applyCommercial({ type: applicationType.value, companyName, contactName, email, note: `${modal.value.planName} - ${applicationType.value}` });
    modal.value = { ...modal.value, submitted: true, message: result?.message || '申请已提交，系统管理员会收到通知。' };
  } catch (e) { modal.value.message = getFriendlyError(e); } finally { submitting.value = false; }
}
function goMyPlan() { modal.value.open = false; router.push('/my-plan'); }
function goApplications() { modal.value.open = false; router.push('/applications'); }

onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const res: any = await api.getPlans();
    plans.value = res.plans || [];
    addOns.value = res.addOns || [];
    notice.value = res.notice || '';
    const usage: any = await api.getSubscriptionUsage();
    selectedPlan.value = usage?.subscription?.plan?.name || '';
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
.plan-head.is-current { padding-bottom: 8px; border-bottom: 1px solid rgba(16, 185, 129, .28); }
.plan-head h3 { margin: 0; font-size: 20px; }
.plan-head strong { color: var(--brand-1); text-align: right; }
.selected-plan { display: inline-flex; margin-top: 6px; padding: 2px 7px; border-radius: 999px; color: #047857; background: rgba(16, 185, 129, .12); font-size: 12px; font-weight: 700; }
.result-summary { display: grid; gap: 4px; margin: 16px 0; padding: 12px; border-radius: 12px; color: var(--text); background: rgba(58, 121, 255, .09); border: 1px solid rgba(58, 121, 255, .2); }
.result-summary span { color: var(--muted); font-size: 13px; }
.application-form { display: grid; gap: 12px; margin: 18px 0; }
.application-form label { display: grid; gap: 6px; color: var(--text); font-size: 13px; font-weight: 700; }
.application-form input { width: 100%; border: 1px solid var(--input-border); border-radius: 10px; padding: 10px 12px; color: var(--text); background: var(--input); font: inherit; }
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
.addon-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
.addon-grid article { display: flex; flex-direction: column; gap: 8px; padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--card-strong); }
.addon-grid article>span { color: var(--brand-1); font-size: 12px; font-weight: 700; }
.addon-grid h3, .addon-grid p { margin: 0; }
.addon-grid h3 { font-size: 15px; }
.addon-grid p { flex: 1; color: var(--muted); font-size: 12px; line-height: 1.5; }
.addon-grid strong { font-size: 14px; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.plan-actions { display: grid; gap: 8px; margin-top: 4px; }
.plan-primary-action { width: 100%; min-height: 44px; }
.plan-secondary-actions { display: flex; align-items: center; justify-content: center; gap: 12px; }
.plan-secondary-actions button { padding: 3px 0; border: 0; background: transparent; color: var(--brand-1); font: inherit; font-size: 13px; cursor: pointer; }
.plan-secondary-actions button:hover { color: var(--brand-0); text-decoration: underline; }
.plan-secondary-actions button:disabled { opacity: .55; cursor: wait; text-decoration: none; }
.plan-secondary-actions span { width: 1px; height: 13px; background: var(--border); }
.modal-mask { position: fixed; inset: 0; background: rgba(15,23,42,.36); display: grid; place-items: center; z-index: 100; }
.modal-panel { width: fit-content; min-width: min(360px, calc(100vw - 32px)); max-width: min(680px, calc(100vw - 32px)); }
@media (max-width: 1200px) { .plan-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .addon-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 900px) { .plan-grid { grid-template-columns: 1fr; } .addon-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .addon-grid { grid-template-columns: 1fr; } }
</style>
