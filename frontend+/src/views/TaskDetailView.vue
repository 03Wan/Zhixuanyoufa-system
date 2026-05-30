<template>
  <main class="page-stack fade-up">
    <header class="glass card row-between">
      <div>
        <h2 class="section-title">任务详情</h2>
        <p class="text-muted">任务编号：{{ detail.taskNo || detail.id || "-" }}</p>
      </div>
      <div class="actions-row">
        <button class="btn btn-secondary" @click="goBack">返回任务中心</button>
      </div>
    </header>

    <section v-if="loading.detail" class="glass card state loading">任务详情加载中</section>
    <section v-else-if="error" class="glass card" style="color:#ef4444;">{{ error }}</section>
    <template v-else>
      <section class="glass card">
        <h3 style="margin-top:0;">商品基础信息</h3>
        <div class="grid-2">
          <div><label>商品名称</label><input class="input" v-model="detail.productName" :disabled="!isEditing" /></div>
          <div><label>商品品类</label><input class="input" v-model="detail.category" :disabled="!isEditing" /></div>
          <div><label>目标平台</label><input class="input" v-model="detail.platform" :disabled="!isEditing" /></div>
          <div><label>目标市场</label><input class="input" v-model="detail.market" :disabled="!isEditing" /></div>
          <div><label>发布目的</label><input class="input" v-model="detail.purpose" :disabled="!isEditing" /></div>
          <div><label>当前状态</label><input class="input" :value="statusLabel(detail.status)" disabled /></div>
        </div>
      </section>

      <section class="glass card">
        <h3 style="margin-top:0;">文本素材</h3>
        <div class="page-stack">
          <div><label>商品标题</label><textarea rows="2" v-model="material.title" :disabled="!isEditing"></textarea></div>
          <div><label>核心卖点</label><textarea rows="4" v-model="material.sellingPoints" :disabled="!isEditing"></textarea></div>
          <div><label>详情页文案</label><textarea rows="5" v-model="material.detailText" :disabled="!isEditing"></textarea></div>
          <div><label>广告语</label><textarea rows="3" v-model="material.adText" :disabled="!isEditing"></textarea></div>
        </div>
      </section>

      <section class="glass card">
        <div class="row-between">
          <h3 style="margin:0;">图片素材</h3>
          <div class="actions-row">
            <select v-model="newImage.type" :disabled="!isEditing">
              <option value="主图">主图</option>
              <option value="细节图">细节图</option>
              <option value="场景图">场景图</option>
            </select>
            <input type="file" accept="image/*" :disabled="!isEditing" @change="onFileChange" />
          </div>
        </div>
        <div v-if="images.length === 0" class="state">暂无图片素材，请上传图片。</div>
        <div v-else class="image-grid">
          <article v-for="img in images" :key="img.id" class="image-card">
            <img :src="img.url" :alt="img.type" />
            <div class="row-between">
              <span class="text-muted">{{ img.type }}</span>
              <button v-if="isEditing" class="btn btn-secondary" @click="removeImage(img.id)">删除</button>
            </div>
          </article>
        </div>
      </section>

      <section class="glass card row-between">
        <div class="actions-row">
          <button class="btn btn-secondary" @click="toggleEdit">{{ isEditing ? "取消编辑" : "编辑任务" }}</button>
          <button v-if="isEditing" class="btn btn-primary" :disabled="loading.save" @click="saveAll">
            {{ loading.save ? "保存中..." : "保存素材与任务" }}
          </button>
        </div>
        <div class="actions-row">
          <button class="btn btn-secondary" :disabled="loading.detect || detail.status==='DETECTING'" @click="runDetect">
            {{ loading.detect ? "检测中..." : detail.status==='DETECTING' ? "检测中" : "启动检测" }}
          </button>
          <button class="btn btn-secondary" @click="viewResult">查看结果</button>
          <button class="btn btn-primary" :disabled="loading.report" @click="generateReport">
            {{ loading.report ? "生成中..." : "生成报告" }}
          </button>
        </div>
      </section>

      <section class="glass card">
        <div class="row-between">
          <h3 style="margin:0;">素材版本记录</h3>
          <button class="btn btn-secondary" @click="saveVersion">保存新版本</button>
        </div>
        <div v-if="versions.length===0" class="state">暂无素材版本记录</div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead><tr><th>版本号</th><th>标题</th><th>评分快照</th><th>风险快照</th><th>创建时间</th></tr></thead>
            <tbody>
              <tr v-for="v in versions" :key="v.id">
                <td>v{{ v.versionNo }}</td>
                <td>{{ v.title || '-' }}</td>
                <td>{{ v.scoreSnapshot ?? '-' }}</td>
                <td>{{ v.riskSnapshot ?? '-' }}</td>
                <td>{{ v.createdAt || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, getFriendlyError } from "@/lib/api";

const route = useRoute();
const router = useRouter();
const id = String(route.params.id);
const isEditing = ref(route.query.edit === "1");
const error = ref("");
const loading = reactive({ detail: true, save: false, detect: false, report: false });
const detail = reactive<any>({});
const material = reactive<any>({ title: "", sellingPoints: "", detailText: "", adText: "" });
const images = ref<any[]>([]);
const versions = ref<any[]>([]);
const newImage = reactive({ type: "主图", file: null as File | null });

const statusMap: Record<string, string> = {
  PENDING_DETECTION: "待检测",
  DETECTING: "检测中",
  COMPLETED: "已完成",
  REVIEW_REQUIRED: "待复核",
  HOLD: "暂缓发布",
  REPORTED: "已出报告",
  DRAFT: "待检测",
};
const statusLabel = (s?: string) => statusMap[String(s || "").toUpperCase()] || s || "-";

function normalizeMaterials(raw: any) {
  material.title = raw?.title || "";
  material.sellingPoints = Array.isArray(raw?.sellingPoints) ? raw.sellingPoints.join("\n") : raw?.sellingPoints || "";
  material.detailText = raw?.detailText || "";
  material.adText = raw?.adText || "";
  const rawImgs = Array.isArray(raw?.imageUrls) ? raw.imageUrls : [];
  images.value = rawImgs.map((u: string, idx: number) => ({ id: `img-${idx}-${Date.now()}`, type: "主图", url: u }));
}

async function loadDetail() {
  loading.detail = true;
  error.value = "";
  try {
    const data = await api.getTaskDetail(id) as any;
    Object.assign(detail, data || {});
    normalizeMaterials(data?.materialContent || {});
    const vs = await api.getMaterialVersions(id) as any[];
    versions.value = (vs || []).map((v: any) => ({ ...v, scoreSnapshot: v.scoreSnapshot?.totalScore ?? v.scoreSnapshot, riskSnapshot: v.riskSnapshot?.riskLevel ?? v.riskSnapshot }));
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.detail = false;
  }
}

async function saveVersion() {
  await api.snapshotMaterialVersion(id, {
    title: material.title,
    sellingPoints: material.sellingPoints,
    detailText: material.detailText,
    adText: material.adText,
    imageUrls: images.value.map((i) => i.url),
  });
  await loadDetail();
}

function toggleEdit() {
  isEditing.value = !isEditing.value;
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  newImage.file = file;
  images.value.push({
    id: `img-${Date.now()}`,
    type: newImage.type,
    url: URL.createObjectURL(file),
  });
  target.value = "";
}

function removeImage(imgId: string) {
  images.value = images.value.filter((i) => i.id !== imgId);
}

async function saveAll() {
  loading.save = true;
  error.value = "";
  try {
    await api.updateTask(id, {
      productName: detail.productName,
      category: detail.category,
      platform: detail.platform,
      market: detail.market,
      purpose: detail.purpose,
    });
    await api.saveTaskMaterials(id, {
      title: material.title,
      sellingPoints: material.sellingPoints.split("\n").map((x: string) => x.trim()).filter(Boolean),
      detailText: material.detailText,
      adText: material.adText,
      imageUrls: images.value.map((i) => i.url),
    });
    isEditing.value = false;
    await loadDetail();
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.save = false;
  }
}

async function runDetect() {
  if (detail.status === "DETECTING") return;
  loading.detect = true;
  try {
    await api.updateTaskStatus(id, "DETECTING");
    detail.status = "DETECTING";
    await api.analyzeTask(id);
    await api.updateTaskStatus(id, "COMPLETED");
    detail.status = "COMPLETED";
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.detect = false;
  }
}

function viewResult() {
  router.push(`/results?taskId=${encodeURIComponent(id)}`);
}

async function generateReport() {
  loading.report = true;
  try {
    const report = await api.generateReport(id) as any;
    await api.updateTaskStatus(id, "REPORTED");
    router.push(`/reports/${report.id || "demo-report-1"}`);
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.report = false;
  }
}

function goBack() {
  router.push("/home");
}

onMounted(loadDetail);
</script>

<style scoped>
.grid-2 { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }
.image-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.image-card { border: 1px solid var(--border); border-radius: 10px; padding: 8px; display: grid; gap: 8px; background: var(--card-strong); }
.image-card img { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; }
.state { border: 1px dashed var(--border); border-radius: 10px; padding: 12px; color: var(--muted); }
@media (max-width: 960px) {
  .grid-2 { grid-template-columns: 1fr; }
  .image-grid { grid-template-columns: 1fr 1fr; }
}
</style>
