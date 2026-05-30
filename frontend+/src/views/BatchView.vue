<template>
  <AppShell title="批量检测">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card">
        <h2 class="section-title">批量检测</h2>
        <p class="text-muted">当前支持表格批量录入并批量创建检测子任务。</p>
        <div class="actions">
          <label class="btn btn-secondary import-btn">
            导入CSV
            <input type="file" accept=".csv,text/csv" @change="importCsv" />
          </label>
          <button class="btn btn-secondary" @click="addRow">新增行</button>
          <button class="btn btn-secondary" :disabled="rows.length <= 1" @click="clearRows">清空</button>
          <button class="btn btn-primary" :disabled="saving" @click="submitBatch">{{ saving ? '创建中' : '创建批量任务' }}</button>
        </div>
        <p class="text-muted import-tip">CSV表头：商品名称, 品类, 平台, 市场, 标题, 卖点, 详情, 广告语</p>
        <div class="table-wrap" style="margin-top:8px;">
          <table class="table">
            <thead><tr><th>商品名称</th><th>品类</th><th>平台</th><th>市场</th><th>标题</th><th>卖点</th><th>详情</th><th>广告语</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="(r,idx) in rows" :key="idx">
                <td><input class="input" v-model="r.productName" /></td>
                <td><input class="input" v-model="r.category" /></td>
                <td><input class="input" v-model="r.platform" /></td>
                <td><input class="input" v-model="r.market" /></td>
                <td><input class="input" v-model="r.title" /></td>
                <td><input class="input" v-model="r.sellingPoints" /></td>
                <td><input class="input" v-model="r.detailText" /></td>
                <td><input class="input" v-model="r.adText" /></td>
                <td><button class="btn btn-secondary btn-xs" :disabled="rows.length <= 1" @click="removeRow(idx)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card">
        <div class="row-between"><h3>批量任务列表</h3><button class="btn btn-secondary" :disabled="loading" @click="load">{{ loading ? '刷新中' : '刷新' }}</button></div>
        <div v-if="loading" class="state loading center-loading">批量任务加载中</div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead><tr><th>名称</th><th>状态</th><th>总数</th><th>成功</th><th>失败</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="b in batches" :key="b.id">
                <td>{{ b.name }}</td><td>{{ b.status }}</td><td>{{ b.totalCount }}</td><td>{{ b.successCount }}</td><td>{{ b.failedCount }}</td>
                <td class="actions"><button class="btn btn-primary" @click="runBatch(b.id)">运行</button><button class="btn btn-secondary" @click="inspect(b.id)">查看结果</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card" v-if="activeBatch">
        <h3>批量检测结果明细</h3>
        <table class="table">
          <thead><tr><th>行号</th><th>状态</th><th>任务ID</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="it in activeBatch.items || []" :key="it.id">
              <td>{{ it.rowNo }}</td><td>{{ it.status }}</td><td>{{ it.taskId || '-' }}</td>
              <td class="actions">
                <button class="btn btn-secondary" :disabled="!it.taskId" @click="goResult(it.taskId)">查看检测结果</button>
                <button class="btn btn-secondary" :disabled="!it.taskId" @click="genReport(it.taskId)">生成报告</button>
              </td>
            </tr>
          </tbody>
        </table>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { notify } from '@/lib/dialog';

const rows = ref<any[]>([]);
const batches = ref<any[]>([]);
const activeBatch = ref<any>(null);
const loading = ref(true);
const saving = ref(false);
const router = useRouter();

function addRow() {
  rows.value.push({ sku: '', productName: '', category: '', platform: '', market: '', purpose: '批量检测', title: '', sellingPoints: '', detailText: '', adText: '' });
}
function removeRow(index: number) {
  if (rows.value.length <= 1) return;
  rows.value.splice(index, 1);
}
function clearRows() {
  rows.value = [];
  addRow();
}
function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { cells.push(current.trim()); current = ''; }
    else current += ch;
  }
  cells.push(current.trim());
  return cells;
}
async function importCsv(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const dataLines = lines[0]?.includes('商品名称') ? lines.slice(1) : lines;
  const imported = dataLines.map(parseCsvLine).map((c) => ({
    sku: '',
    productName: c[0] || '',
    category: c[1] || '',
    platform: c[2] || '',
    market: c[3] || '',
    purpose: '批量检测',
    title: c[4] || '',
    sellingPoints: c[5] || '',
    detailText: c[6] || '',
    adText: c[7] || '',
  })).filter((row) => row.productName);
  rows.value = imported.length ? imported : rows.value;
  input.value = '';
  await notify(imported.length ? `已导入 ${imported.length} 行素材。` : '未识别到可导入的数据。');
}

async function submitBatch() {
  saving.value = true;
  try {
    const items = rows.value.filter((r) => r.productName && r.category && r.platform && r.market && r.title && r.sellingPoints && r.detailText && r.adText);
    if (items.length === 0) {
      await notify('请至少填写一行完整素材');
      return;
    }
    await api.createBatchTask({ name: `批量任务-${Date.now()}`, items });
    rows.value = [];
    addRow();
    await load();
  } catch (e) {
    await notify(getFriendlyError(e));
  } finally {
    saving.value = false;
  }
}

async function runBatch(id: string) {
  try {
    await api.runBatchTask(id);
    await inspect(id);
    await load();
  } catch (e) {
    await notify(getFriendlyError(e));
  }
}

async function inspect(id: string) { activeBatch.value = await api.getBatchTaskDetail(id); }
function goResult(taskId?: string) { if (taskId) router.push(`/results?taskId=${encodeURIComponent(taskId)}`); }
async function genReport(taskId?: string) {
  if (!taskId) return;
  const rep: any = await api.generateReport(taskId);
  router.push(`/reports/${rep.id}`);
}

async function load() {
  loading.value = true;
  try {
    batches.value = await api.getBatchTasks() as any[];
  } catch (e) {
    await notify(getFriendlyError(e));
  } finally {
    loading.value = false;
  }
}

onMounted(async () => { addRow(); await load(); });
</script>

<style scoped>
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.table { width: 100%; border-collapse: collapse; }
.table th,.table td{ border-bottom:1px solid var(--border); padding:6px; }
.center-loading { min-height: 260px; }
.btn-xs { min-height: 30px; padding: 6px 10px; border-radius: 10px; font-size: 12px; }
.import-btn { position: relative; overflow: hidden; }
.import-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.import-tip { margin: 8px 0 0; font-size: 12px; }
</style>
