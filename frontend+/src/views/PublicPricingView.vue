<template>
  <main class="public-page pricing-page">
    <PublicSiteHeader @login="openLogin" @apply="openApply" />

    <section class="public-dark-hero pricing-hero">
      <div class="public-shell pricing-hero-layout">
        <div>
          <p class="public-kicker"><BadgeCheck :size="18" />透明、低门槛的前期价格</p>
          <h1 class="public-title">先用真实 Listing 验证价值，<br />再为团队效率付费</h1>
          <p class="public-lead">永久免费版持续可用。首批共创客户用更低成本启用完整流程，价格锁定 12 个月；客户自带模型 Key 不额外收费。</p>
        </div>
        <div class="pricing-summary">
          <span>首批共创计划</span>
          <b>前 30 家付费客户</b>
          <p>或公开上线后 90 天内购买，以先到条件为准。</p>
          <i><Clock3 :size="18" />共创价格锁定 12 个月</i>
        </div>
      </div>
    </section>

    <section class="public-section plans-section">
      <div class="public-shell">
        <div class="public-section-head center">
          <p class="public-kicker">按当前阶段选择</p>
          <h2>从永久免费，到团队协作和企业服务</h2>
          <p>{{ notice || '套餐额度按月重置；模型调用和平台人工抽检按需购买。' }}</p>
        </div>

        <div v-if="loading" class="pricing-state">套餐加载中…</div>
        <div v-else-if="error" class="pricing-state error">{{ error }}</div>
        <div v-else class="plans">
          <article v-for="plan in plans" :key="plan.name" :class="{ featured: plan.name === 'Growth' }">
            <span v-if="plan.name === 'Growth'" class="recommended">团队推荐</span>
            <div class="plan-title-row">
              <p>{{ plan.name }}</p>
              <small>{{ plan.customerType }}</small>
            </div>
            <div class="price-block">
              <template v-if="plan.name === '免费版'">
                <h2><b>0</b> 元</h2>
                <strong>永久免费 · 每月重置</strong>
              </template>
              <template v-else-if="plan.isContactSales">
                <h2><b>{{ plan.launchAnnualPrice }}</b> 元/年起</h2>
                <strong>标准价 {{ plan.annualPrice }} 元/年起</strong>
              </template>
              <template v-else>
                <h2><b>{{ plan.launchMonthlyPrice }}</b> 元/月</h2>
                <strong>或 {{ plan.launchAnnualPrice }} 元/年</strong>
                <del>标准价 {{ plan.monthlyPrice }} 元/月</del>
              </template>
            </div>
            <div class="plan-facts">
              <span>{{ plan.quota == null ? '定制审校额度' : `每月 ${plan.quota} 条审校` }}</span>
              <span>{{ plan.includedSeats == null ? '组织账号按需配置' : `${plan.includedSeats} 个账号` }}</span>
              <span>{{ plan.supportedMarkets == null ? '不限或定制市场' : `${plan.supportedMarkets} 个市场` }}</span>
            </div>
            <ul>
              <li v-for="item in plan.features?.list || []" :key="item"><Check :size="16" />{{ item }}</li>
            </ul>
            <button class="public-button" :class="plan.name === 'Growth' ? 'primary' : 'blue-outline'" @click="openApply">
              {{ plan.name === '免费版' ? '免费开始' : plan.isContactSales ? '咨询企业方案' : '申请共创价' }}
            </button>
          </article>
        </div>
      </div>
    </section>

    <section class="public-section soft">
      <div class="public-shell">
        <div class="public-section-head center">
          <p class="public-kicker">按需增购</p>
          <h2>订阅保持轻量，成本高的服务单独计费</h2>
          <p>客户自带模型 Key 不收费；平台模型、人工风险抽检和 API 验证用多少买多少。</p>
        </div>
        <div class="add-on-grid">
          <article v-for="item in addOns" :key="item.id">
            <span>{{ item.category }}</span>
            <h3>{{ item.name }}</h3>
            <strong>{{ item.price }} 元 <small>/ {{ item.unit }}</small></strong>
            <p>{{ item.description }}</p>
            <button class="text-action" @click="openApply">申请开通 <ArrowRight :size="15" /></button>
          </article>
        </div>
        <p class="service-boundary">人工复核指客户团队内部复核流程；平台人员提供的是 48 小时风险抽检。深度逐条审核、24 小时加急、私有化部署和规则定制需单独评估。</p>
      </div>
    </section>

    <section class="public-section">
      <div class="public-shell rules-layout">
        <div class="public-section-head">
          <p class="public-kicker">共创价规则</p>
          <h2>优惠有期限，服务有边界</h2>
        </div>
        <ol>
          <li><span>01</span><p>前 30 家付费客户，或公开上线后 90 天内购买，以先到条件为准。</p></li>
          <li><span>02</span><p>共创价格锁定 12 个月；到期前至少 30 天提示续费价格。</p></li>
          <li><span>03</span><p>API、视觉检测、私有化部署等能力按实际开通状态展示，未开通能力需申请评估。</p></li>
        </ol>
      </div>
    </section>

    <section class="public-section">
      <div class="public-shell public-cta">
        <div><p class="public-kicker">从一条真实任务开始</p><h2>免费版不设到期日</h2><p>先验证规则审校与工作流是否适合团队，再决定是否升级。</p></div>
        <button class="public-button primary" @click="openApply">免费开始 <ArrowRight :size="17" /></button>
      </div>
    </section>
    <PublicFooter />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, BadgeCheck, Check, Clock3 } from 'lucide-vue-next';
import PublicSiteHeader from '@/components/PublicSiteHeader.vue';
import PublicFooter from '@/components/PublicFooter.vue';
import { usePublicScrollReveal } from '@/composables/usePublicScrollReveal';
import { api, getFriendlyError } from '@/lib/api';

const router = useRouter();
const plans = ref<any[]>([]);
const addOns = ref<any[]>([]);
const notice = ref('');
const loading = ref(true);
const error = ref('');

usePublicScrollReveal();

function openLogin() { router.push({ path: '/home-public', query: { auth: 'login' } }); }
function openApply() { router.push({ path: '/home-public', query: { apply: 'pilot' } }); }

onMounted(async () => {
  try {
    const result: any = await api.getPlans();
    plans.value = result?.plans || [];
    addOns.value = result?.addOns || [];
    notice.value = result?.notice || '';
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.pricing-hero{min-height:500px}.pricing-hero-layout{min-height:500px;display:grid;grid-template-columns:1.1fr .9fr;gap:70px;align-items:center}.pricing-summary{padding:30px;border:1px solid #3475b8;border-radius:17px;background:rgba(6,30,66,.94);box-shadow:0 24px 70px rgba(0,0,0,.28)}.pricing-summary>span{color:#59ddf5;font-weight:800}.pricing-summary>b{display:block;margin:15px 0 7px;color:#fff;font-size:28px}.pricing-summary p{margin:0;color:#aebfd9;line-height:1.7}.pricing-summary i{margin-top:23px;padding-top:17px;display:flex;align-items:center;gap:9px;border-top:1px solid #28517e;color:#d8e8fb;font-style:normal}.plans{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;align-items:stretch}.plans article{position:relative;padding:23px 20px;display:flex;flex-direction:column;border:1px solid var(--public-line);border-radius:15px;background:#fff}.plans article.featured{border:2px solid var(--public-blue);box-shadow:0 22px 50px rgba(37,99,235,.14);transform:translateY(-8px)}.plan-title-row>p{margin:0;color:var(--public-blue);font-size:18px;font-weight:900}.plan-title-row small{display:block;margin-top:7px;min-height:36px;color:var(--public-muted);line-height:1.45}.price-block{min-height:116px;padding:16px 0;border-bottom:1px solid var(--public-line)}.price-block h2{margin:0 0 5px;color:var(--public-ink);font-size:18px}.price-block h2 b{font-size:30px}.price-block strong{display:block;color:#a66100;font-size:13px}.price-block del{display:block;margin-top:5px;color:#8a97a8;font-size:12px}.plan-facts{display:grid;gap:6px;margin:16px 0}.plan-facts span{font-size:12px;color:#42546b}.plans ul{list-style:none;margin:0 0 20px;padding:0;display:grid;gap:11px;flex:1;color:var(--public-muted);font-size:13px}.plans li{display:flex;align-items:flex-start;gap:7px;line-height:1.45}.plans li svg{flex:0 0 auto;margin-top:2px;color:var(--public-success)}.plans .public-button{width:100%;padding:0 10px}.recommended{position:absolute;right:14px;top:12px;padding:4px 7px;border-radius:999px;background:#e9f1ff;color:var(--public-blue);font-size:10px;font-weight:900}.pricing-state{padding:60px 20px;text-align:center;color:var(--public-muted)}.pricing-state.error{color:#b42318}.add-on-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.add-on-grid article{padding:22px;border:1px solid var(--public-line);border-radius:15px;background:#fff}.add-on-grid article>span{color:var(--public-blue);font-size:12px;font-weight:800}.add-on-grid h3{min-height:48px;margin:10px 0 8px;font-size:17px}.add-on-grid strong{color:var(--public-ink);font-size:23px}.add-on-grid strong small{font-size:12px}.add-on-grid p{min-height:76px;color:var(--public-muted);font-size:13px;line-height:1.6}.text-action{display:flex;align-items:center;gap:5px;padding:0;border:0;background:transparent;color:var(--public-blue);font:inherit;font-size:13px;font-weight:800;cursor:pointer}.service-boundary{margin:22px 0 0;padding:16px 18px;border-left:3px solid var(--public-blue);background:#fff;color:var(--public-muted);line-height:1.65}.rules-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:70px}.rules-layout ol{list-style:none;margin:0;padding:0}.rules-layout li{padding:19px 0;display:grid;grid-template-columns:55px 1fr;align-items:start;border-top:1px solid #cbd8e9}.rules-layout li:last-child{border-bottom:1px solid #cbd8e9}.rules-layout span{color:var(--public-blue);font-size:21px;font-weight:900}.rules-layout p{margin:0;color:var(--public-muted);line-height:1.7}@media(max-width:1180px){.plans{grid-template-columns:repeat(3,1fr)}.add-on-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:850px){.pricing-hero-layout,.rules-layout{grid-template-columns:1fr}.pricing-hero-layout{padding:62px 0;gap:35px}.plans,.add-on-grid{grid-template-columns:1fr 1fr}.plans article.featured{transform:none}}@media(max-width:560px){.plans,.add-on-grid{grid-template-columns:1fr}.pricing-summary>b{font-size:23px}}
</style>
