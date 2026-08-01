<template>
  <main class="info-page">
    <PublicSiteHeader @login="router.push({ path: '/home-public', query: { auth: 'login' } })" />

    <section class="hero">
      <p>{{ page.kicker }}</p>
      <h1>{{ page.title }}</h1>
      <span>{{ page.summary }}</span>
    </section>

    <section class="content-grid">
      <article v-for="item in page.items" :key="item.title">
        <component :is="item.icon" :size="23" />
        <h2>{{ item.title }}</h2>
        <p>{{ item.copy }}</p>
      </article>
    </section>

  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { FileSearch, Globe2, ShieldCheck, Sparkles, UsersRound } from "lucide-vue-next";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";

const route = useRoute();
const router = useRouter();
const pages = {
  "/product-capabilities": {
    kicker: "产品能力",
    title: "让每一份素材都有发布依据",
    summary: "把标题、卖点、图片与详情页纳入同一套发布前检查框架。",
    items: [
      ["素材检查", "定位文案、图片和详情页中的高频发布问题。", FileSearch],
      ["规则匹配", "按平台与市场组织发布要求。", ShieldCheck],
      ["修改方向", "提供适合目标市场的本地化修改方向。", Sparkles],
    ],
  },
  "/solutions": {
    kicker: "解决方案",
    title: "把上架前的判断变成团队流程",
    summary: "适配运营、合规与品牌团队的协作方式。",
    items: [
      ["新品上架", "在首发前完成关键素材的集中检查。", FileSearch],
      ["多平台发布", "针对不同平台选择相应规则与市场语境。", Globe2],
      ["团队复核", "通过记录统一团队协作结论。", UsersRound],
    ],
  },
} as const;

const page = computed(() => {
  const source = pages[route.path as keyof typeof pages] ?? pages["/product-capabilities"];
  return { ...source, items: source.items.map(([title, copy, icon]) => ({ title, copy, icon })) };
});
</script>

<style scoped>
.info-page { min-height: 100vh; background: #fff; color: #081837; font-family: "PingFang SC", "Microsoft YaHei", sans-serif; }
.topbar { height: 76px; padding: 0 clamp(24px, 6vw, 88px); display: flex; align-items: center; border-bottom: 1px solid #e5e7ed; gap: 42px; background: #fff; }
.brand { color: #081837; text-decoration: none; font-size: 21px; font-weight: 800; display: flex; align-items: center; gap: 9px; }
.brand span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 8px; background: #1455db; color: #fff; }
.topbar nav { display: flex; gap: 28px; margin-left: auto; }
.topbar nav a, .topbar > button { border: 0; background: none; color: #33405a; text-decoration: none; cursor: pointer; font-weight: 700; }
.topbar nav a.active, .topbar nav a:hover, .topbar > button:hover { color: #1455db; }
.hero { padding: 92px 24px 70px; text-align: center; max-width: 900px; margin: auto; }
.hero p { margin: 0; color: #1455db; font-weight: 750; }
.hero h1 { font-size: clamp(42px, 5.5vw, 68px); letter-spacing: -.06em; line-height: 1.13; margin: 16px 0; }
.hero span { color: #5c6475; font-size: 17px; }
.content-grid { max-width: 1200px; margin: 0 auto; padding: 0 28px 48px; display: grid; grid-template-columns: repeat(3, 1fr); }
.content-grid article { padding: 30px 34px; border-left: 1px solid #dfe2e8; }
.content-grid article:first-child { border-left: 0; }
.content-grid svg { color: #1455db; }
.content-grid h2 { font-size: 27px; margin: 18px 0 10px; }
.content-grid p { color: #5c6475; line-height: 1.8; min-height: 78px; }
@media (max-width: 760px) { .topbar { padding: 15px 20px; height: auto; } .topbar nav { display: none; } .topbar > button { margin-left: auto; } .hero { padding: 70px 24px 45px; } .content-grid { grid-template-columns: 1fr; padding: 0 24px 35px; } .content-grid article, .content-grid article:first-child { border: 0; border-top: 1px solid #dfe2e8; padding: 28px 0; } .content-grid article:first-child { border-top: 0; } }
</style>
