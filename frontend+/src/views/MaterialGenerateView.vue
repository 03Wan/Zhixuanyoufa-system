<template>
  <AppShell title="生成跨境素材">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card generator-intro">
        <div>
          <p class="eyebrow">生成路径</p>
          <h2 class="section-title">先生成初稿，再进入发布前审校</h2>
          <p class="muted">按目标平台、国家/站点、语言与商品信息生成可编辑的 Listing 初稿。提交发布前请在下一步核验实际规则与素材。</p>
        </div>
        <ol class="path-steps" aria-label="素材生成路径">
          <li class="active"><b>1</b>填写发布场景</li><li><b>2</b>生成素材初稿</li><li><b>3</b>转入发布前审校</li>
        </ol>
      </AppGlassSurface>

      <div class="generator-grid">
        <AppGlassSurface as="section" class="card form-card">
          <div class="section-heading"><div><p class="eyebrow">商品与市场</p><h3>选择生成场景</h3></div><span class="tag">可编辑初稿</span></div>
          <div class="form-grid">
            <label>商品名称 *<input v-model.trim="form.productName" class="input" placeholder="例如：便携榨汁杯" /></label>
            <label>SKU<input v-model.trim="form.sku" class="input" placeholder="例如：JUICE-001" /></label>
            <label>商品品类 *<select v-model="form.category"><option value="">请选择</option><option v-for="item in categories" :key="item">{{ item }}</option></select></label>
            <label>目标平台 *<select v-model="form.platform"><option value="">请选择</option><option v-for="item in platforms" :key="item">{{ item }}</option></select></label>
            <label>目标国家/站点 *<input v-model.trim="form.market" class="input" placeholder="例如：美国" /></label>
            <label>目标语言 *<select v-model="form.language"><option value="">请选择</option><option>英语</option><option>中文</option><option>马来语</option><option>泰语</option><option>越南语</option><option>德语</option><option>日语</option><option>西班牙语</option><option>阿拉伯语</option></select></label>
          </div>
          <label class="field">核心卖点 *<textarea v-model.trim="form.sellingPoints" rows="4" placeholder="每行一个卖点，例如：可拆卸杯体；USB 充电；适合通勤和旅行" /></label>
          <label class="field">补充信息<input v-model.trim="form.extra" class="input" placeholder="材质、规格、目标人群、价格带或语气要求" /></label>
          <div class="actions-row"><button class="btn btn-primary" :disabled="generating" @click="generate">{{ generating ? '正在生成…' : '生成 Listing 初稿' }}</button><button class="btn btn-secondary" @click="reset">清空</button></div>
          <p v-if="message" class="message">{{ message }}</p>
        </AppGlassSurface>

        <AppGlassSurface as="section" class="card result-card">
          <div class="section-heading"><div><p class="eyebrow">生成结果</p><h3>{{ draft ? '可编辑的素材初稿' : '等待生成' }}</h3></div><span v-if="draft" class="tag success">已生成</span></div>
          <div v-if="draft" class="draft-fields">
            <label>商品标题<textarea v-model="draft.title" rows="2" /></label>
            <label>核心卖点<textarea v-model="draft.sellingPoints" rows="5" /></label>
            <label>详情文案<textarea v-model="draft.detailText" rows="6" /></label>
            <label>广告语<textarea v-model="draft.adText" rows="2" /></label>
            <label>主图/场景图提示词<textarea v-model="draft.imagePrompt" rows="3" /></label>
            <div class="action-panel"><p>初稿生成后仍需经过规则审校与人工复核；图片 OCR、图片生成需在模型服务中配置对应视觉能力后启用。</p><button class="btn btn-primary" @click="sendToReview">带入发布前审校</button></div>
          </div>
          <div v-else class="empty-state">填写左侧场景与商品信息后，即可生成标题、卖点、详情、广告语和图片提示词。</div>
        </AppGlassSurface>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppGlassSurface from '@/components/AppGlassSurface.vue';
import AppShell from '@/layouts/AppShell.vue';

const router = useRouter();
const generating = ref(false);
const message = ref('');
const draft = ref<any>(null);
const platforms = ['Amazon', 'TikTok Shop', 'Shopee', 'Lazada', 'AliExpress', 'eBay', 'Walmart', 'Etsy', 'Temu', '独立站'];
const categories = ['衣服', '鞋靴', '箱包配饰', '3C数码', '家居家纺', '美妆个护', '母婴玩具', '运动户外', '食品保健', '宠物用品', '其他'];
const form = reactive({ productName: '', sku: '', category: '', platform: '', market: '', language: '', sellingPoints: '', extra: '' });

function generateCopy() {
  const points = form.sellingPoints.split(/\n|；|;/).map((item) => item.trim()).filter(Boolean);
  const feature = points[0] || '满足日常使用需求';
  const languagePrefix = form.language === '英语' ? 'English listing draft' : `${form.language}素材初稿`;
  return {
    title: `${form.productName}｜${feature}｜适用于${form.market}${form.platform ? ` ${form.platform}` : ''}`,
    sellingPoints: points.length ? points.map((item, index) => `${index + 1}. ${item}，适合${form.market}市场的${form.category}消费者。`).join('\n') : `1. ${feature}\n2. 结合实际规格补充使用场景\n3. 上架前请核对平台限制与本地化表达`,
    detailText: `${languagePrefix}\n\n${form.productName} 面向 ${form.market} 的 ${form.category} 使用场景打造。${feature}。${form.extra ? `补充信息：${form.extra}。` : ''}\n\n请在发布前补齐材质、尺寸、包装清单、保修和真实适用范围；所有效果或性能表述应有可核验依据。`,
    adText: `${form.productName}，${feature}。为 ${form.market} 的日常使用场景提供更清晰的选择。`,
    imagePrompt: `${form.productName}，${form.category}，清晰展示核心卖点“${feature}”，适配 ${form.platform} ${form.market} 站点，干净背景、真实材质、避免夸大效果和平台受限文字。`,
  };
}

async function generate() {
  message.value = '';
  if (!form.productName || !form.category || !form.platform || !form.market || !form.language || !form.sellingPoints) {
    message.value = '请先填写商品名称、品类、平台、国家/站点、语言和核心卖点。';
    return;
  }
  generating.value = true;
  await new Promise((resolve) => setTimeout(resolve, 420));
  draft.value = generateCopy();
  generating.value = false;
  message.value = '已生成可编辑初稿。确认后可直接带入发布前审校。';
}

function reset() {
  Object.assign(form, { productName: '', sku: '', category: '', platform: '', market: '', language: '', sellingPoints: '', extra: '' });
  draft.value = null;
  message.value = '';
}

function sendToReview() {
  if (!draft.value) return;
  sessionStorage.setItem('zyyf_generated_material', JSON.stringify({
    sku: form.sku,
    productName: form.productName,
    category: form.category,
    platform: form.platform,
    market: form.market,
    language: form.language,
    purpose: '上架前审核',
    title: draft.value.title,
    sellingPoints: draft.value.sellingPoints,
    detailText: draft.value.detailText,
    adText: draft.value.adText,
    videoScript: '',
    mainImageUrlsText: '',
    sceneImageUrlsText: '',
  }));
  router.push('/tasks/new');
}
</script>

<style scoped>
.generator-intro { display: grid; gap: 16px; }.muted { margin: 6px 0 0; color: var(--muted); line-height: 1.7; }.eyebrow { margin: 0; color: var(--brand-1); font-size: 12px; font-weight: 800; letter-spacing: .08em; }.path-steps { display: flex; gap: 10px; list-style: none; padding: 0; margin: 0; flex-wrap: wrap; }.path-steps li { display: flex; align-items: center; gap: 7px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 10px; color: var(--muted); font-size: 13px; }.path-steps .active { color: var(--brand-1); border-color: color-mix(in srgb, var(--brand-1) 50%, var(--border)); }.path-steps b { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--brand-1) 12%, transparent); }.generator-grid { display: grid; grid-template-columns: minmax(330px, .92fr) minmax(0, 1.25fr); gap: 14px; }.form-card,.result-card { display: grid; align-content: start; gap: 14px; }.section-heading { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }.section-heading h3 { margin: 4px 0 0; }.tag { padding: 4px 8px; border-radius: 999px; font-size: 12px; color: var(--brand-1); background: color-mix(in srgb, var(--brand-1) 10%, transparent); white-space: nowrap; }.tag.success { color: #047857; background: rgba(16,185,129,.12); }.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }.form-grid label,.field,.draft-fields label { display:grid; gap:6px; font-weight:700; }.actions-row { display: flex; gap: 10px; flex-wrap: wrap; }.message { margin: 0; color: var(--brand-1); font-size: 13px; }.draft-fields { display: grid; gap: 12px; }.action-panel { display:flex; gap:12px; align-items:center; justify-content:space-between; padding-top:12px; border-top:1px solid var(--border); }.action-panel p { margin:0; color:var(--muted); font-size:13px; line-height:1.6; }.empty-state { min-height: 300px; display:grid; place-items:center; padding:24px; border:1px dashed var(--border); border-radius:12px; color:var(--muted); text-align:center; line-height:1.7; }@media(max-width:900px){.generator-grid{grid-template-columns:1fr}.action-panel{display:grid}.form-grid{grid-template-columns:1fr}}@media(max-width:520px){.actions-row{display:grid}.actions-row .btn,.action-panel .btn{width:100%}.path-steps{display:grid}}
</style>
