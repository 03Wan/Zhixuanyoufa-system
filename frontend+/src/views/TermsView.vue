<template>
  <main class="legal-page">
    <AppGlassSurface as="section" class="legal-card" :radius="20">
      <h1>服务条款</h1>
      <p>智选优发面向企业用户提供商品素材发布前检测、风险评估、复核协作和报告归档服务。</p>
      <p>用户应确保提交素材、账号使用和企业成员管理符合所属企业授权及适用法律法规要求。</p>
      <p>检测结果用于辅助决策，不替代企业内部审核、平台规则核验或法律意见。企业应结合实际业务场景完成最终发布判断。</p>
      <p>如需开通、变更或终止服务，请联系平台运营人员。联系邮箱：wangbo030127@gmail.com</p>
    </AppGlassSurface>
  </main>
</template>

<script setup lang="ts">
import AppGlassSurface from '@/components/AppGlassSurface.vue';
</script>

<style scoped>
.legal-page { min-height: 100vh; padding: clamp(16px, 4vw, 48px); display: grid; place-items: start center; background: var(--bg-0); }
.legal-card { width: min(920px, 100%); padding: clamp(20px, 3vw, 36px); display: grid; gap: 14px; }
h1 { margin: 0; font-size: clamp(28px, 3vw, 40px); }
p { margin: 0; color: var(--muted); line-height: 1.75; }
</style>
