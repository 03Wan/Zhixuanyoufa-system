<template>
  <main class="legal-page">
    <AppGlassSurface as="section" class="legal-card" :radius="20">
      <h1>隐私说明</h1>
      <p>智选优发仅围绕企业账号开通、素材检测、复核协作、报告归档和安全审计处理必要信息。</p>
      <p>平台会保存账号信息、企业信息、提交的素材内容、检测结果、复核记录和操作日志，用于提供服务、排查故障和满足企业管理要求。</p>
      <p>未经授权，平台不会将企业素材和业务数据用于公开展示。需要更正或删除账号相关信息时，请通过联系邮箱提交申请。</p>
      <p>联系邮箱：wangbo030127@gmail.com</p>
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
