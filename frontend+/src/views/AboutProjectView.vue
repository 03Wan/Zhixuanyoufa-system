<template>
  <main class="public-page about-page">
    <PublicSiteHeader @login="openLogin" @apply="openApply" />
    <section class="public-dark-hero about-hero"><div class="public-shell about-hero-layout"><div><p class="public-kicker"><Orbit :size="18" />关于项目</p><h1 class="public-title">让发布前判断，<br />有依据、可协作、可回溯</h1><p class="public-lead">智选优发面向高频上新的跨境电商团队，聚焦发布前审校，不做泛化的内容生成平台。</p></div><div class="mission-console"><div><Target :size="26" /><span>项目聚焦</span><b>发布前审校</b></div><div><GitBranch :size="26" /><span>核心方法</span><b>规则与流程协作</b></div><div><History :size="26" /><span>结果要求</span><b>决策链可追溯</b></div></div></div></section>

    <section class="public-section"><div class="public-shell"><div class="public-section-head"><p class="public-kicker">项目判断</p><h2>不只生成内容，而是连接素材、规则和团队决策</h2></div><div class="public-card-grid"><article class="public-card"><div class="icon-box"><FileQuestion :size="23" /></div><h3>解决什么问题</h3><p>同一件商品进入不同平台、国家和类目时，团队不再只依赖经验、聊天记录和人工反复核对。</p></article><article class="public-card"><div class="icon-box"><Sparkles :size="23" /></div><h3>与普通 AI 工具的区别</h3><p>将素材、规则、风险原因、推荐修改和人工决策放入同一个发布前工作流。</p></article><article class="public-card"><div class="icon-box"><ShieldCheck :size="23" /></div><h3>如何形成可信结论</h3><p>每项结果关联平台、市场、类目和规则版本；高风险任务可进入人工复核。</p></article></div></div></section>

    <section class="public-section soft"><div class="public-shell"><div class="public-section-head"><p class="public-kicker">能力演进</p><h2>先把流程做深，再逐步扩大平台与结果回流</h2><p>时间线区分已上线、测试中和规划中，避免将路线图表达成现有能力。</p></div><div class="roadmap"><article v-for="(stage, index) in stages" :key="stage.title"><span>0{{ index + 1 }}</span><div><i class="public-status" :class="stage.className">{{ stage.status }}</i><h3>{{ stage.title }}</h3><p>{{ stage.copy }}</p></div></article></div></div></section>

    <section class="public-section"><div class="public-shell public-cta"><div><p class="public-kicker">首批共创</p><h2>欢迎用真实发布任务共同验证流程</h2><p>共创客户参与定期反馈；案例、名称和 Logo 仅在单独授权后使用。</p></div><button class="public-button primary" @click="openApply">申请试点 <ArrowRight :size="17" /></button></div></section>
    <PublicFooter />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowRight, FileQuestion, GitBranch, History, Orbit, ShieldCheck, Sparkles, Target } from 'lucide-vue-next';
import PublicSiteHeader from '@/components/PublicSiteHeader.vue';
import PublicFooter from '@/components/PublicFooter.vue';
import { usePublicScrollReveal } from '@/composables/usePublicScrollReveal';
const router = useRouter();
usePublicScrollReveal();
const stages = [
  { status: '已上线', className: 'verified', title: '核心审校流程', copy: '素材导入、规则审校、风险解释、报告与人工复核。' },
  { status: '测试中', className: 'testing', title: '团队批量协作', copy: '批量处理、修改采用与规则版本展示。' },
  { status: '规划中', className: 'planned', title: '结果回流与集成', copy: '发布结果回填、ERP / API 集成和经营归因。' },
];
function openLogin() { router.push({ path: '/home-public', query: { auth: 'login' } }); }
function openApply() { router.push({ path: '/home-public', query: { apply: 'pilot' } }); }
</script>

<style scoped>
.about-hero{min-height:520px}.about-hero-layout{min-height:520px;display:grid;grid-template-columns:1fr .85fr;gap:70px;align-items:center}.mission-console{display:grid;gap:10px}.mission-console>div{padding:17px 19px;display:grid;grid-template-columns:auto 1fr auto;gap:13px;align-items:center;border:1px solid #2d619b;border-radius:12px;background:rgba(6,30,66,.92)}.mission-console svg{color:#38d7ff}.mission-console span{color:#9db1ce}.mission-console b{color:#fff}.roadmap{position:relative;display:grid;gap:12px}.roadmap article{padding:22px;display:grid;grid-template-columns:70px 1fr;gap:20px;border:1px solid var(--public-line);border-radius:14px;background:#fff}.roadmap article>span{color:#d8e5f8;font-size:42px;font-weight:900}.roadmap i{font-style:normal}.roadmap h3{margin:13px 0 7px;font-size:23px}.roadmap p{margin:0;color:var(--public-muted);line-height:1.7}@media(max-width:850px){.about-hero-layout{grid-template-columns:1fr;padding:62px 0;gap:35px}}@media(max-width:500px){.mission-console>div{grid-template-columns:auto 1fr}.mission-console b{grid-column:2}.roadmap article{grid-template-columns:1fr}.roadmap article>span{font-size:32px}}
</style>
