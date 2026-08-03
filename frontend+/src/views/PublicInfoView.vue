<template>
  <main class="public-page info-page">
    <PublicSiteHeader @login="openLogin" @apply="openApply" />
    <section class="public-dark-hero info-hero">
      <div class="public-shell info-hero-layout">
        <div>
          <p class="public-kicker"><component :is="page.heroIcon" :size="18" />{{ page.kicker }}</p>
          <h1 class="public-title"><span v-for="line in page.titleLines" :key="line" class="public-title-line">{{ line }}</span></h1>
          <p class="public-lead">{{ page.summary }}</p>
          <div class="public-actions"><RouterLink class="public-button primary" :to="applyTarget">申请共创 <ArrowRight :size="17" /></RouterLink><RouterLink class="public-button" to="/platforms">查看适用平台</RouterLink></div>
        </div>
        <div class="hero-system" aria-hidden="true">
          <div v-for="(node, index) in page.nodes" :key="node" :class="`system-node node-${index}`"><CheckCircle2 :size="18" />{{ node }}</div>
          <div class="system-core"><component :is="page.heroIcon" :size="42" /><b>{{ page.core }}</b><span>{{ page.coreCopy }}</span></div>
        </div>
      </div>
    </section>

    <section class="public-section">
      <div class="public-shell">
        <div class="public-section-head"><p class="public-kicker">{{ page.sectionKicker }}</p><h2>{{ page.sectionTitle }}</h2><p>{{ page.sectionCopy }}</p></div>
        <div class="public-card-grid">
          <article v-for="item in page.items" :key="item.title" class="public-card"><div class="icon-box"><component :is="item.icon" :size="23" /></div><h3>{{ item.title }}</h3><p>{{ item.copy }}</p></article>
        </div>
      </div>
    </section>

    <section class="public-section soft proof-section">
      <div class="public-shell proof-layout">
        <div class="public-section-head"><p class="public-kicker">{{ page.proofKicker }}</p><h2>{{ page.proofTitle }}</h2><p>{{ page.proofCopy }}</p></div>
        <ol>
          <li v-for="(item, index) in page.proofItems" :key="item"><span>0{{ index + 1 }}</span><b>{{ item }}</b></li>
        </ol>
      </div>
    </section>

    <section class="public-section"><div class="public-shell public-cta"><div><p class="public-kicker">发布前准备</p><h2>把真实发布任务带进同一条审校流程</h2><p>从一个平台、一个市场和一个商品类目开始验证。</p></div><RouterLink class="public-button primary" :to="applyTarget">申请首批共创 <ArrowRight :size="17" /></RouterLink></div></section>
    <PublicFooter />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowRight, CheckCircle2, FileSearch, Globe2, Languages, Network, ShieldCheck, Sparkles, UsersRound, Workflow } from 'lucide-vue-next';
import PublicSiteHeader from '@/components/PublicSiteHeader.vue';
import PublicFooter from '@/components/PublicFooter.vue';
import { usePublicScrollReveal } from '@/composables/usePublicScrollReveal';

const route = useRoute(); const router = useRouter();
usePublicScrollReveal();
const applyTarget = { path: '/home-public', query: { apply: 'pilot' } };
const pages = {
  '/product-capabilities': {
    kicker: '产品能力', titleLines: ['让每一份素材，', '都有发布依据'], summary: '把标题、卖点、图片与详情页纳入同一套发布前审校框架，连接适用规则、风险解释、修改方案和最终决策。',
    heroIcon: Network, core: '发布前审校', coreCopy: '从素材到决策', nodes: ['素材识别', '规则匹配', '风险解释', '修改建议'],
    sectionKicker: '核心能力', sectionTitle: '不是泛化生成，而是围绕发布场景做判断', sectionCopy: '每项能力都服务于一个清晰目标：让团队在上架前知道哪里有风险、为什么、如何修改。',
    items: [
      { title: '素材检查', copy: '定位标题、图片和详情页中的高频发布问题，并保留原始素材版本。', icon: FileSearch },
      { title: '规则匹配', copy: '按照平台、市场、语言与类目组织适用要求，减少宽泛判断。', icon: ShieldCheck },
      { title: '本地化修改', copy: '提供适合目标市场的表达方向，同时保留采用与复核记录。', icon: Languages },
    ],
    proofKicker: '判断链路', proofTitle: '每一个结论都可以向前追溯', proofCopy: '从问题位置回到规则版本，从修改结果回到采用记录。', proofItems: ['定位素材问题', '解释命中原因', '关联适用规则', '形成修改建议', '保留团队决策'],
  },
  '/solutions': {
    kicker: '解决方案', titleLines: ['把上架前判断，', '变成团队工作流'], summary: '让运营、设计、品牌与复核角色围绕同一份素材、同一套规则和同一个发布结论协作。',
    heroIcon: Workflow, core: '团队发布流', coreCopy: '统一任务与依据', nodes: ['运营准备', '设计修改', '品牌确认', '人工复核'],
    sectionKicker: '适用场景', sectionTitle: '从单条 Listing，到多平台协作', sectionCopy: '用统一任务承接不同团队的发布前准备，减少聊天记录、表格与重复确认。',
    items: [
      { title: '新品上架', copy: '在首发前集中完成商品文案、图片和详情页的关键检查。', icon: Sparkles },
      { title: '多平台发布', copy: '针对不同平台、国家和站点匹配相应规则与语言语境。', icon: Globe2 },
      { title: '团队复核', copy: '让运营、设计、品牌和复核人员基于同一份发布依据协作。', icon: UsersRound },
    ],
    proofKicker: '角色协作', proofTitle: '每个角色看到与自己相关的下一步', proofCopy: '减少反复转述，让问题、修改和决策在任务中持续流转。', proofItems: ['运营导入素材', '系统标记风险', '设计采用修改', '复核确认依据', '团队输出结果'],
  },
} as const;
const page = computed(() => pages[route.path as keyof typeof pages] || pages['/product-capabilities']);
function openLogin() { router.push({ path: '/home-public', query: { auth: 'login' } }); }
function openApply() { router.push(applyTarget); }
</script>

<style scoped>
.info-hero{min-height:570px}.info-hero-layout{min-height:570px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}.hero-system{position:relative;height:400px}.system-core{position:absolute;left:50%;top:50%;width:230px;height:230px;transform:translate(-50%,-50%);display:grid;place-items:center;align-content:center;gap:10px;border:1px solid #367edc;border-radius:50%;background:#082a59;color:#58e0f5;box-shadow:0 0 70px rgba(37,99,235,.34)}.system-core b{color:#fff;font-size:21px}.system-core span{color:#a9bdd9;font-size:13px}.system-node{position:absolute;padding:10px 13px;display:flex;align-items:center;gap:8px;border:1px solid #2f6faf;border-radius:10px;background:#071f43;color:#dcecff;font-weight:800;font-size:13px;box-shadow:0 12px 28px rgba(0,0,0,.2);animation:systemFloat 4s ease-in-out infinite}.system-node svg{color:#38d7ff}.node-0{left:2%;top:16%}.node-1{right:4%;top:12%;animation-delay:.6s}.node-2{left:6%;bottom:14%;animation-delay:1.2s}.node-3{right:0;bottom:18%;animation-delay:1.8s}.proof-layout{display:grid;grid-template-columns:.9fr 1.1fr;gap:70px;align-items:center}.proof-layout ol{list-style:none;margin:0;padding:0;border-top:1px solid #cbd8e9}.proof-layout li{padding:18px 4px;display:grid;grid-template-columns:54px 1fr;align-items:center;border-bottom:1px solid #cbd8e9}.proof-layout li span{color:var(--public-blue);font-size:22px;font-weight:900}.proof-layout li b{font-size:17px}@keyframes systemFloat{50%{transform:translateY(-7px)}}@media(max-width:900px){.info-hero-layout,.proof-layout{grid-template-columns:1fr}.info-hero-layout{padding:62px 0 28px}.hero-system{height:360px}}@media(max-width:540px){.hero-system{height:310px}.system-core{width:180px;height:180px}.system-node{font-size:11px;padding:8px}.node-0,.node-2{left:0}.node-1,.node-3{right:0}}
@media(max-width:1100px){.info-hero-layout{grid-template-columns:1fr;padding:62px 0 28px}.hero-system{height:360px}}
</style>
