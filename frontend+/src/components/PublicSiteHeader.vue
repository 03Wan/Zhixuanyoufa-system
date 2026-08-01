<template>
  <header class="public-site-header">
    <RouterLink class="brand" to="/home-public" @click="mobileNavOpen = false"><span>智</span>智选优发</RouterLink>
    <button
      class="mobile-nav-toggle"
      type="button"
      aria-label="打开网站导航"
      :aria-expanded="mobileNavOpen"
      aria-controls="public-site-navigation"
      @click="mobileNavOpen = !mobileNavOpen"
    >
      <span></span><span></span><span></span>
    </button>
    <nav id="public-site-navigation" :class="{ open: mobileNavOpen }" aria-label="公共导航">
      <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" @click="mobileNavOpen = false">
        {{ item.label }}
      </RouterLink>
    </nav>
    <div class="header-actions">
      <button class="login" type="button" @click="emit('login')">登录</button>
      <button v-if="showApply" class="apply" type="button" @click="emit('apply')">申请试点</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{ showApply?: boolean }>(), { showApply: false });
const emit = defineEmits<{ login: []; apply: [] }>();
const mobileNavOpen = ref(false);
const navItems = [
  { label: '首页', path: '/home-public' },
  { label: '产品能力', path: '/product-capabilities' },
  { label: '适用平台', path: '/platforms' },
  { label: '解决方案', path: '/solutions' },
  { label: '套餐价格', path: '/pricing' },
  { label: '关于项目', path: '/about-project' },
];
</script>

<style scoped>
.public-site-header{height:72px;padding:0 clamp(18px,5vw,74px);display:flex;align-items:center;gap:24px;border-bottom:1px solid #e7ecf5;position:sticky;top:0;z-index:10;background:#fffffff2;backdrop-filter:blur(12px);font-family:"PingFang SC","Microsoft YaHei",sans-serif;color:#0a1d40}
.brand{font-size:20px;font-weight:850;color:#0a1d40;text-decoration:none;display:flex;gap:9px;align-items:center;white-space:nowrap}
.brand span{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;background:#1358df;color:#fff}
nav{display:flex;gap:22px;margin-left:auto}
nav a,.login{border:0;background:none;color:#334155;text-decoration:none;font:inherit;font-size:14px;font-weight:700;cursor:pointer}
nav a.router-link-active{color:#1358df}
.header-actions{display:flex;gap:12px;align-items:center}
.apply{border:1px solid #1358df;border-radius:8px;padding:11px 16px;background:#1358df;color:#fff;font:inherit;font-weight:750;cursor:pointer}
.mobile-nav-toggle{display:none;border:1px solid #d7e1ef;border-radius:9px;background:#fff;color:#0a1d40;width:40px;height:40px;padding:0;place-content:center;gap:4px;cursor:pointer}
.mobile-nav-toggle span{display:block;width:18px;height:2px;border-radius:2px;background:currentColor;transition:transform .18s ease,opacity .18s ease}
@media(max-width:1050px){nav{gap:12px}}
@media(max-width:780px){
  .public-site-header{height:auto;min-height:60px;gap:8px;padding:10px 12px;overflow:visible}
  .brand{font-size:18px}
  .mobile-nav-toggle{display:grid;order:3;flex:0 0 auto}
  .mobile-nav-toggle[aria-expanded="true"] span:nth-child(1){transform:translateY(6px) rotate(45deg)}
  .mobile-nav-toggle[aria-expanded="true"] span:nth-child(2){opacity:0}
  .mobile-nav-toggle[aria-expanded="true"] span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
  .header-actions{order:2;margin-left:auto;gap:7px}
  .apply{padding:9px 11px}
  nav{display:none}
  nav.open{display:grid;position:absolute;top:calc(100% + 1px);left:12px;right:12px;margin:0;padding:8px;gap:2px;border:1px solid #dfe6f1;border-radius:0 0 14px 14px;background:#fff;box-shadow:0 18px 36px rgba(15,35,70,.16)}
  nav.open a{padding:12px 14px;border-radius:8px;font-size:15px}
  nav.open a.router-link-active{color:#1358df;background:#edf4ff}
}
@media(max-width:390px){
  .public-site-header{padding:10px;gap:6px}
  .brand{font-size:16px;gap:6px}
  .brand span{width:30px;height:30px}
  .header-actions{gap:4px}
  .login{font-size:13px;padding:0 4px}
  .apply{padding:8px;font-size:13px}
  .mobile-nav-toggle{width:38px;height:38px}
}
</style>
