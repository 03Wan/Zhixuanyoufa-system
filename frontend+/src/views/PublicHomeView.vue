<template>
  <main class="public-page landing-page">
    <div class="hero-zone">
      <PublicSiteHeader @login="openAuth" @apply="applyOpen = true" />
      <section class="public-dark-hero home-hero">
        <div class="public-shell hero-layout">
          <div class="hero-copy">
            <p class="public-kicker"><Network :size="17" />发布前智能审校网络</p>
            <h1 class="public-title">跨平台发布<wbr />之前，<br />先经过规则网络</h1>
            <p class="public-lead">统一审校平台规则、国家与站点要求、语言本地化与类目限制，提前发现风险，给出可采用的修改方案与发布决策。</p>
            <div class="public-actions">
              <button class="public-button primary" @click="applyOpen = true">申请首批共创 <ArrowRight :size="17" /></button>
              <button class="public-button" @click="scrollTo('sample')">查看审核样例</button>
            </div>
            <div class="hero-proof" aria-label="审校能力摘要">
              <span><CheckCircle2 :size="16" />平台 / 国家 / 类目规则匹配</span>
              <span><FileCheck2 :size="16" />风险原因与规则依据可追溯</span>
            </div>
          </div>

          <div class="network-stage" aria-label="便携电热水壶发布前审校演示">
            <div class="rule-node node-platform"><ShieldCheck :size="20" /><span>平台规则</span></div>
            <div class="rule-node node-market"><Globe2 :size="20" /><span>国家与站点</span></div>
            <div class="rule-node node-language"><Languages :size="20" /><span>语言本地化</span></div>
            <div class="rule-node node-category"><Tags :size="20" /><span>类目限制</span></div>

            <article class="product-scan-card">
              <div class="scan-badge"><ScanLine :size="14" />素材扫描中</div>
              <img src="/assets/kettle-product.png" alt="便携电热水壶商品素材" />
              <div><b>便携电热水壶</b><span>TikTok Shop · 东南亚试点站点</span></div>
              <div class="scan-progress" aria-label="审校进度 82%"><i></i></div>
            </article>

            <aside class="audit-result">
              <div class="result-row danger"><AlertTriangle :size="18" /><div><b>平台规则</b><span>绝对化安全承诺需修改</span></div><strong>风险</strong></div>
              <div class="result-row warning"><Languages :size="18" /><div><b>语言本地化</b><span>描述需适配目标市场表达</span></div><strong>待优化</strong></div>
              <div class="decision"><CheckCircle2 :size="22" /><span>优化后发布</span></div>
            </aside>
          </div>
        </div>
      </section>
    </div>

    <section class="public-section platform-overview">
      <div class="public-shell">
        <div class="public-section-head center">
          <p class="public-kicker">适用平台</p>
          <h2>支持范围透明，能力状态不含糊</h2>
          <p>规则按平台、站点、语言和类目配置；正式支持、试点测试与规划能力分别标注。</p>
        </div>
        <div class="platform-table" role="table" aria-label="平台支持状态">
          <div class="platform-row table-head" role="row"><b>平台</b><b>适用市场</b><b>语言</b><b>当前状态</b></div>
          <div v-for="item in platformRows" :key="item.platform" class="platform-row" role="row">
            <strong>{{ item.platform }}</strong><span>{{ item.market }}</span><span>{{ item.language }}</span><i class="public-status" :class="item.className">{{ item.status }}</i>
          </div>
        </div>
        <RouterLink class="platform-link" to="/platforms">查看完整支持范围 <ArrowRight :size="16" /></RouterLink>
      </div>
    </section>

    <section class="public-section soft workflow-section">
      <div class="public-shell">
        <div class="public-section-head">
          <p class="public-kicker">发布决策管线</p>
          <h2>从商品素材，到可追溯的发布决策</h2>
          <p>点击任一步骤，查看系统在发布前如何组织素材、规则、风险和团队结论。</p>
        </div>
        <div class="workflow-pipeline">
          <button v-for="(item, index) in workflow" :key="item.title" :class="{ active: activeStep === index }" @click="activeStep = index">
            <span>0{{ index + 1 }}</span><component :is="item.icon" :size="24" /><b>{{ item.title }}</b><small>{{ item.short }}</small>
          </button>
        </div>
        <article class="workflow-detail">
          <div class="detail-index">0{{ activeStep + 1 }}</div>
          <div><p class="public-kicker">{{ workflow[activeStep].label }}</p><h3>{{ workflow[activeStep].heading }}</h3><p>{{ workflow[activeStep].copy }}</p></div>
          <CheckCircle2 :size="34" />
        </article>
      </div>
    </section>

    <section id="sample" class="public-section sample-section">
      <div class="public-shell sample-layout">
        <div class="public-section-head">
          <p class="public-kicker">交互审核样例</p>
          <h2>每个结论都回答：哪里有问题、依据什么、改成什么</h2>
          <p>样例仅用于说明工作方式，不代表客户案例或经营效果。</p>
          <div class="sample-tabs" role="tablist" aria-label="审核样例对照">
            <button :class="{ active: sampleMode === 'before' }" @click="sampleMode = 'before'">原表达</button>
            <button :class="{ active: sampleMode === 'after' }" @click="sampleMode = 'after'">推荐修改</button>
          </div>
        </div>
        <article class="review-console">
          <header><span>Listing 标题审校</span><i>规则版本随规则库更新</i></header>
          <div v-if="sampleMode === 'before'" class="copy-panel before-copy">
            <small>原表达</small><p>“<mark>100%安全</mark>，最适合所有家庭使用”</p>
            <div class="rule-evidence"><AlertTriangle :size="18" /><span><b>命中原因</b>绝对化承诺，需按目标市场和类目规则复核。</span></div>
          </div>
          <div v-else class="copy-panel after-copy">
            <small>推荐修改</small><p>“适用于日常热饮准备，使用前请阅读产品说明。”</p>
            <div class="rule-evidence"><CheckCircle2 :size="18" /><span><b>修改说明</b>移除不可验证的绝对化承诺，保留清晰使用场景。</span></div>
          </div>
          <button class="public-button primary full" @click="applyOpen = true">申请一次真实 Listing 审校</button>
        </article>
      </div>
    </section>

    <section class="public-section dark trust-section">
      <div class="public-shell trust-layout">
        <div class="public-section-head">
          <p class="public-kicker">规则可信度</p>
          <h2>规则不是黑箱提示，而是可追溯的发布依据</h2>
          <p>每项审校结果关联平台、市场、类目、规则版本和更新时间；高风险任务可进入人工复核。</p>
        </div>
        <div class="trust-list">
          <span><ShieldCheck :size="22" />平台政策与规则版本</span>
          <span><Globe2 :size="22" />国家、站点与语言要求</span>
          <span><Tags :size="22" />类目限制与风险等级</span>
          <span><UsersRound :size="22" />人工复核与操作记录</span>
        </div>
      </div>
    </section>

    <section class="public-section"><div class="public-shell public-cta"><div><p class="public-kicker">首批共创计划</p><h2>用真实发布任务，共同验证审校流程</h2><p>共创客户参与定期反馈；案例、企业名称和 Logo 仅在单独授权后使用。</p></div><button class="public-button primary" @click="applyOpen = true">申请首批共创 <ArrowRight :size="17" /></button></div></section>
    <PublicFooter />

    <Transition name="fade">
      <div v-if="applyOpen || authOpen" class="modal-mask" @click.self="closeModal">
        <section class="task-modal" role="dialog" aria-modal="true" :aria-label="authOpen ? '企业账号登录' : '申请试点合作'">
          <button class="close" aria-label="关闭" @click="closeModal"><X :size="22" /></button>
          <p class="public-kicker">{{ authOpen ? '企业账号' : '首批共创' }}</p>
          <h2>{{ authOpen ? '登录工作台' : '申请试点合作' }}</h2>
          <template v-if="authOpen">
            <label>邮箱<input v-model="login.email" type="email" placeholder="name@company.com" /></label>
            <label>密码<input v-model="login.password" type="password" placeholder="请输入密码" /></label>
            <label>登录角色<select v-model="login.role"><option value="">请选择角色</option><option v-for="role in loginRoles" :key="role.value" :value="role.value">{{ role.label }}</option></select></label>
            <button class="public-button primary full" :disabled="loading || !login.role" @click="submitLogin">{{ loading ? '登录中…' : '登录' }}</button>
          </template>
          <template v-else>
            <p class="modal-copy">留下企业和目标发布场景，团队会在工作日内联系你。</p>
            <label>企业名称<input v-model="application.companyName" /></label>
            <label>联系人<input v-model="application.contactName" /></label>
            <label>邮箱<input v-model="application.email" type="email" /></label>
            <label>目标平台与国家<input v-model="application.note" placeholder="例如：Shopee 马来西亚" /></label>
            <button class="public-button primary full" :disabled="loading" @click="submitApplication">{{ loading ? '提交中…' : '提交申请' }}</button>
          </template>
          <p v-if="message" class="message" role="status">{{ message }}</p>
        </section>
      </div>
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AlertTriangle, ArrowRight, CheckCircle2, FileCheck2, FilePenLine, Globe2, Languages, Network, ScanLine, ShieldCheck, Tags, UploadCloud, UsersRound, X } from 'lucide-vue-next';
import { api, getFriendlyError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import PublicSiteHeader from '@/components/PublicSiteHeader.vue';
import PublicFooter from '@/components/PublicFooter.vue';
import { usePublicScrollReveal } from '@/composables/usePublicScrollReveal';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const activeStep = ref(0);
const sampleMode = ref<'before' | 'after'>('before');
const applyOpen = ref(false);
const authOpen = ref(false);
const loading = ref(false);
const message = ref('');
usePublicScrollReveal();

const platformRows = [
  { platform: 'TikTok Shop', market: '东南亚试点站点', language: '英语 / 马来语', status: '已验证', className: 'verified' },
  { platform: 'Shopee', market: '东南亚试点站点', language: '英语 / 泰语 / 越南语', status: '测试中', className: 'testing' },
  { platform: 'Lazada', market: '东南亚', language: '英语 / 本地语种', status: '规划中', className: 'planned' },
];

const workflow = [
  { title: '素材导入', short: '标题、图片、详情页', label: '建立审校对象', heading: '让分散素材进入同一个发布任务', copy: '集中导入标题、卖点、图片和详情页内容，记录目标平台、市场与类目。', icon: UploadCloud },
  { title: '规则匹配', short: '平台、市场、类目', label: '锁定适用要求', heading: '只匹配当前发布场景需要的规则', copy: '按平台、国家或站点、语言和商品类目组织规则，避免宽泛提示。', icon: Network },
  { title: '风险解释', short: '原因、等级、依据', label: '解释命中原因', heading: '把风险点与规则依据放在一起', copy: '标记问题位置、风险等级、命中原因与规则来源，支持团队复核。', icon: ShieldCheck },
  { title: '修改采用', short: '修改稿与人工复核', label: '形成可用修改', heading: '从发现问题推进到可采用的修改稿', copy: '提供本地化修改方向，保留采用、退回与人工复核记录。', icon: FilePenLine },
  { title: '结果回填', short: '报告、导出、留痕', label: '沉淀发布决策', heading: '导出结果并保留完整决策链', copy: '生成审核报告与操作记录，为后续发布与结果回流保留依据。', icon: FileCheck2 },
];

const login = reactive({ email: '', password: '', role: '' });
const loginRoles = [
  { value: 'ENTERPRISE_ADMIN', label: '企业管理员' }, { value: 'OPERATOR', label: '运营人员' }, { value: 'DESIGNER', label: '设计人员' },
  { value: 'REVIEWER', label: '复核人员' }, { value: 'MANAGER', label: '管理人员' }, { value: 'SYSTEM_ADMIN', label: '系统管理员' }, { value: 'CUSTOMER_VIEWER', label: '客户查看员' },
];
const application = reactive({ companyName: '', contactName: '', email: '', note: '' });

function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
function openAuth() { router.push({ path: '/home-public', query: { auth: 'login' } }); }
function closeModal() { applyOpen.value = false; authOpen.value = false; message.value = ''; router.replace({ path: '/home-public', query: {} }); }
watch(() => [route.query.auth, route.query.apply], ([auth, apply]) => {
  authOpen.value = auth === 'login';
  applyOpen.value = apply === 'pilot';
}, { immediate: true });

async function submitLogin() {
  if (!login.role) { message.value = '请选择与账号一致的登录角色。'; return; }
  loading.value = true; message.value = '';
  try { await api.login(login); authStore.syncFromStorage(); router.push('/home'); }
  catch (error) { message.value = getFriendlyError(error); }
  finally { loading.value = false; }
}

async function submitApplication() {
  if (!application.companyName || !application.contactName || !application.email) { message.value = '请填写企业名称、联系人和邮箱。'; return; }
  loading.value = true; message.value = '';
  try { const response: any = await api.applyCommercial({ type: 'PILOT_APPLICATION', ...application }); message.value = response?.message || '申请已提交，团队会在工作日内联系你。'; }
  catch (error) { message.value = getFriendlyError(error); }
  finally { loading.value = false; }
}
</script>

<style scoped>
.hero-zone{background:#031027}.home-hero{min-height:650px}.hero-layout{min-height:650px;display:grid;grid-template-columns:.78fr 1.22fr;gap:34px;align-items:center}.hero-copy{padding:64px 0}.hero-copy .public-title{font-size:clamp(48px,4.8vw,72px)}.hero-proof{display:flex;flex-wrap:wrap;gap:12px 22px;margin-top:28px;color:#9fb1cc;font-size:13px}.hero-proof span{display:flex;align-items:center;gap:7px}.hero-proof svg{color:#38d7ff}.network-stage{position:relative;height:560px}.rule-node{position:absolute;z-index:3;padding:9px 12px;display:flex;align-items:center;gap:8px;border:1px solid #367edc;border-radius:10px;background:rgba(5,25,56,.9);color:#dff8ff;font-size:13px;font-weight:800;box-shadow:0 0 25px rgba(34,211,238,.16);animation:nodePulse 3s ease-in-out infinite}.rule-node svg{color:#62e5f7}.node-platform{left:18%;top:12%}.node-market{left:2%;top:49%}.node-language{right:4%;top:18%;animation-delay:.8s}.node-category{right:1%;top:52%;animation-delay:1.4s}.product-scan-card{position:absolute;z-index:4;left:41%;top:20%;width:260px;padding:14px;border:1px solid #2d83ff;border-radius:16px;background:rgba(8,35,78,.94);box-shadow:0 0 48px rgba(37,99,235,.34);animation:floatCard 5s ease-in-out infinite}.product-scan-card img{width:100%;height:148px;object-fit:cover;border-radius:10px}.product-scan-card>div:nth-of-type(2){display:grid;gap:4px;margin-top:12px}.product-scan-card b{font-size:17px}.product-scan-card span{color:#b6c9e5;font-size:12px}.scan-badge{position:absolute;top:24px;left:24px;padding:6px 8px;display:flex;align-items:center;gap:6px;border-radius:7px;background:#0b2348;color:#60e6f6;font-size:11px;font-weight:800}.scan-progress{height:5px;margin-top:13px;border-radius:5px;background:#17365f;overflow:hidden}.scan-progress i{display:block;width:82%;height:100%;background:#38d7ff}.audit-result{position:absolute;z-index:5;right:8%;bottom:5%;width:360px;border:1px solid #3378b9;border-radius:15px;background:rgba(6,28,61,.96);box-shadow:0 22px 58px rgba(0,0,0,.28)}.result-row{padding:14px 16px;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;border-bottom:1px solid #22456e}.result-row div{display:grid;gap:2px}.result-row span{color:#aebfd8;font-size:12px}.result-row strong{font-size:12px}.result-row.danger svg,.result-row.danger strong{color:#ff6c72}.result-row.warning svg,.result-row.warning strong{color:#ffb52e}.decision{padding:15px 16px;display:flex;align-items:center;gap:10px;color:#35ead9;font-size:19px;font-weight:900}.platform-table{border:1px solid var(--public-line);border-radius:16px;overflow:hidden}.platform-row{min-height:66px;padding:0 24px;display:grid;grid-template-columns:1fr 1.4fr 1.2fr .7fr;gap:20px;align-items:center;border-top:1px solid var(--public-line);color:var(--public-muted)}.platform-row:first-child{border-top:0}.platform-row.table-head{min-height:52px;background:#f5f8fd;color:var(--public-ink);font-size:13px}.platform-row strong{color:var(--public-ink)}.platform-row i{width:max-content;font-style:normal}.platform-link{width:max-content;margin:22px auto 0;display:flex;align-items:center;gap:8px;color:var(--public-blue);font-weight:800}.workflow-pipeline{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.workflow-pipeline button{min-height:190px;padding:20px 16px;display:flex;flex-direction:column;align-items:flex-start;gap:12px;border:1px solid #d8e3f2;border-radius:14px;background:#fff;color:var(--public-ink);text-align:left;cursor:pointer;transition:transform .2s ease,border-color .2s ease,background-color .2s ease}.workflow-pipeline button:hover{transform:translateY(-3px)}.workflow-pipeline button.active{border-color:#4b83ee;background:#eef4ff;box-shadow:0 16px 36px rgba(37,99,235,.1)}.workflow-pipeline button>span{color:var(--public-blue);font-size:24px;font-weight:900}.workflow-pipeline svg{color:var(--public-blue)}.workflow-pipeline b{font-size:17px}.workflow-pipeline small{color:var(--public-muted);line-height:1.5}.workflow-detail{margin-top:16px;padding:28px;display:grid;grid-template-columns:auto 1fr auto;gap:25px;align-items:center;border-radius:16px;background:var(--public-navy-900);color:#fff}.detail-index{font-size:64px;font-weight:900;color:#1c4d8b}.workflow-detail .public-kicker{margin-bottom:4px}.workflow-detail h3{margin:0 0 8px;font-size:25px}.workflow-detail p:last-child{margin:0;color:#aebfd8;line-height:1.65}.workflow-detail>svg{color:#38d7ff}.sample-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:70px;align-items:center}.sample-tabs{display:flex;gap:8px;margin-top:24px}.sample-tabs button{min-height:40px;padding:0 14px;border:1px solid #cbd8e9;border-radius:8px;background:#fff;color:var(--public-muted);font:inherit;font-weight:800;cursor:pointer}.sample-tabs button.active{background:var(--public-blue);border-color:var(--public-blue);color:#fff}.review-console{padding:26px;border:1px solid #bcd0ec;border-radius:17px;background:#f8fbff;box-shadow:0 24px 60px rgba(20,55,110,.12)}.review-console header{display:flex;justify-content:space-between;gap:15px;padding-bottom:18px;border-bottom:1px solid #d9e4f2}.review-console header span{font-weight:900}.review-console header i{font-style:normal;color:var(--public-muted);font-size:12px}.copy-panel{min-height:230px;padding:28px 0;display:grid;align-content:start;gap:14px}.copy-panel small{color:var(--public-blue);font-weight:800}.copy-panel>p{margin:0;font-size:24px;line-height:1.55;font-weight:800}.copy-panel mark{padding:1px 4px;border-radius:4px;background:#ffe1e3;color:#c93641}.rule-evidence{padding:14px;display:flex;gap:10px;border-radius:10px;background:#fff;color:var(--public-muted);line-height:1.6}.rule-evidence b{display:block;color:var(--public-ink)}.before-copy .rule-evidence svg{color:var(--public-danger);flex:0 0 auto}.after-copy .rule-evidence svg{color:var(--public-success);flex:0 0 auto}.trust-layout{display:grid;grid-template-columns:1.1fr .9fr;gap:70px;align-items:center}.trust-list{display:grid;gap:10px}.trust-list span{padding:16px;display:flex;align-items:center;gap:12px;border:1px solid #254b80;border-radius:11px;background:#0a2145;color:#d8e7fa;font-weight:800}.trust-list svg{color:#38d7ff}.modal-mask{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:rgba(2,11,27,.78)}.task-modal{position:relative;width:min(470px,100%);max-height:calc(100vh - 40px);overflow:auto;padding:32px;display:grid;gap:13px;border:1px solid #cbd8ea;border-radius:16px;background:#fff;color:var(--public-ink);box-shadow:0 30px 80px rgba(0,0,0,.3)}.task-modal h2{margin:0;font-size:30px}.task-modal .public-kicker{color:var(--public-blue);margin:0}.task-modal label{display:grid;gap:7px;font-size:13px;font-weight:800}.task-modal input,.task-modal select{width:100%;min-height:44px;border:1px solid #cbd8ea;border-radius:8px;padding:0 11px;background:#fff;color:var(--public-ink);font:inherit}.task-modal input:focus,.task-modal select:focus{outline:3px solid #cfe1ff;border-color:#5e91ee}.close{position:absolute;right:15px;top:15px;width:38px;height:38px;display:grid;place-items:center;border:0;border-radius:8px;background:#eef3fa;color:var(--public-ink);cursor:pointer}.modal-copy{margin:0;color:var(--public-muted);line-height:1.65}.message{margin:0;color:#a05e00;font-weight:700}.fade-enter-active,.fade-leave-active{transition:opacity .18s}.fade-enter-from,.fade-leave-to{opacity:0}@keyframes nodePulse{50%{box-shadow:0 0 34px rgba(34,211,238,.45);transform:translateY(-3px)}}@keyframes floatCard{50%{transform:translateY(-8px)}}@media(max-width:1100px){.hero-layout{grid-template-columns:1fr;min-height:auto}.hero-copy{max-width:800px;padding:68px 0 10px}.network-stage{height:530px}.workflow-pipeline{grid-template-columns:repeat(3,1fr)}.sample-layout,.trust-layout{grid-template-columns:1fr}.sample-layout{gap:20px}}@media(max-width:760px){.home-hero{min-height:auto}.hero-copy{padding:54px 0 18px}.network-stage{height:500px}.rule-node{display:none}.product-scan-card{left:4%;top:10%;width:220px}.audit-result{right:2%;bottom:8%;width:min(340px,92%)}.platform-table{overflow:auto}.platform-row{min-width:720px}.workflow-pipeline{grid-template-columns:1fr 1fr}.workflow-detail{grid-template-columns:auto 1fr}.workflow-detail>svg{display:none}.review-console header{display:grid}.trust-layout{gap:25px}}@media(max-width:520px){.network-stage{height:480px}.product-scan-card{width:185px}.product-scan-card img{height:110px}.audit-result{width:94%;right:3%;bottom:4%}.workflow-pipeline{grid-template-columns:1fr}.workflow-pipeline button{min-height:0}.workflow-detail{grid-template-columns:1fr}.detail-index{font-size:40px}.sample-layout{gap:0}.copy-panel>p{font-size:20px}}
@media(min-width:1101px){.home-hero{min-height:610px}.hero-layout{min-height:610px;grid-template-columns:.9fr 1.1fr}.hero-copy{padding:58px 0}.hero-copy .public-title{font-size:clamp(48px,4vw,58px)}}

@media(max-width:520px){
  .hero-copy{padding:38px 0 0}
  .hero-copy .public-title{font-size:clamp(39px,10.8vw,43px);line-height:1.04;letter-spacing:-.06em}
  .hero-copy .public-kicker{margin-bottom:12px;font-size:12px}
  .hero-copy .public-lead{margin-top:17px;font-size:15px;line-height:1.65}
  .hero-copy .public-actions{margin-top:20px;gap:9px}
  .hero-copy .public-button{min-height:44px;padding:0 14px;font-size:13px}
  .hero-proof{margin-top:18px;gap:8px;font-size:12px}
  .network-stage{height:auto;padding:24px 0 32px;display:grid;gap:14px}
  .product-scan-card{position:relative;inset:auto;left:auto;top:auto;width:100%;margin:0;padding:14px;display:grid;grid-template-columns:minmax(118px,42%) 1fr;grid-template-rows:auto auto;gap:8px 14px;align-items:center;translate:none;scale:1;transform:none;animation:none}
  .product-scan-card img{height:112px;grid-row:1 / span 2}
  .product-scan-card>div:nth-of-type(2){grid-column:2;margin-top:0}
  .product-scan-card b{font-size:17px}
  .product-scan-card span{font-size:12px}
  .scan-badge{top:24px;left:24px;padding:6px 8px}
  .scan-progress{grid-column:2;margin-top:0}
  .audit-result{position:relative;inset:auto;left:auto;right:auto;top:auto;bottom:auto;width:100%;translate:none;scale:1;transform:none}
  .result-row{padding:14px 16px;gap:10px}
  .result-row span,.result-row strong{font-size:12px}
  .decision{padding:15px 16px;font-size:19px}
}

@media(max-width:350px){.product-scan-card{grid-template-columns:104px 1fr;gap:7px 11px}.product-scan-card img{height:96px}.product-scan-card b{font-size:15px}.product-scan-card span{font-size:11px}}

/* The homepage remains inside one continuous dark technology environment. */
.landing-page{background-color:#031027;background-image:url('/assets/future-review/global-rule-network.png');background-size:cover;background-position:center;background-attachment:fixed;background-repeat:no-repeat;color:#fff;animation:worldDrift 18s ease-in-out infinite alternate}
.landing-page .public-section{border-top:1px solid rgba(73,124,190,.18);background:rgba(3,16,39,.94);color:#fff}
.landing-page .platform-overview{background:rgba(5,22,47,.94)}
.landing-page .workflow-section{background:rgba(7,27,57,.96)!important}
.landing-page .sample-section{background:rgba(3,16,39,.96)}
.landing-page .public-section-head h2{color:#fff}
.landing-page .public-section-head p:not(.public-kicker){color:#9fb1cc}
.landing-page .platform-table{border-color:#244b76;background:rgba(6,30,66,.78);box-shadow:0 22px 60px rgba(0,0,0,.22)}
.landing-page .platform-row{border-color:#244b76;color:#aebfd8}
.landing-page .platform-row.table-head{background:#0a2349;color:#dcecff}
.landing-page .platform-row strong{color:#fff}
.landing-page .platform-link{color:#59ddf5}
.landing-page .workflow-pipeline button{border-color:#28517e;background:rgba(7,31,67,.88);color:#fff;box-shadow:0 14px 34px rgba(0,0,0,.12)}
.landing-page .workflow-pipeline button:hover{border-color:#38a7e8;box-shadow:0 18px 42px rgba(21,119,208,.2)}
.landing-page .workflow-pipeline button.active{border-color:#38d7ff;background:#0b315f;box-shadow:0 0 32px rgba(34,211,238,.18)}
.landing-page .workflow-pipeline small{color:#9fb1cc}
.landing-page .workflow-detail{border:1px solid #2d619b;background:rgba(5,28,62,.92);box-shadow:0 22px 60px rgba(0,0,0,.2)}
.landing-page .review-console{border-color:#3378b9;background:rgba(6,30,66,.94);color:#fff;box-shadow:0 28px 70px rgba(0,0,0,.3)}
.landing-page .review-console header{border-color:#28517e}
.landing-page .review-console header i{color:#91a8c7}
.landing-page .copy-panel small{color:#59ddf5}
.landing-page .rule-evidence{border:1px solid #244b76;background:#0a2349;color:#aebfd8}
.landing-page .rule-evidence b{color:#fff}
.landing-page .sample-tabs button{border-color:#315f94;background:#071f43;color:#b8cae2}
.landing-page .sample-tabs button.active{border-color:#38d7ff;background:#0c4778;color:#fff}
.landing-page .public-cta{border-color:#3378b9;background:rgba(6,30,66,.94);box-shadow:0 26px 70px rgba(0,0,0,.24)}
.landing-page .public-kicker svg{animation:iconPulse 2.8s ease-in-out infinite}
.landing-page .public-status{box-shadow:0 0 18px rgba(34,211,238,.08)}
@keyframes worldDrift{from{background-position:47% 50%}to{background-position:53% 50%}}
@keyframes iconPulse{50%{filter:drop-shadow(0 0 7px #38d7ff);transform:scale(1.08)}}
</style>
