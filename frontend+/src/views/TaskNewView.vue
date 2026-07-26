<template>
  <AppShell title="任务中心">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card task-intro">
        <div class="intro-topline"><p class="eyebrow">发布前审校</p><p class="quota-chip">{{ quotaInfo.planName || '-' }} · 剩余 {{ quotaInfo.quotaRemaining ?? 0 }} 条</p></div>
        <h2 class="section-title">创建发布任务</h2>
        <p class="intro-copy">先选定发布平台和站点，再导入 Listing 素材；系统会按对应场景输出可执行的发布决策。</p>
        <ol class="workflow-steps" aria-label="创建流程"><li class="active"><b>1</b><span>发布场景</span></li><li><b>2</b><span>素材导入</span></li><li><b>3</b><span>审校与决策</span></li></ol>
        <p v-if="quotaLoadError" class="quota-error">{{ quotaLoadError }}</p>
        <div class="scenario-grid">
          <div class="field sku-field"><label>SKU *</label><input class="input" v-model.trim="form.sku" placeholder="例如：SKU-2026-001" /></div>
          <div class="field product-field"><label>商品名称 *</label><input class="input" v-model.trim="form.productName" placeholder="填写商品名称" /></div>
          <div>
            <label>商品品类 *</label>
            <select v-model="form.category">
              <option value="">请选择</option>
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div>
            <label>目标平台 *</label>
            <select v-model="form.platform"><option value="">请选择</option><option v-for="p in platforms" :key="p" :value="p">{{ p }}</option></select>
          </div>
          <div>
            <label>目标国家/站点 *</label>
            <select v-model="form.market" :disabled="!form.platform"><option value="">{{ form.platform ? '请选择' : '请先选择平台' }}</option><option v-for="m in availableMarkets" :key="m" :value="m">{{ m }}</option></select>
          </div>
          <div><label>目标语言 *</label><select v-model="form.language" :disabled="!form.platform"><option value="">{{ form.platform ? '请选择' : '请先选择平台' }}</option><option v-for="l in availableLanguages" :key="l" :value="l">{{ l }}</option></select></div>
          <div>
            <label>发布目的 *</label>
            <select v-model="form.purpose"><option value="">请选择</option><option v-for="p in purposes" :key="p" :value="p">{{ p }}</option></select>
          </div>
        </div>
        <p v-if="form.platform" class="scenario-hint"><b>{{ form.platform }}</b> · {{ platformGuidance }}</p>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card materials-card">
        <div class="section-heading"><div><p class="eyebrow">Listing 素材</p><h3>导入待审校内容</h3></div><p>必填项优先录入；图片可稍后补充。</p></div>
        <div class="field"><label>标题 *</label><textarea rows="2" v-model.trim="form.title" /></div>
        <div class="field"><label>卖点 *</label><textarea rows="4" v-model.trim="form.sellingPoints" /></div>
        <div class="field"><label>详情文案 *</label><textarea rows="4" v-model.trim="form.detailText" /></div>
        <div class="field"><label>广告语</label><textarea rows="3" v-model.trim="form.adText" /></div>
        <div class="field"><label>视频脚本</label><textarea rows="4" v-model.trim="form.videoScript" /></div>
        <div class="grid-2">
          <div class="field">
            <label>主图 URL（每行一条）</label>
            <textarea rows="4" v-model.trim="form.mainImageUrlsText" placeholder="https://.../main-01.jpg" />
          </div>
          <div class="field">
            <label>场景图 URL（每行一条）</label>
            <textarea rows="4" v-model.trim="form.sceneImageUrlsText" placeholder="https://.../scene-01.jpg" />
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>上传主图（本地）</label>
            <p class="tip-text">图片将保存至受控对象存储，并与当前任务关联。</p>
            <input class="input" type="file" accept="image/*" multiple @change="onMainImagesChange" />
            <div v-if="localMainImages.length" class="img-preview-list">
              <img v-for="(url, idx) in localMainImages" :key="`main-${idx}`" :src="url" alt="main preview" class="img-preview" />
            </div>
          </div>
          <div class="field">
            <label>上传场景图（本地）</label>
            <input class="input" type="file" accept="image/*" multiple @change="onSceneImagesChange" />
            <div v-if="localSceneImages.length" class="img-preview-list">
              <img v-for="(url, idx) in localSceneImages" :key="`scene-${idx}`" :src="url" alt="scene preview" class="img-preview" />
            </div>
          </div>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card">
        <div class="actions-row">
          <button class="btn btn-secondary" :disabled="loading" @click="saveDraft">保存草稿</button>
          <button class="btn btn-primary" :disabled="loading" @click="startDetect">提交发布前审校</button>
          <button class="btn btn-secondary" :disabled="loading" @click="submitReview">提交人工复核</button>
        </div>
        <p v-if="tip" class="tip-text">{{ tip }}</p>
      </AppGlassSurface>
    </section>

    <div v-if="detecting" class="detect-modal-mask">
      <AppGlassSurface as="section" class="detect-modal fade-up" :radius="20" role="dialog" aria-modal="true" aria-label="检测中">
        <div class="state loading detect-loading">
          <p class="detect-title">正在检测中</p>
          <p class="detect-step">{{ detectStep }}</p>
        </div>
      </AppGlassSurface>
    </div>

    <div v-if="errorModal.open" class="detect-modal-mask" @click.self="closeErrorModal">
      <AppGlassSurface as="section" class="detect-modal fade-up" :radius="20" role="dialog" aria-modal="true" aria-label="提示">
        <h3 class="modal-title">提示</h3>
        <p class="modal-msg">{{ errorModal.message }}</p>
        <div class="actions-row" style="justify-content:flex-end;">
          <button class="btn btn-primary" @click="closeErrorModal">我知道了</button>
        </div>
      </AppGlassSurface>
    </div>

  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';

const router = useRouter();
const loading = ref(false);
const detecting = ref(false);
const detectStep = ref('');
const tip = ref('');
const errorModal = ref({ open: false, message: '' });
const taskId = ref('');
const localMainImages = ref<string[]>([]);
const localSceneImages = ref<string[]>([]);
const quotaInfo = ref<any>({ quotaRemaining: 0, planName: '-' });
const quotaLoadError = ref('');

const platforms = [
  'Amazon',
  'TikTok Shop',
  'Shopee',
  'Lazada',
  'AliExpress',
  'eBay',
  'Walmart',
  'Etsy',
  'Temu',
  'Shein',
  'Ozon',
  'Mercado Libre',
  'Noon',
  'Daraz',
  'Facebook Shop',
  'Instagram Shop',
  'YouTube Shopping',
  '独立站',
];
const platformScenarios: Record<string, { markets: string[]; languages: string[]; guidance: string }> = {
  Amazon: { markets: ['美国', '英国', '德国', '日本', '加拿大'], languages: ['英语', '德语', '日语'], guidance: '将校验站点合规表达、标题结构与详情页信息一致性。' },
  'TikTok Shop': { markets: ['马来西亚', '泰国', '越南', '菲律宾', '新加坡', '英国', '美国'], languages: ['英语', '马来语', '泰语', '越南语'], guidance: '将重点核验短视频/商品卡素材的宣传表述与本地化语言。' },
  Shopee: { markets: ['马来西亚', '泰国', '越南', '菲律宾', '新加坡', '台湾'], languages: ['英语', '马来语', '泰语', '越南语', '中文'], guidance: '将按站点检查标题、卖点和主图中的敏感或夸大表达。' },
  Lazada: { markets: ['马来西亚', '泰国', '越南', '菲律宾', '新加坡'], languages: ['英语', '马来语', '泰语', '越南语'], guidance: '将按东南亚站点检查商品信息完整性和本地化表述。' },
  'Mercado Libre': { markets: ['墨西哥', '巴西', '阿根廷', '智利'], languages: ['西班牙语', '葡萄牙语'], guidance: '将检查拉美站点的语言适配与受限宣称。' },
  Noon: { markets: ['沙特阿拉伯', '阿联酋', '埃及'], languages: ['阿拉伯语', '英语'], guidance: '将核验阿拉伯语市场的本地化表述和品类限制。' },
  默认: { markets: ['美国', '英国', '马来西亚', '泰国', '越南', '菲律宾', '新加坡', '沙特阿拉伯', '阿联酋', '其他试点站点'], languages: ['英语', '中文', '马来语', '泰语', '越南语', '阿拉伯语'], guidance: '将使用当前已启用的通用规则模板；其他平台可通过规则库补充。' },
};
const availableScenario = computed(() => platformScenarios[form.platform] || platformScenarios.默认);
const availableMarkets = computed(() => availableScenario.value.markets);
const availableLanguages = computed(() => availableScenario.value.languages);
const platformGuidance = computed(() => availableScenario.value.guidance);
const purposes = ['上架前审核', '广告投放前审核', '活动素材审核', '历史素材复审'];
const categories = [
  '衣服',
  '鞋靴',
  '箱包配饰',
  '3C数码',
  '家居家纺',
  '美妆个护',
  '母婴玩具',
  '运动户外',
  '食品保健',
  '汽车用品',
  '办公文具',
  '宠物用品',
  '其他',
];

const form = reactive({
  sku: '',
  productName: '',
  category: '',
  platform: '',
  market: '',
  language: '',
  purpose: '',
  title: '',
  sellingPoints: '',
  detailText: '',
  adText: '',
  videoScript: '',
  mainImageUrlsText: '',
  sceneImageUrlsText: '',
});

watch(() => form.platform, () => {
  form.market = '';
  form.language = '';
});

function validateRequired() {
  return !!(form.sku && form.productName && form.category && form.platform && form.market && form.language && form.purpose && form.title && form.sellingPoints && form.detailText);
}

function showErrorModal(message: string) {
  errorModal.value = { open: true, message };
}

function closeErrorModal() {
  errorModal.value = { open: false, message: '' };
}

function parseMultilineUrls(value: string) {
  return value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);
}

function filesToObjectUrls(files: FileList | null) {
  if (!files) return [];
  return Array.from(files).map((file) => URL.createObjectURL(file));
}

async function onMainImagesChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  const task = await ensureTaskSaved();
  const uploaded = await Promise.all(files.map((f) => api.uploadFile(f, task)));
  localMainImages.value = uploaded.map((x: any) => x.url);
  quotaInfo.value = await api.quotaCheck();
}

async function onSceneImagesChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  const task = await ensureTaskSaved();
  const uploaded = await Promise.all(files.map((f) => api.uploadFile(f, task)));
  localSceneImages.value = uploaded.map((x: any) => x.url);
  quotaInfo.value = await api.quotaCheck();
}

async function ensureTaskSaved() {
  if (taskId.value) return taskId.value;
  const mainImageUrls = [...parseMultilineUrls(form.mainImageUrlsText), ...localMainImages.value];
  const sceneImageUrls = [...parseMultilineUrls(form.sceneImageUrlsText), ...localSceneImages.value];
  const created = await api.createTask({
    sku: form.sku,
    productName: form.productName,
    category: form.category,
    platform: form.platform,
    market: form.market,
    language: form.language,
    purpose: form.purpose,
    title: form.title,
    sellingPoints: form.sellingPoints,
    detailText: form.detailText,
    adText: form.adText,
    videoScript: form.videoScript,
    mainImageUrls,
    sceneImageUrls,
    imageUrls: [...mainImageUrls, ...sceneImageUrls],
  });
  taskId.value = (created as any).id;
  return taskId.value;
}

async function saveDraft() {
  closeErrorModal();
  tip.value = '';
  if (!validateRequired()) {
    showErrorModal('请先填写必填项');
    return;
  }
  loading.value = true;
  try {
    quotaInfo.value = await api.quotaCheck();
    const id = await ensureTaskSaved();
    const mainImageUrls = [...parseMultilineUrls(form.mainImageUrlsText), ...localMainImages.value];
    const sceneImageUrls = [...parseMultilineUrls(form.sceneImageUrlsText), ...localSceneImages.value];
    await api.saveTaskMaterials(id, {
      title: form.title,
      sellingPoints: form.sellingPoints,
      detailText: form.detailText,
      adText: form.adText,
      videoScript: form.videoScript,
      mainImageUrls,
      sceneImageUrls,
      imageUrls: [...mainImageUrls, ...sceneImageUrls],
    });
    tip.value = '草稿已保存';
  } catch (e) {
    showErrorModal(getFriendlyError(e));
  } finally {
    loading.value = false;
  }
}

async function startDetect() {
  closeErrorModal();
  tip.value = '';
  if (!validateRequired()) {
    showErrorModal('请先填写必填项');
    return;
  }
  loading.value = true;
  detecting.value = true;
  const startedAt = Date.now();
  try {
    quotaInfo.value = await api.quotaCheck();
    if ((quotaInfo.value?.quotaRemaining ?? 0) <= 0) {
      showErrorModal('当前套餐检测额度不足，请升级套餐或联系团队开通额度');
      return;
    }
    const id = await ensureTaskSaved();
    detectStep.value = '准备任务与素材...';
    await new Promise((r) => setTimeout(r, 700));
    detectStep.value = '调用检测引擎分析文本与图片...';
    await api.analyzeTask(id);
    detectStep.value = '整理检测结果与风险建议...';
    const elapsed = Date.now() - startedAt;
    if (elapsed < 2600) {
      await new Promise((r) => setTimeout(r, 2600 - elapsed));
    }
    await api.updateTaskStatus(id, 'COMPLETED');
    router.push(`/results?taskId=${encodeURIComponent(id)}`);
  } catch (e) {
    showErrorModal(getFriendlyError(e));
  } finally {
    detecting.value = false;
    detectStep.value = '';
    loading.value = false;
  }
}

async function submitReview() {
  closeErrorModal();
  tip.value = '';
  if (!validateRequired()) {
    showErrorModal('请先填写必填项');
    return;
  }
  loading.value = true;
  try {
    const id = await ensureTaskSaved();
    await api.requestManualReview(id, '任务中心提交人工复核');
    await api.updateTaskStatus(id, 'REVIEW_REQUIRED');
    tip.value = '已提交人工复核';
  } catch (e) {
    showErrorModal(getFriendlyError(e));
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  try {
    const generated = sessionStorage.getItem('zyyf_generated_material');
    if (generated) {
      const material = JSON.parse(generated);
      Object.assign(form, material);
      sessionStorage.removeItem('zyyf_generated_material');
      tip.value = '已带入生成的素材初稿，请确认后提交发布前审校。';
    }
  } catch {
    sessionStorage.removeItem('zyyf_generated_material');
  }
  api.quotaCheck()
    .then((q) => { quotaInfo.value = q; })
    .catch((error) => { quotaLoadError.value = `额度信息暂不可用：${getFriendlyError(error)}`; });
});
</script>

<style scoped>
.task-intro { display: grid; gap: 12px; }
.intro-topline, .section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.eyebrow { margin: 0; color: var(--brand-1); font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.intro-copy, .section-heading > p { margin: -4px 0 0; color: var(--muted); line-height: 1.7; }
.quota-chip { margin: 0; padding: 5px 10px; border: 1px solid color-mix(in srgb, var(--brand-1) 25%, var(--border)); border-radius: 999px; color: var(--brand-1); background: color-mix(in srgb, var(--brand-1) 8%, transparent); font-size: 13px; font-weight: 700; white-space: nowrap; }
.workflow-steps { display: flex; list-style: none; gap: 8px; padding: 0; margin: 2px 0 4px; overflow-x: auto; }
.workflow-steps li { min-width: 142px; display: flex; align-items: center; gap: 8px; padding: 9px 11px; color: var(--muted); border: 1px solid var(--border); border-radius: 10px; background: color-mix(in srgb, var(--card-strong) 72%, transparent); font-size: 13px; font-weight: 700; }
.workflow-steps li:not(:last-child)::after { content: "→"; margin-left: auto; color: var(--muted); }
.workflow-steps b { width: 21px; height: 21px; display: grid; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--muted) 14%, transparent); font-size: 12px; }
.workflow-steps .active { border-color: color-mix(in srgb, var(--brand-1) 44%, var(--border)); color: var(--brand-1); }
.workflow-steps .active b { color: #fff; background: var(--brand-1); }
.scenario-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; align-items: end; }
.scenario-grid > div { grid-column: span 2; display: grid; gap: 6px; }
.scenario-grid .sku-field { grid-column: span 2; }
.scenario-grid .product-field { grid-column: span 2; }
.scenario-hint { margin: 0; padding: 10px 12px; border-radius: 10px; color: var(--muted); background: color-mix(in srgb, var(--brand-1) 8%, transparent); font-size: 13px; }
.materials-card { display: grid; gap: 14px; }
.section-heading h3 { margin: 4px 0 0; font-size: 18px; }
.grid-2 { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field { display: grid; gap: 6px; }
.img-preview-list { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.img-preview { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); }
.actions-row { display: flex; gap: 10px; flex-wrap: wrap; }
.tip-text { margin: 6px 0 0; color: var(--brand-1); }
.quota-error { margin: 0; color: #dc2626; font-size: 14px; }
.detect-loading { margin: 0; text-align: center; border: none; background: transparent; }
.detect-title { margin: 0 0 6px; font-weight: 700; color: var(--text); }
.detect-step { margin: 0; color: var(--muted); }
.modal-title { margin: 0 0 8px; font-size: 22px; }
.modal-msg { margin: 0 0 14px; color: #ef4444; font-weight: 700; }
.detect-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 23, 42, 0.42);
  display: grid;
  place-items: center;
  padding: 16px;
}
.detect-modal {
  width: min(520px, calc(100vw - 32px));
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card-strong);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  padding: 20px;
}
@media (max-width: 1180px) { .scenario-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } .scenario-grid > div, .scenario-grid .sku-field, .scenario-grid .product-field { grid-column: span 2; } }
@media (max-width: 760px) {
  .intro-topline, .section-heading { display: grid; gap: 7px; }
  .quota-chip { width: fit-content; }
  .workflow-steps { margin-left: -2px; margin-right: -2px; }
  .workflow-steps li { min-width: 132px; }
  .scenario-grid { grid-template-columns: 1fr; gap: 11px; }
  .scenario-grid > div, .scenario-grid .sku-field, .scenario-grid .product-field { grid-column: auto; }
  .grid-2 { grid-template-columns: 1fr; }
  .actions-row { display: grid; grid-template-columns: 1fr; }
  .actions-row .btn { width: 100%; }
  .detect-modal { padding: 16px; }
}
</style>
