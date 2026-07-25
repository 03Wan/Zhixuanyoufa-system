<template>
  <main class="public-page">
    <header>
      <RouterLink to="/home-public" class="brand"><span>智</span>智选优发</RouterLink>
      <nav><RouterLink to="/home-public">首页</RouterLink><RouterLink to="/product-capabilities">产品能力</RouterLink><RouterLink to="/platforms">适用平台</RouterLink><RouterLink to="/solutions">解决方案</RouterLink><RouterLink to="/about-project">关于智选优发</RouterLink></nav>
      <button type="button" @click="login">登录</button>
    </header>
    <section class="hero"><p>关于智选优发项目</p><h1>为跨境商品发布建立一套发布前判断流程</h1><span>智选优发是面向跨境电商出海场景的商品素材智能评估与发布决策辅助项目。</span></section>
    <section class="intro"><article><h2>项目在解决什么</h2><p>围绕标题、图片、详情页、广告文案和短视频脚本等素材，在正式发布前识别风险、整理优化方向，并保留可追溯的判断记录。</p></article><article><h2>项目如何工作</h2><p>以“素材上传、智能识别、质量评估、风险预警、优化生成、发布决策、报告归档、反馈迭代”为工作闭环，让团队经验成为可复用流程。</p></article><article><h2>项目面向谁</h2><p>面向跨境卖家、品牌出海团队、代运营机构、外贸服务机构及内容运营团队的日常发布前准备工作。</p></article></section>
    <section class="values"><p>项目目标</p><h2>更高效、更稳定、更可追溯地完成发布准备</h2><div><span>降低发布风险</span><span>提升内容质量</span><span>统一团队标准</span><span>沉淀过程记录</span></div></section>
  </main>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
const login = () => router.push({ path: "/home-public", query: { auth: "login" } });
</script>
<style scoped>
.public-page{min-height:100vh;background:#fff;color:#0a1d40;font-family:"PingFang SC","Microsoft YaHei",sans-serif}header{height:76px;padding:0 clamp(24px,7vw,110px);display:flex;align-items:center;gap:34px;border-bottom:1px solid #e2e9f4}.brand{font-weight:800;font-size:21px;color:#0a1d40;text-decoration:none;display:flex;align-items:center;gap:9px}.brand span{display:grid;place-items:center;width:34px;height:34px;border-radius:8px;background:#1455db;color:#fff}nav{margin-left:auto;display:flex;gap:28px}nav a,header button{border:0;background:none;color:#33415d;font:inherit;font-weight:700;text-decoration:none;cursor:pointer}nav a.router-link-active,nav a:hover,header button:hover{color:#1358df}.hero{max-width:1100px;margin:auto;padding:108px 28px 70px;text-align:center}.hero p,.values>p{margin:0;color:#1358df;font-weight:800}.hero h1{margin:16px 0;font-size:clamp(44px,4.7vw,62px);letter-spacing:-.065em;line-height:1.1}.hero span{font-size:18px;color:#5a6b85}.intro{max-width:1120px;margin:auto;padding:0 28px 78px;display:grid;grid-template-columns:repeat(3,1fr);gap:46px}.intro article{padding-top:22px;border-top:2px solid #d7e7ff}.intro h2{margin:0 0 12px;font-size:24px}.intro p{margin:0;color:#5a6b85;line-height:1.85}.values{max-width:1120px;margin:0 auto 90px;padding:46px;border-radius:24px;background:linear-gradient(130deg,#edf6ff,#f8fbff);text-align:center}.values h2{max-width:740px;margin:14px auto 30px;font-size:clamp(30px,3vw,44px);letter-spacing:-.05em}.values div{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.values span{padding:13px;border:1px solid #d5e4f6;border-radius:10px;background:#fff;color:#1358df;font-weight:700}@media(max-width:760px){header{padding:0 20px}nav{display:none}header button{margin-left:auto}.hero{padding:72px 22px 45px}.intro{grid-template-columns:1fr;gap:24px;padding:0 22px 54px}.values{margin:0 22px 54px;padding:30px 20px}.values div{grid-template-columns:1fr 1fr}}
</style>
