<template>
  <main class="public-page platforms-page">
    <PublicSiteHeader @login="openLogin" @apply="openApply" />
    <section class="public-dark-hero platforms-hero">
      <div class="public-shell platforms-hero-layout">
        <div><p class="public-kicker"><Globe2 :size="18" />适用平台</p><h1 class="public-title"><span class="public-title-line">规则网络有边界，</span><span class="public-title-line">支持状态要透明</span></h1><p class="public-lead">每条规则按平台、国家或站点、语言和类目配置，并保留版本与更新时间。规划能力不会被包装成正式支持。</p></div>
        <div class="coverage-console">
          <header><span>规则覆盖状态</span><i>随规则库版本更新</i></header>
          <div v-for="row in rows" :key="row.platform" class="coverage-row"><div><b>{{ row.platform }}</b><span>{{ row.market }}</span></div><i class="public-status" :class="row.className">{{ row.status }}</i></div>
        </div>
      </div>
    </section>

    <section class="public-section">
      <div class="public-shell">
        <div class="public-section-head center"><p class="public-kicker">支持矩阵</p><h2>按真实开放范围选择发布场景</h2><p>表格用于说明当前规则库覆盖状态，不代表平台官方合作或经营效果。</p></div>
        <div class="matrix-wrap"><div class="matrix" role="table" aria-label="平台支持范围">
          <div class="matrix-row head" role="row"><b>平台</b><b>国家 / 站点</b><b>语言</b><b>适用类目</b><b>状态</b><b>规则更新时间</b></div>
          <div v-for="item in rows" :key="item.platform" class="matrix-row" role="row"><strong>{{ item.platform }}</strong><span>{{ item.market }}</span><span>{{ item.language }}</span><span>{{ item.category }}</span><i class="public-status" :class="item.className">{{ item.status }}</i><time>{{ item.updated }}</time></div>
        </div></div>
      </div>
    </section>

    <section class="public-section soft"><div class="public-shell status-guide"><div class="public-section-head"><p class="public-kicker">状态说明</p><h2>同一种视觉语言，不混淆不同能力阶段</h2></div><div class="public-card-grid"><article class="public-card"><span class="public-status verified">已验证</span><h3>可用于正式审校</h3><p>已在规则库中配置，并进入当前正式支持范围。</p></article><article class="public-card"><span class="public-status testing">验证中</span><h3>适合共创验证</h3><p>用于限定场景的共创验证，不作为全面支持承诺。</p></article><article class="public-card"><span class="public-status planned">规划中</span><h3>尚未正式开放</h3><p>不会在任务创建页作为可用发布范围展示。</p></article></div></div></section>
    <section class="public-section"><div class="public-shell public-cta"><div><p class="public-kicker">从一个场景开始</p><h2>确认平台、市场与类目，再验证审校流程</h2><p>团队会根据目标发布范围确认当前可用能力。</p></div><button class="public-button primary" @click="openApply">申请共创 <ArrowRight :size="17" /></button></div></section>
    <PublicFooter />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowRight, Globe2 } from 'lucide-vue-next';
import PublicSiteHeader from '@/components/PublicSiteHeader.vue';
import PublicFooter from '@/components/PublicFooter.vue';
import { usePublicScrollReveal } from '@/composables/usePublicScrollReveal';
const router = useRouter();
usePublicScrollReveal();
const rows = [
  { platform: 'TikTok Shop', market: '东南亚共创站点', language: '英语 / 马来语', category: '家居、3C、个护', status: '已验证', className: 'verified', updated: '随规则库版本更新' },
  { platform: 'Shopee', market: '东南亚共创站点', language: '英语 / 泰语 / 越南语', category: '家居、3C、生活用品', status: '验证中', className: 'testing', updated: '随规则库版本更新' },
  { platform: 'Lazada', market: '东南亚', language: '英语 / 本地语种', category: '待按类目扩展', status: '规划中', className: 'planned', updated: '尚未开放' },
  { platform: '中东站点', market: '沙特 / 阿联酋', language: '阿拉伯语 / 英语', category: '待按国家扩展', status: '规划中', className: 'planned', updated: '尚未开放' },
];
function openLogin() { router.push({ path: '/home-public', query: { auth: 'login' } }); }
function openApply() { router.push({ path: '/home-public', query: { apply: 'pilot' } }); }
</script>

<style scoped>
.platforms-hero{min-height:530px}.platforms-hero-layout{min-height:530px;display:grid;grid-template-columns:1fr .9fr;gap:70px;align-items:center}.coverage-console{border:1px solid #3674b4;border-radius:16px;background:rgba(5,27,60,.94);box-shadow:0 25px 70px rgba(0,0,0,.3)}.coverage-console header,.coverage-row{padding:17px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid #244b76}.coverage-console header{color:#fff;font-weight:900}.coverage-console header i{font-style:normal;color:#94a8c6;font-size:12px}.coverage-row:last-child{border-bottom:0}.coverage-row>div{display:grid;gap:4px}.coverage-row b{color:#fff}.coverage-row span{color:#9fb1cd;font-size:12px}.coverage-row i{font-style:normal}.matrix-wrap{overflow:auto;border:1px solid var(--public-line);border-radius:16px}.matrix{min-width:960px}.matrix-row{min-height:70px;padding:0 20px;display:grid;grid-template-columns:1fr 1.2fr 1.05fr 1.15fr .8fr 1.2fr;gap:15px;align-items:center;border-top:1px solid var(--public-line);color:var(--public-muted);font-size:14px}.matrix-row:first-child{border-top:0}.matrix-row.head{min-height:54px;background:#f3f7fc;color:var(--public-ink);font-size:13px}.matrix-row strong{color:var(--public-ink)}.matrix-row i{width:max-content;font-style:normal}.status-guide .public-card h3{margin-top:18px}@media(max-width:900px){.platforms-hero-layout{grid-template-columns:1fr;padding:62px 0;gap:36px}}@media(max-width:560px){.coverage-console header{display:grid}.coverage-row{align-items:flex-start}}
@media(max-width:1100px){.platforms-hero-layout{grid-template-columns:1fr;padding:62px 0;gap:36px}}
</style>
