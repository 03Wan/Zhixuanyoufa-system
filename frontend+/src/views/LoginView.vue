<template>
  <main class="auth-page fade-up">
    <div class="auth-bg"></div>
    <section class="auth-shell">
      <AppGlassSurface as="div" class="login-card" :radius="24">
        <div class="row-between">
          <div class="brand-mini">
            <div class="logo">智</div>
            <strong>智选优发</strong>
          </div>
          <ThemeToggle />
        </div>

        <header>
          <h3>登录系统</h3>
          <p>使用企业账号进入智能检测工作台</p>
        </header>

        <form class="form-grid" @submit.prevent="submitLogin">
          <input class="input" v-model="loginForm.email" placeholder="邮箱" />
          <input class="input" type="password" v-model="loginForm.password" placeholder="密码" />
          <p v-if="error" class="err">{{ error }}</p>
          <button class="btn btn-primary submit-btn" :disabled="loading">
            {{ loading ? "登录中..." : "确认登录" }}
          </button>
        </form>

        <button class="btn btn-secondary" type="button" :disabled="loading" @click="useDemoAccount">使用演示账号进入</button>

        <div class="links">
          <router-link to="/register">立即注册</router-link>
          <button class="link-btn" @click="openForgot">忘记密码</button>
        </div>

        <div v-if="showForgot" class="forgot-box">
          <input class="input" v-model="forgotForm.email" placeholder="邮箱" />
          <button class="btn btn-secondary" type="button" :disabled="loading" @click="submitForgot">获取重置口令</button>
          <input class="input" v-model="forgotForm.token" placeholder="重置口令" />
          <input class="input" type="password" v-model="forgotForm.newPassword" placeholder="新密码（至少 6 位）" />
          <p v-if="hint" class="hint">{{ hint }}</p>
          <button class="btn btn-primary" :disabled="loading" @click="submitReset">{{ loading ? "提交中..." : "确认重置密码" }}</button>
        </div>

        <p class="safe-note">数据安全 · 操作留痕 · 报告可追溯</p>
      </AppGlassSurface>
    </section>
  </main>
</template>

<script setup lang="ts">
import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { api, getFriendlyError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();
const showForgot = ref(false);
const loading = ref(false);
const error = ref("");
const hint = ref("");
const loginForm = reactive({ email: "", password: "" });
const forgotForm = reactive({ email: "", token: "", newPassword: "" });

function openForgot() {
  showForgot.value = !showForgot.value;
  error.value = "";
}

async function submitLogin() {
  loading.value = true;
  error.value = "";
  try {
    await api.login(loginForm);
    auth.syncFromStorage();
    router.push("/home");
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
}

function useDemoAccount() {
  loginForm.email = "admin@example.com";
  loginForm.password = "123456";
}

async function submitForgot() {
  loading.value = true;
  error.value = "";
  hint.value = "";
  try {
    const res = (await api.forgotPassword({ email: forgotForm.email })) as any;
    hint.value = `${res.message}${res.resetToken ? `，口令：${res.resetToken}` : ""}`;
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
}

async function submitReset() {
  loading.value = true;
  error.value = "";
  try {
    await api.resetPassword({
      email: forgotForm.email,
      token: forgotForm.token,
      newPassword: forgotForm.newPassword,
    });
    showForgot.value = false;
    hint.value = "";
    error.value = "密码重置成功，请重新登录。";
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; padding: clamp(10px, 1.3vw, 16px); position: relative; overflow: hidden; }
.auth-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0% 10%, rgba(106, 206, 255, 0.22), transparent 36%),
    radial-gradient(circle at 100% 0%, rgba(145, 133, 255, 0.2), transparent 40%),
    linear-gradient(160deg, var(--bg-0), var(--bg-1) 58%, var(--bg-2));
}
.auth-shell {
  position: relative;
  z-index: 1;
  width: min(560px, 100%);
  min-height: calc(100vh - 24px);
  margin: 0 auto;
  display: grid;
  align-items: center;
  justify-items: center;
}
.login-card {
  width: 100%;
  border-radius: 24px;
  padding: clamp(18px, 1.5vw, 24px);
  display: grid;
  gap: 12px;
}
.brand-mini { display: inline-flex; align-items: center; gap: 8px; }
.brand-mini strong { font-size: 18px; }
.logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #fff;
  font-weight: 800;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--brand-0), var(--brand-1));
}
.login-card h3 { margin: 0; font-size: clamp(30px, 2.6vw, 40px); line-height: 1.1; }
.login-card header p { margin: 4px 0 0; color: var(--muted); }
.form-grid { display: grid; gap: 10px; }
.err { margin: 0; color: var(--danger); font-size: 13px; }
.hint { margin: 0; color: var(--brand-1); font-size: 13px; }
.submit-btn { min-height: 48px; }
.links { display: flex; justify-content: space-between; align-items: center; }
.links a, .link-btn { color: var(--brand-1); font-weight: 700; border: 0; background: transparent; cursor: pointer; padding: 0; text-decoration: none; }
.forgot-box { border: 1px solid var(--border); border-radius: 12px; background: var(--card-strong); padding: 10px; display: grid; gap: 10px; }
.safe-note { margin: 2px 0 0; color: var(--muted); text-align: center; font-size: 13px; }

@media (max-width: 760px) {
  .auth-shell { width: min(96vw, 560px); }
}
</style>
