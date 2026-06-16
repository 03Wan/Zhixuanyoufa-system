<template>
  <main class="public-home">
    <div class="public-bg"></div>
    <section class="landing">
      <header class="nav glass">
        <div class="brand">
          <div class="logo">智</div>
          <div>
            <h1>智选优发</h1>
            <p>基于 AIGC 的商品素材智能评估与发布决策辅助系统</p>
          </div>
        </div>
        <div class="nav-actions">
          <ThemeToggle />
          <button type="button" class="btn btn-primary icon-btn" @click="openAuth('login')">
            <LogIn :size="18" aria-hidden="true" />
            <span>登录</span>
          </button>
        </div>
      </header>

      <section class="hero glass">
        <p class="eyebrow"><Sparkles class="title-icon" aria-hidden="true" />跨境电商发布前智能评估</p>
        <h2>发布前一站式完成检测、评估与决策</h2>
        <p class="sub">覆盖标题、卖点、详情页、广告语和图片素材，输出风险等级、优化建议与发布决策。</p>
      </section>

      <AppGlassSurface as="section" class="main-panel" :radius="28">
        <section class="panel-section">
          <h3 class="section-title"><ScanSearch class="card-icon" aria-hidden="true" />核心能力</h3>
          <div class="grid-2">
            <article class="plain-item">
              <div class="item-head"><FileSearch :size="16" class="mini-icon" aria-hidden="true" /><h4>素材检测</h4></div>
              <p>文本解析与图片识别结合，定位素材问题。</p>
            </article>
            <article class="plain-item">
              <div class="item-head"><ShieldAlert :size="16" class="mini-icon" aria-hidden="true" /><h4>风险评估</h4></div>
              <p>输出综合分、维度分、风险等级与解释依据。</p>
            </article>
            <article class="plain-item">
              <div class="item-head"><WandSparkles :size="16" class="mini-icon" aria-hidden="true" /><h4>优化建议</h4></div>
              <p>生成结构化改写建议与本土化表达方向。</p>
            </article>
            <article class="plain-item">
              <div class="item-head"><FileCheck2 :size="16" class="mini-icon" aria-hidden="true" /><h4>报告追踪</h4></div>
              <p>支持报告归档导出与操作留痕审计。</p>
            </article>
          </div>
        </section>

        <section class="panel-section">
          <h3 class="section-title"><Archive class="card-icon" aria-hidden="true" />业务流程</h3>
          <div class="steps">
            <div class="step">
              <div class="step-head"><Upload :size="16" class="mini-icon" aria-hidden="true" /><span>01</span></div>
              <strong>上传素材</strong>
              <p>录入标题、卖点、详情与图片素材</p>
            </div>
            <div class="step">
              <div class="step-head"><Bot :size="16" class="mini-icon" aria-hidden="true" /><span>02</span></div>
              <strong>智能检测</strong>
              <p>自动识别风险点并输出结构化评分</p>
            </div>
            <div class="step">
              <div class="step-head"><UserCheck :size="16" class="mini-icon" aria-hidden="true" /><span>03</span></div>
              <strong>复核决策</strong>
              <p>结合建议修订内容并确认发布动作</p>
            </div>
            <div class="step">
              <div class="step-head"><FolderArchive :size="16" class="mini-icon" aria-hidden="true" /><span>04</span></div>
              <strong>报告归档</strong>
              <p>生成报告并在报告中心追踪历史版本</p>
            </div>
          </div>
        </section>

        <section class="panel-section two-col">
          <div>
            <h3 class="section-title"><Store class="card-icon" aria-hidden="true" />平台适配</h3>
            <p class="platform-copy">
              覆盖主流跨境平台与区域市场，支持按平台规则、目标市场和商品品类扩展检测策略。
            </p>
            <div class="chip-wrap">
              <span class="chip"><Globe :size="14" aria-hidden="true" />Amazon / eBay / Walmart</span>
              <span class="chip"><Globe :size="14" aria-hidden="true" />Shopee / Lazada / TikTok Shop</span>
              <span class="chip"><Globe :size="14" aria-hidden="true" />独立站 / 社媒广告 / ERP渠道</span>
              <span class="chip"><Globe :size="14" aria-hidden="true" />欧美 / 中东 / 东南亚等市场</span>
            </div>
          </div>
        </section>

        <section class="panel-section">
          <h3 class="section-title"><MessageCircleQuestion class="card-icon" aria-hidden="true" />常见问题</h3>
          <div class="faq-list faq">
            <details>
              <summary><CircleHelp :size="14" class="mini-icon" aria-hidden="true" />是否支持图片检测与文案检测？</summary>
              <p>支持，文本解析与图片识别可组合评估并输出定位结果。</p>
            </details>
            <details>
              <summary><CircleHelp :size="14" class="mini-icon" aria-hidden="true" />是否支持多角色协作？</summary>
              <p>支持，包含运营、设计、复核和管理角色的权限控制。</p>
            </details>
            <details>
              <summary><CircleHelp :size="14" class="mini-icon" aria-hidden="true" />是否可接入真实模型？</summary>
              <p>可以，当前 MVP 默认 Mock，可平滑切换到真实 API。</p>
            </details>
          </div>
        </section>

        <footer class="panel-footer">
          <p class="footer-main">版权归智选优发团队所有@2026</p>
          <p class="footer-contact">联系我们：wangbo030127@gmail.com</p>
        </footer>
      </AppGlassSurface>
    </section>

    <div v-if="authModalOpen" class="auth-modal-mask" @click.self="closeAuth">
      <AppGlassSurface as="section" class="auth-modal fade-up" :radius="24" role="dialog" aria-modal="true">
        <div class="auth-head">
          <div class="brand-mini"><div class="logo">智</div><strong>智选优发</strong></div>
          <button type="button" class="btn btn-secondary" @click="closeAuth">关闭</button>
        </div>
        <template v-if="authMode === 'login'">
          <h3>登录系统</h3>
          <p class="auth-sub">使用企业账号进入智能检测工作台</p>
          <form class="form-grid" @submit.prevent="submitLogin">
            <input class="input" v-model="loginForm.email" placeholder="邮箱" />
            <input class="input" type="password" v-model="loginForm.password" placeholder="密码" />
            <select class="input" v-model="selectedRole">
              <option v-for="item in roleOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
            <p v-if="authError" class="err">{{ authError }}</p>
            <button class="btn btn-primary submit-btn" :disabled="loading">{{ loading ? '登录中...' : '确认登录' }}</button>
          </form>
          <button class="btn btn-secondary" type="button" :disabled="loading" @click="useDemoAccount">使用演示账号进入</button>
          <p class="switch-line"><span>还没有账号？</span><button class="link-btn" type="button" @click="openRegisterComingSoon">立即注册</button></p>
        </template>
        <template v-else>
          <h3>注册账号</h3>
          <p class="auth-sub">创建企业账号并开始使用</p>
          <form class="form-grid" @submit.prevent="submitRegister">
            <input class="input" v-model="registerForm.companyName" placeholder="企业名称" />
            <input class="input" v-model="registerForm.username" placeholder="用户姓名" />
            <input class="input" v-model="registerForm.email" placeholder="邮箱" />
            <input class="input" type="password" v-model="registerForm.password" placeholder="密码（至少 6 位）" />
            <input class="input" type="password" v-model="confirmPassword" placeholder="确认密码" />
            <p v-if="authError" class="err">{{ authError }}</p>
            <button class="btn btn-primary submit-btn" :disabled="loading">{{ loading ? '注册中...' : '确认注册' }}</button>
          </form>
          <p class="switch-line"><span>已有账号？</span><button class="link-btn" type="button" @click="switchMode('login')">返回登录</button></p>
        </template>
      </AppGlassSurface>
    </div>
    <div v-if="comingSoon.open" class="auth-modal-mask" @click.self="comingSoon.open=false">
      <AppGlassSurface as="section" class="auth-modal fade-up" :radius="24" role="dialog" aria-modal="true">
        <h3 style="font-size:32px;line-height:1.2;">提示</h3>
        <p class="auth-sub">{{ comingSoon.message }}</p>
        <button class="btn btn-primary submit-btn" @click="comingSoon.open=false">我知道了</button>
      </AppGlassSurface>
    </div>
  </main>
</template>

<script setup lang="ts">
import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Archive,
  BarChart3,
  Globe,
  LogIn,
  MessageCircleQuestion,
  ScanSearch,
  Sparkles,
  Store,
  FileSearch,
  ShieldAlert,
  WandSparkles,
  FileCheck2,
  Upload,
  Bot,
  UserCheck,
  FolderArchive,
  CircleHelp,
} from 'lucide-vue-next';
import ThemeToggle from '@/components/ThemeToggle.vue';
import { api, getFriendlyError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { normalizeRole, ROLE_LABELS, type UserRole } from '@/lib/permissions';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const authModalOpen = ref(false);
const authMode = ref<'login' | 'register'>('login');
const loading = ref(false);
const authError = ref('');
const loginForm = reactive({ email: '', password: '' });
const registerForm = reactive({ companyName: '', username: '', email: '', password: '' });
const confirmPassword = ref('');
const comingSoon = reactive({ open: false, message: '' });
const selectedRole = ref<UserRole>('OPERATOR');
const roleOptions = (Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({ value: role, label: ROLE_LABELS[role] }));

watch(
  () => route.query.auth,
  () => {
    const auth = String(route.query.auth || '').toLowerCase();
    authModalOpen.value = auth === 'login' || auth === 'register';
    if (authModalOpen.value) authMode.value = 'login';
  },
  { immediate: true },
);

function openAuth(mode: 'login' | 'register') {
  router.replace({ path: '/home-public', query: { ...route.query, auth: mode } });
}

function closeAuth() {
  const query = { ...route.query } as Record<string, any>;
  delete query.auth;
  router.replace({ path: '/home-public', query });
}

function switchMode(mode: 'login' | 'register') {
  authError.value = '';
  openAuth(mode);
}

function useDemoAccount() {
  loginForm.email = 'sysadmin@example.com';
  loginForm.password = '123456';
}

function openRegisterComingSoon() {
  comingSoon.message = '功能暂未开放，敬请期待~';
  comingSoon.open = true;
}

function validateRegister() {
  if (!registerForm.companyName.trim() || !registerForm.username.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
    authError.value = '请完整填写注册信息。';
    return false;
  }
  if (registerForm.password.length < 6) {
    authError.value = '密码长度不能少于 6 位。';
    return false;
  }
  if (registerForm.password !== confirmPassword.value) {
    authError.value = '两次输入的密码不一致。';
    return false;
  }
  return true;
}

async function submitLogin() {
  loading.value = true;
  authError.value = '';
  try {
    await api.login(loginForm);
    authStore.syncFromStorage();
    const currentRole = normalizeRole(authStore.state.user?.role);
    if (currentRole !== selectedRole.value) {
      authStore.logout();
      authError.value = `无权限：当前账号角色为「${ROLE_LABELS[currentRole]}」，你选择的是「${ROLE_LABELS[selectedRole.value]}」。`;
      return;
    }
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/home';
    router.push(redirect);
  } catch (error) {
    authError.value = getFriendlyError(error);
  } finally {
    loading.value = false;
  }
}

async function submitRegister() {
  if (!validateRegister()) return;
  loading.value = true;
  authError.value = '';
  try {
    await api.register(registerForm);
    switchMode('login');
    loginForm.email = registerForm.email;
    loginForm.password = '';
  } catch (error) {
    authError.value = getFriendlyError(error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.public-home { min-height: 100vh; position: relative; padding: 12px; overflow-x: hidden; }
.public-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0% 10%, rgba(106, 206, 255, 0.22), transparent 36%),
    radial-gradient(circle at 100% 0%, rgba(145, 133, 255, 0.2), transparent 40%),
    linear-gradient(160deg, var(--bg-0), var(--bg-1) 58%, var(--bg-2));
}
.landing { position: relative; z-index: 1; width: 100%; max-width: 1680px; margin: 0 auto; display: grid; gap: 14px; box-sizing: border-box; }
.nav { padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; border-radius: 18px; }
.brand, .nav-actions, .icon-btn, .section-title, .chip { display: inline-flex; align-items: center; gap: 8px; }
.logo { width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; font-weight: 800; font-size: 28px; color: #fff; background: linear-gradient(135deg, var(--brand-0), var(--brand-1)); }
.brand h1 { margin: 0; font-size: 24px; line-height: 1.1; }
.brand p, .sub { color: color-mix(in srgb, var(--text) 76%, #5b77a7 24%); font-size: 15px; }
.hero { border-radius: 18px; padding: 16px; }
.eyebrow { margin: 0 0 8px; color: var(--brand-1); font-weight: 700; display: inline-flex; align-items: center; gap: 8px; }
.title-icon { width: 21px; height: 21px; color: var(--brand-1); }
.hero h2 { margin: 0; font-size: clamp(26px, 2.5vw, 34px); line-height: 1.12; letter-spacing: 0; color: color-mix(in srgb, var(--text) 92%, #0f2b5d 8%); }
.sub { margin: 10px 0 0; max-width: 980px; font-size: 18px; line-height: 1.45; }

.main-panel { border-radius: 18px; padding: 18px; }
.panel-section { padding-top: 18px; margin-top: 18px; border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent); }
.panel-section:first-child { margin-top: 0; padding-top: 0; border-top: none; }
.grid-2, .steps, .chip-wrap, .two-col, .faq-list { display: grid; gap: 12px; }
.grid-2, .steps, .chip-wrap { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.two-col { grid-template-columns: 1fr 1fr; }
.plain-item {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
}
.item-head { display: inline-flex; align-items: center; gap: 8px; }
.plain-item h4 { margin: 0; font-size: 22px; line-height: 1.16; color: color-mix(in srgb, var(--text) 92%, #123774 8%); }
.plain-item p { margin: 0; color: color-mix(in srgb, var(--text) 78%, #5d79a9 22%); font-size: 16px; }
.section-title { margin: 0 0 12px; font-size: clamp(22px, 1.8vw, 30px); line-height: 1.15; color: color-mix(in srgb, var(--text) 92%, #133971 8%); }
.card-icon { width: 19px; height: 19px; color: var(--brand-1); }
.mini-icon { color: var(--brand-1); flex: 0 0 auto; }
.step { border: 1px dashed var(--border); border-radius: 12px; padding: 14px; display: grid; gap: 8px; }
.step-head { display: inline-flex; align-items: center; gap: 8px; }
.step span { color: var(--brand-1); font-weight: 800; font-size: 38px; line-height: 1; }
.step strong { font-size: 22px; line-height: 1.1; letter-spacing: 0; color: color-mix(in srgb, var(--text) 92%, #123c7e 8%); }
.step p { margin: 4px 0 0; color: color-mix(in srgb, var(--text) 76%, #6180ad 24%); font-size: 15px; line-height: 1.42; }
.chip { border: 1px dashed var(--border); border-radius: 999px; padding: 10px 14px; justify-content: center; font-size: 16px; font-weight: 700; }
.platform-copy { margin: 0 0 10px; color: color-mix(in srgb, var(--text) 76%, #5e7ba8 24%); font-size: 16px; line-height: 1.55; }
.faq-list { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
.faq details { border: 1px dashed var(--border); border-radius: 12px; padding: 10px 12px; }
.faq summary { cursor: pointer; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; font-size: 18px; }
.faq details p { margin: 8px 0 0; color: color-mix(in srgb, var(--text) 76%, #5e7ba8 24%); font-size: 15px; }
.panel-footer { padding-top: 18px; margin-top: 18px; border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.footer-main { margin: 0 auto !important; text-align: center; width: 100%; }
.footer-contact { margin: 0 auto !important; text-align: center; width: 100%; font-size: 14px; }
.panel-footer p { margin: 0; color: color-mix(in srgb, var(--text) 60%, #7f98be 40%); }

.auth-modal-mask { position: fixed; inset: 0; z-index: 40; background: rgba(15,23,42,.44); display: grid; place-items: center; padding: 20px; }
.auth-modal { width: min(760px, calc(100vw - 40px)); border-radius: 24px; padding: 20px; display: grid; gap: 12px; }
.auth-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.brand-mini { display: inline-flex; align-items: center; gap: 10px; }
.brand-mini strong { font-size: 32px; line-height: 1; }
.auth-modal h3 { margin: 0; font-size: clamp(28px, 2.8vw, 40px); line-height: 1.1; }
.auth-sub, .switch-line { margin: 0; color: color-mix(in srgb, var(--text) 70%, #5e7da9 30%); font-size: 17px; }
.form-grid { display: grid; gap: 10px; }
.submit-btn { min-height: 48px; }
.switch-line { display: flex; justify-content: space-between; align-items: center; }
.link-btn { color: var(--brand-1); font-weight: 700; background: transparent; border: 0; cursor: pointer; padding: 0; }
.err { margin: 0; color: #d12e2e; font-weight: 700; }

html.dark .title-icon, html.dark .card-icon, html.dark .mini-icon { color: #60a5fa; }
html.dark .auth-modal-mask { background: rgba(2, 8, 23, .6); }

@media (max-width: 1200px) { .two-col { grid-template-columns: 1fr; } }
@media (max-width: 760px) {
  .brand h1 { font-size: 24px; }
  .grid-2, .steps, .chip-wrap, .faq-list { grid-template-columns: 1fr; }
  .section-title { font-size: 34px; }
  .hero h2 { font-size: 36px; }
  .plain-item h4 { font-size: 24px; }
  .plain-item p { font-size: 15px; }
  .step span { font-size: 30px; }
  .step strong { font-size: 34px; }
  .faq summary { font-size: 18px; }
  .faq details p { font-size: 14px; }
  .auth-modal { width: min(560px, calc(100vw - 24px)); padding: 16px; }
  .brand-mini strong { font-size: 24px; }
}
</style>
