<template>
  <footer class="public-footer">
    <div class="public-shell footer-shell">
      <RouterLink class="footer-brand" to="/home-public"><span>智</span><b>智选优发</b></RouterLink>
      <p>让跨境商品的发布前判断有依据、可协作、可回溯。</p>
      <nav aria-label="页脚导航">
        <RouterLink to="/about-project">关于项目</RouterLink>
        <RouterLink to="/privacy">隐私说明</RouterLink>
        <RouterLink to="/terms">服务条款</RouterLink>
      </nav>
      <small><span>© 2026 智选优发</span><a href="https://github.com/03Wan/Zhixuanyoufa-system/blob/main/LICENSE" target="_blank" rel="noreferrer">GNU AGPL v3.0 开源</a></small>
    </div>
  </footer>
</template>

<style scoped>
.public-footer{padding:48px 0 28px;background:#020b1b;color:#aebdd4;font-family:"PingFang SC","Microsoft YaHei",sans-serif}.footer-shell{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}.footer-brand{display:flex;align-items:center;gap:10px;color:#fff;font-size:20px}.footer-brand span{width:34px;height:34px;display:grid;place-items:center;border-radius:8px;background:#2563eb;color:#fff;font-weight:900}.public-footer p{margin:0;line-height:1.7}.public-footer nav{display:flex;gap:22px;grid-column:2;grid-row:1 / span 2}.public-footer a:hover{color:#59ddf5}.public-footer small{padding-top:18px;border-top:1px solid #15243c;grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;gap:14px}.public-footer small a{color:#79dff2;font-weight:700}.public-footer small a:focus-visible{outline:2px solid #59ddf5;outline-offset:4px}@media(max-width:700px){.footer-shell{grid-template-columns:1fr}.public-footer nav{grid-column:auto;grid-row:auto;flex-wrap:wrap}.public-footer small{grid-column:auto;align-items:flex-start;flex-direction:column;gap:8px}}
</style>
