<template>
  <main class="public-page pricing-page">
    <PublicSiteHeader @login="openLogin" @apply="openApply" />
    <section class="public-dark-hero pricing-hero"><div class="public-shell pricing-hero-layout"><div><p class="public-kicker"><BadgeCheck :size="18" />套餐价格</p><h1 class="public-title">先验证发布前流程，<br />再扩大使用范围</h1><p class="public-lead">首批共创价以真实使用、定期反馈和脱敏结果验证为前提，锁定 12 个月；套餐事实与价格保持透明。</p></div><div class="pricing-summary"><span>共创计划</span><b>首批 30 家正式付费企业</b><p>或公开上线后 90 天内申请，以先到条件为准。</p><i><Clock3 :size="18" />共创价格锁定 12 个月</i></div></div></section>

    <section class="public-section plans-section"><div class="public-shell"><div class="public-section-head center"><p class="public-kicker">选择适合当前阶段的计划</p><h2>从单次验证，到团队协作与专有规则</h2><p>所有套餐继续使用现有价格和能力描述，不引入未上线承诺。</p></div><div class="plans"><article v-for="plan in plans" :key="plan.name" :class="{ featured: plan.name === 'Growth' }"><span v-if="plan.name === 'Growth'" class="recommended">团队推荐</span><p>{{ plan.name }}</p><h2>{{ plan.list }}</h2><strong v-if="plan.launch">{{ plan.launch }}</strong><small v-else>标准体验计划</small><ul><li v-for="item in plan.items" :key="item"><Check :size="16" />{{ item }}</li></ul><button class="public-button" :class="plan.name === 'Growth' ? 'primary' : 'blue-outline'" @click="openApply">{{ plan.name === '免费体验' ? '开始体验' : '申请共创价' }}</button></article></div></div></section>

    <section class="public-section soft"><div class="public-shell rules-layout"><div class="public-section-head"><p class="public-kicker">共创价规则</p><h2>边界清楚，承诺可核对</h2></div><ol><li><span>01</span><p>首批 30 家正式付费企业，或公开上线后 90 天内申请，以先到条件为准。</p></li><li><span>02</span><p>共创价格锁定 12 个月；续费前至少 30 天提示正式价格。</p></li><li><span>03</span><p>客户案例、企业名称和 Logo 仅在单独授权后使用。</p></li></ol></div></section>
    <section class="public-section"><div class="public-shell public-cta"><div><p class="public-kicker">首批共创</p><h2>用一个真实发布任务开始验证</h2><p>先确认平台、市场、类目与团队协作方式。</p></div><button class="public-button primary" @click="openApply">申请共创价 <ArrowRight :size="17" /></button></div></section>
    <PublicFooter />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowRight, BadgeCheck, Check, Clock3 } from 'lucide-vue-next';
import PublicSiteHeader from '@/components/PublicSiteHeader.vue';
import PublicFooter from '@/components/PublicFooter.vue';
import { usePublicScrollReveal } from '@/composables/usePublicScrollReveal';
const router = useRouter();
usePublicScrollReveal();
const plans = [
  { name: '免费体验', list: '0元 / 7天', items: ['5条 Listing', '单账号', '在线查看结果'] },
  { name: 'Starter', list: '399元 / 月', launch: '首批共创价 199元 / 月', items: ['基础审校额度', '基础规则模板', '结果导出'] },
  { name: 'Growth', list: '999元 / 月', launch: '首批共创价 599元 / 月', items: ['3–10人团队', '批量审校', '人工复核与审计'] },
  { name: 'Pro', list: '2499元 / 月', launch: '首批共创价 1499元 / 月', items: ['多店铺与审批流', '自定义规则', '批量导出与 API'] },
  { name: 'Enterprise', list: '6万–12万元 / 年', launch: '首年3.98万元起', items: ['专有规则与培训', 'SLA与定制报表', '可选私有化'] },
];
function openLogin() { router.push({ path: '/home-public', query: { auth: 'login' } }); }
function openApply() { router.push({ path: '/home-public', query: { apply: 'pilot' } }); }
</script>

<style scoped>
.pricing-hero{min-height:500px}.pricing-hero-layout{min-height:500px;display:grid;grid-template-columns:1.1fr .9fr;gap:70px;align-items:center}.pricing-summary{padding:30px;border:1px solid #3475b8;border-radius:17px;background:rgba(6,30,66,.94);box-shadow:0 24px 70px rgba(0,0,0,.28)}.pricing-summary>span{color:#59ddf5;font-weight:800}.pricing-summary>b{display:block;margin:15px 0 7px;color:#fff;font-size:28px}.pricing-summary p{margin:0;color:#aebfd9;line-height:1.7}.pricing-summary i{margin-top:23px;padding-top:17px;display:flex;align-items:center;gap:9px;border-top:1px solid #28517e;color:#d8e8fb;font-style:normal}.plans{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;align-items:stretch}.plans article{position:relative;padding:23px 20px;display:flex;flex-direction:column;border:1px solid var(--public-line);border-radius:15px;background:#fff}.plans article.featured{border:2px solid var(--public-blue);box-shadow:0 22px 50px rgba(37,99,235,.14)}.plans article>p{margin:0;color:var(--public-blue);font-weight:900}.plans h2{margin:12px 0 9px;font-size:21px}.plans strong,.plans small{min-height:38px;color:#a66100;font-size:12px}.plans ul{list-style:none;margin:20px 0;padding:0;display:grid;gap:11px;flex:1;color:var(--public-muted);font-size:13px}.plans li{display:flex;align-items:center;gap:7px}.plans li svg{color:var(--public-success)}.plans .public-button{width:100%;padding:0 10px}.recommended{position:absolute;right:14px;top:12px;padding:4px 7px;border-radius:999px;background:#e9f1ff;color:var(--public-blue);font-size:10px;font-weight:900}.rules-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:70px}.rules-layout ol{list-style:none;margin:0;padding:0}.rules-layout li{padding:19px 0;display:grid;grid-template-columns:55px 1fr;align-items:start;border-top:1px solid #cbd8e9}.rules-layout li:last-child{border-bottom:1px solid #cbd8e9}.rules-layout span{color:var(--public-blue);font-size:21px;font-weight:900}.rules-layout p{margin:0;color:var(--public-muted);line-height:1.7}@media(max-width:1100px){.plans{grid-template-columns:repeat(3,1fr)}}@media(max-width:850px){.pricing-hero-layout,.rules-layout{grid-template-columns:1fr}.pricing-hero-layout{padding:62px 0;gap:35px}.plans{grid-template-columns:1fr 1fr}}@media(max-width:560px){.plans{grid-template-columns:1fr}.pricing-summary>b{font-size:23px}}
</style>
