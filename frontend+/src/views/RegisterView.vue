<template>
  <main class="auth-page fade-up">
    <div class="auth-bg"></div>
    <section class="auth-shell">
      <div class="register-card glass">
        <div class="row-between">
          <div class="brand-mini">
            <div class="logo">智</div>
            <strong>智选优发</strong>
          </div>
          <ThemeToggle />
        </div>

        <header>
          <h2>注册账号</h2>
          <p>创建企业账号并开始使用</p>
        </header>

        <form class="form-grid" @submit.prevent="submit">
          <input class="input" v-model="form.companyName" placeholder="企业名称" />
          <input class="input" v-model="form.username" placeholder="用户姓名" />
          <input class="input" v-model="form.email" placeholder="邮箱" />
          <input class="input" type="password" v-model="form.password" placeholder="密码（至少 6 位）" />
          <input class="input" type="password" v-model="confirmPassword" placeholder="确认密码" />
          <p v-if="error" class="err">{{ error }}</p>
          <button class="btn btn-primary submit-btn" :disabled="loading">{{ loading ? "注册中..." : "确认注册" }}</button>
        </form>

        <p class="links">
          <span>已有账号？</span>
          <router-link to="/login">返回登录</router-link>
        </p>
        <p class="safe-note">企业级权限控制 · 全程审计留痕 · 数据分级管理</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { api, getFriendlyError } from "@/lib/api";

const router = useRouter();
const loading = ref(false);
const error = ref("");
const confirmPassword = ref("");
const form = reactive({
  companyName: "",
  username: "",
  email: "",
  password: "",
});

function validateForm() {
  if (!form.companyName.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) {
    error.value = "请完整填写注册信息。";
    return false;
  }
  if (form.password.length < 6) {
    error.value = "密码长度不能少于 6 位。";
    return false;
  }
  if (form.password !== confirmPassword.value) {
    error.value = "两次输入的密码不一致。";
    return false;
  }
  return true;
}

async function submit() {
  error.value = "";
  if (!validateForm()) return;
  loading.value = true;
  try {
    await api.register(form);
    router.push("/login");
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
    radial-gradient(circle at 10% 12%, rgba(14, 165, 233, .18), transparent 28%),
    radial-gradient(circle at 90% 86%, rgba(37, 99, 235, .16), transparent 34%),
    linear-gradient(145deg, #eff6ff, #dbeafe 58%, #c7d2fe);
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
.register-card {
  width: 100%;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--card-strong);
  box-shadow: 0 18px 42px rgba(15, 23, 42, .12);
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
  background: linear-gradient(135deg, #2bb8ff, #2f63f3);
}
.register-card h2 { margin: 0; font-size: clamp(40px, 3vw, 56px); line-height: 1.05; }
.register-card header p { margin: 4px 0 0; color: var(--muted); }
.form-grid { display: grid; gap: 10px; }
.err { margin: 0; color: #ef4444; }
.submit-btn { min-height: 48px; }
.links { margin: 0; display: flex; gap: 6px; color: var(--muted); align-items: center; }
.links a { color: var(--brand-1); font-weight: 700; text-decoration: none; }
.safe-note { margin: 0; color: var(--muted); font-size: 13px; }

html.dark .auth-page .auth-bg {
  background:
    radial-gradient(circle at 10% 12%, rgba(37, 99, 235, .16), transparent 30%),
    radial-gradient(circle at 90% 86%, rgba(30, 58, 138, .18), transparent 34%),
    linear-gradient(145deg, #020817, #071327 56%, #0b1f3f) !important;
}
html.dark .auth-page .register-card {
  background: rgba(15, 32, 58, .88);
  border-color: rgba(120, 143, 180, .35);
  box-shadow: 0 22px 46px rgba(2, 8, 23, .5);
}
html.dark .auth-page .brand-mini strong,
html.dark .auth-page .register-card h2 { color: #e8eefb; }
html.dark .auth-page .register-card header p,
html.dark .auth-page .safe-note,
html.dark .auth-page .links,
html.dark .auth-page .links span { color: #9db0cf; }
html.dark .auth-page .links a { color: #60a5fa; }

@media (max-width: 760px) {
  .auth-shell { width: min(96vw, 560px); }
}
</style>
