<template>
  <main class="not-found">
    <section class="card" aria-labelledby="not-found-title">
      <div class="mark" aria-hidden="true"><img src="/assets/brand/logo-mark-tech.png" alt="" /></div>
      <p class="eyebrow">智选优发</p>
      <h1 id="not-found-title">页面不存在</h1>
      <p>该链接可能已失效，或页面已被移动。</p>
      <router-link to="/home-public" class="btn btn-primary">返回首页</router-link>
    </section>
  </main>
</template>

<style scoped>
.not-found { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--bg-page, #f5f7fb); }
.card { width: min(100%, 440px); padding: 40px; text-align: center; border-radius: 20px; background: var(--bg-card, #fff); box-shadow: 0 16px 42px rgba(36, 55, 99, .12); }
.mark { width: 44px; height: 44px; margin: 0 auto 14px; }
.mark img { width: 100%; height: 100%; display: block; }
.eyebrow { margin: 0; color: #64748b; font-size: 14px; }
h1 { margin: 8px 0; color: #172554; }
p { color: #64748b; }
.btn { display: inline-flex; margin-top: 18px; text-decoration: none; }
</style>
