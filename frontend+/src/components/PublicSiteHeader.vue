<template>
  <header class="public-site-header">
    <div class="public-shell header-shell">
      <RouterLink class="brand" to="/home-public" @click="mobileNavOpen = false"><span><img src="/assets/brand/logo-mark-tech.png" alt="" /></span><b>智选优发</b></RouterLink>
      <button class="mobile-nav-toggle" type="button" :aria-label="mobileNavOpen ? '关闭网站导航' : '打开网站导航'" :aria-expanded="mobileNavOpen" aria-controls="public-site-navigation" @click="mobileNavOpen = !mobileNavOpen">
        <Menu v-if="!mobileNavOpen" :size="22" /><X v-else :size="22" />
      </button>
      <nav id="public-site-navigation" :class="{ open: mobileNavOpen }" aria-label="公共导航">
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" @click="mobileNavOpen = false">{{ item.label }}</RouterLink>
      </nav>
      <div class="header-actions">
        <button class="login" type="button" @click="emit('login')">登录</button>
        <button v-if="showApply" class="apply" type="button" @click="emit('apply')">申请共创</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Menu, X } from 'lucide-vue-next';
withDefaults(defineProps<{ showApply?: boolean }>(), { showApply: true });
const emit = defineEmits<{ login: []; apply: [] }>();
const mobileNavOpen = ref(false);
const navItems = [
  { label: '首页', path: '/home-public' },
  { label: '产品能力', path: '/product-capabilities' },
  { label: '适用平台', path: '/platforms' },
  { label: '解决方案', path: '/solutions' },
  { label: '套餐价格', path: '/pricing' },
  { label: '关于项目', path: '/about-project' },
  { label: '团队介绍', path: '/team' },
];
</script>

<style scoped>
.public-site-header{height:74px;position:relative;z-index:30;border-bottom:1px solid rgba(139,174,229,.18);background:#031027;color:#fff;font-family:"PingFang SC","Microsoft YaHei",sans-serif}.header-shell{height:100%;display:flex;align-items:center;gap:30px}.brand{display:flex;align-items:center;gap:10px;font-size:21px;color:#fff;white-space:nowrap}.brand span{width:42px;height:42px;display:block;filter:drop-shadow(0 0 12px rgba(34,211,238,.24))}.brand span img{width:100%;height:100%;display:block;object-fit:contain}.brand b{font-weight:900}.public-site-header nav{display:flex;gap:20px;margin-left:auto}.public-site-header nav a{position:relative;padding:26px 0 23px;color:#c9d5e7;font-size:14px;font-weight:750}.public-site-header nav a:hover,.public-site-header nav a.router-link-active{color:#fff}.public-site-header nav a.router-link-active::after{content:"";position:absolute;left:0;right:0;bottom:16px;height:2px;border-radius:2px;background:#38d7ff}.header-actions{display:flex;align-items:center;gap:10px}.header-actions button{min-height:40px;border-radius:8px;padding:0 14px;font:inherit;font-weight:800;cursor:pointer}.login{border:0;background:transparent;color:#dce7f7}.apply{border:1px solid #4a86ff;background:#2563eb;color:#fff}.mobile-nav-toggle{display:none;margin-left:auto;width:42px;height:42px;border:1px solid rgba(255,255,255,.22);border-radius:9px;background:#0b2348;color:#fff;place-items:center}@media(max-width:1120px){.mobile-nav-toggle{display:grid;order:3}.header-actions{margin-left:auto}.public-site-header nav{display:none}.public-site-header nav.open{display:grid;position:absolute;left:18px;right:18px;top:66px;padding:10px;gap:2px;border:1px solid #28466f;border-radius:12px;background:#07162e;box-shadow:0 24px 60px rgba(0,0,0,.4)}.public-site-header nav a{padding:12px 14px;border-radius:8px}.public-site-header nav a.router-link-active{background:#0b2b55}.public-site-header nav a.router-link-active::after{display:none}}@media(max-width:520px){.public-site-header{height:66px}.header-shell{gap:8px}.brand{font-size:17px}.brand span{width:36px;height:36px}.header-actions .login{display:none}.header-actions button{padding:0 10px}.public-site-header nav.open{top:58px;left:10px;right:10px}}

@media(max-width:520px){.header-shell{gap:6px}.brand{font-size:16px;gap:7px}.header-actions{gap:2px}.header-actions button{min-height:38px;padding:0 7px;font-size:13px}.header-actions .login{display:inline-flex;align-items:center}.mobile-nav-toggle{width:40px;height:40px;margin-left:2px}}
</style>
