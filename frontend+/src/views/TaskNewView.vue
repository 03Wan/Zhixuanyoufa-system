<template>
  <AppShell title="任务中心">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card block">
        <h2 class="section-title">创建检测任务</h2>
        <p class="tip-text">当前套餐：{{ quotaInfo.planName || '-' }}，剩余额度：{{ quotaInfo.quotaRemaining ?? 0 }}</p>
        <div class="grid-3">
          <div><label>SKU *</label><input class="input" v-model.trim="form.sku" /></div>
          <div><label>商品名称 *</label><input class="input" v-model.trim="form.productName" /></div>
          <div><label>商品品类 *</label><input class="input" v-model.trim="form.category" /></div>
          <div>
            <label>目标平台 *</label>
            <select v-model="form.platform"><option value="">请选择</option><option v-for="p in platforms" :key="p" :value="p">{{ p }}</option></select>
          </div>
          <div>
            <label>目标市场 *</label>
            <select v-model="form.market"><option value="">请选择</option><option v-for="m in markets" :key="m" :value="m">{{ m }}</option></select>
          </div>
          <div>
            <label>发布目的 *</label>
            <select v-model="form.purpose"><option value="">请选择</option><option v-for="p in purposes" :key="p" :value="p">{{ p }}</option></select>
          </div>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card block">
        <h3>素材内容</h3>
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
            <p class="tip-text">当前MVP采用本地存储（local），商业化阶段可切换对象存储（OSS/COS/S3）。</p>
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
          <button class="btn btn-primary" :disabled="loading" @click="startDetect">开始检测</button>
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
import { reactive, ref } from 'vue';
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
const markets = ['欧美', '中东', '东南亚', '日本', '全球通用'];
const purposes = ['上架前审核', '广告投放前审核', '活动素材审核', '历史素材复审'];

const form = reactive({
  sku: '',
  productName: '',
  category: '',
  platform: '',
  market: '',
  purpose: '',
  title: '',
  sellingPoints: '',
  detailText: '',
  adText: '',
  videoScript: '',
  mainImageUrlsText: '',
  sceneImageUrlsText: '',
});

function validateRequired() {
  return !!(form.sku && form.productName && form.category && form.platform && form.market && form.purpose && form.title && form.sellingPoints && form.detailText);
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
      showErrorModal('当前套餐检测额度不足，请升级套餐或联系团队开通试点额度');
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

{
  api.quotaCheck().then((q) => { quotaInfo.value = q; }).catch(() => {});
}
</script>

<style scoped>
.block { display: grid; gap: 10px; }
.grid-3 { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-2 { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field { display: grid; gap: 6px; }
.img-preview-list { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.img-preview { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); }
.actions-row { display: flex; gap: 10px; flex-wrap: wrap; }
.tip-text { margin: 6px 0 0; color: var(--brand-1); }
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
@media (max-width: 1100px) { .grid-3, .grid-2 { grid-template-columns: 1fr 1fr; } }
@media (max-width: 760px) { .grid-3, .grid-2 { grid-template-columns: 1fr; } }
</style>

