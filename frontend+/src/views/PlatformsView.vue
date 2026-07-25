<template>
  <main class="public-page">
    <header>
      <RouterLink to="/home-public" class="brand"><span>智</span>智选优发</RouterLink>
      <nav>
        <RouterLink to="/home-public">首页</RouterLink>
        <RouterLink to="/product-capabilities">产品能力</RouterLink>
        <RouterLink to="/platforms">适用平台</RouterLink>
        <RouterLink to="/solutions">解决方案</RouterLink>
        <RouterLink to="/about-project">关于智选优发</RouterLink>
      </nav>
      <button type="button" @click="login">登录</button>
    </header>
    <section class="hero"><p>适用平台</p><h1>围绕真实发布场景选择检查规则</h1><span>根据目标平台、市场和商品素材，组织发布前检查任务。</span></section>
    <section class="cards"><article v-for="item in platforms" :key="item.title"><component :is="item.icon" :size="24" /><h2>{{ item.title }}</h2><p>{{ item.copy }}</p><ul><li v-for="tag in item.tags" :key="tag">{{ tag }}</li></ul></article></section>
    <section class="note"><b>使用方式</b><span>先选择目标平台与市场，再导入商品标题、图片、详情页或广告素材；系统将根据配置的规则给出风险与优化方向。</span></section>
  </main>
</template>
<script setup lang="ts">
import { Globe2, ShoppingBag, Store } from "lucide-vue-next";
import { useRouter } from "vue-router";
const router = useRouter();
const login = () => router.push({ path: "/home-public", query: { auth: "login" } });
const platforms = [
  { title: "综合电商平台", copy: "适合商品上架前的标题、主图、详情页与营销素材检查。", tags: ["Amazon", "Shopee", "Lazada"], icon: Store },
  { title: "内容与社交渠道", copy: "适合短视频脚本、直播话术、图文内容和广告表达的发布前准备。", tags: ["TikTok Shop", "社交媒体素材", "广告投放"], icon: ShoppingBag },
  { title: "多市场发布", copy: "结合目标市场的语言表达、文化语境与本地化要求进行评估。", tags: ["北美", "欧洲", "东南亚"], icon: Globe2 },
];
</script>
<style scoped>
.public-page{min-height:100vh;background:#fbfdff;color:#0a1d40;font-family:"PingFang SC","Microsoft YaHei",sans-serif}header{height:76px;padding:0 clamp(24px,7vw,110px);display:flex;align-items:center;gap:34px;border-bottom:1px solid #e2e9f4;background:#fff}.brand{font-weight:800;font-size:21px;color:#0a1d40;text-decoration:none;display:flex;align-items:center;gap:9px}.brand span{display:grid;place-items:center;width:34px;height:34px;border-radius:8px;background:#1455db;color:#fff}nav{margin-left:auto;display:flex;gap:28px}nav a,header button{border:0;background:none;color:#33415d;font:inherit;font-weight:700;text-decoration:none;cursor:pointer}nav a.router-link-active,nav a:hover,header button:hover{color:#1358df}.hero{max-width:1060px;margin:auto;padding:104px 28px 62px;text-align:center}.hero p{margin:0;color:#1358df;font-weight:800}.hero h1{margin:16px 0;font-size:clamp(44px,5vw,70px);letter-spacing:-.065em;line-height:1.1}.hero span{font-size:18px;color:#5a6b85}.cards{max-width:1160px;margin:auto;padding:0 28px 62px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.cards article{padding:30px;border:1px solid #dce6f3;border-radius:18px;background:#fff;box-shadow:0 14px 34px rgba(31,67,130,.07)}.cards svg{color:#1358df}.cards h2{margin:17px 0 8px;font-size:24px}.cards p{min-height:58px;margin:0;color:#5a6b85;line-height:1.75}.cards ul{display:flex;gap:8px;flex-wrap:wrap;padding:0;margin:20px 0 0;list-style:none}.cards li{padding:5px 9px;border-radius:999px;background:#f1f6ff;color:#1358df;font-size:13px}.note{max-width:1104px;margin:0 auto 88px;padding:21px 24px;border-radius:14px;background:#edf5ff;display:grid;gap:6px}.note span{color:#526681}@media(max-width:760px){header{padding:0 20px}nav{display:none}header button{margin-left:auto}.hero{padding:72px 22px 44px}.cards{grid-template-columns:1fr;padding:0 22px 42px}.note{margin:0 22px 54px}}
</style>
