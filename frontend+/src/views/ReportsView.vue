<template>
  <AppShell title="报告中心">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card block">
        <h2 class="section-title">报告筛选</h2>
        <div class="filter-grid">
          <input class="input" v-model.trim="filters.keyword" placeholder="商品名称 / 任务编号" />
          <select v-model="filters.platform"><option value="">全部平台</option><option v-for="p in platforms" :key="p" :value="p">{{ p }}</option></select>
          <select v-model="filters.market"><option value="">全部市场</option><option v-for="m in markets" :key="m" :value="m">{{ m }}</option></select>
          <select v-model="filters.riskLevel"><option value="">全部风险等级</option><option>低风险</option><option>中风险</option><option>高风险</option></select>
          <select v-model="filters.decision"><option value="">全部发布决策</option><option>可发布</option><option>优化后发布</option><option>人工复核</option><option>暂缓发布</option></select>
          <input class="input" type="date" v-model="filters.startDate" />
          <input class="input" type="date" v-model="filters.endDate" />
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card">
        <div class="row-between">
          <h2 class="section-title">报告列表</h2>
          <button class="btn btn-secondary" :disabled="loading" @click="load">{{ loading ? '刷新中' : '刷新报告' }}</button>
        </div>
        <div v-if="loading" class="state loading">报告加载中</div>
        <div v-else-if="error" class="state error">{{ error }}</div>
        <div v-else-if="filtered.length===0" class="state">暂无符合条件的报告。</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>报告编号</th><th>任务名称</th><th>平台/市场</th><th>评分</th><th>风险</th><th>决策</th><th>时间</th><th class="op-col">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in pagedRows" :key="r.id">
                <td>{{ r.reportNo || '-' }}</td>
                <td>{{ r.task?.productName || r.title || '-' }}</td>
                <td>{{ r.task?.platform || '-' }} / {{ r.task?.market || '-' }}</td>
                <td>{{ r.result?.score ?? r.result?.totalScore ?? '-' }}</td>
                <td><span :class="['tag', riskClass(r.result?.riskLevel)]">{{ r.result?.riskLevel || '-' }}</span></td>
                <td><span :class="['tag', decisionClass(r.result?.decision)]">{{ r.result?.decision || '-' }}</span></td>
                <td>{{ formatTime(r.createdAt) }}</td>
                <td class="op-col">
                  <div class="actions">
                    <button class="btn btn-secondary" @click="view(r.id)">查看</button>
                    <button class="btn btn-primary" @click="download(r.id, exportFormat)">下载</button>
                    <button class="btn btn-secondary" @click="print(r.id)">打印</button>
                    <button class="btn btn-secondary" @click="removeReport(r.id)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pager" v-if="totalPages > 1">
          <button class="btn btn-secondary" :disabled="page===1" @click="page--">上一页</button>
          <span>第 {{ page }} / {{ totalPages }} 页</span>
          <button class="btn btn-secondary" :disabled="page===totalPages" @click="page++">下一页</button>
        </div>

        <div class="export-bar">
          <label>导出格式：</label>
          <select v-model="exportFormat">
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { confirmDialog, notify, toast } from '@/lib/dialog';

const router = useRouter();
const loading = ref(true);
const error = ref('');
const rows = ref<any[]>([]);
const page = ref(1);
const pageSize = 10;
const exportFormat = ref<'pdf' | 'docx' | 'json'>('pdf');

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
const filters = reactive({ keyword: '', platform: '', market: '', riskLevel: '', decision: '', startDate: '', endDate: '' });

function shortNo(id?: string) { return `TSK-${String(id || '').slice(-6).toUpperCase()}`; }
function formatTime(v?: string) {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '-';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`;
}
function riskClass(v?: string) { if ((v || '').includes('高')) return 'tag-danger'; if ((v || '').includes('中')) return 'tag-warning'; return 'tag-success'; }
function decisionClass(v?: string) { if ((v || '').includes('暂缓')) return 'tag-danger'; if ((v || '').includes('复核') || (v || '').includes('优化')) return 'tag-warning'; return 'tag-success'; }

const filtered = computed(() => rows.value.filter((r) => {
  const keyword = filters.keyword.toLowerCase();
  const source = `${r.task?.productName || ''} ${r.title || ''} ${r.task?.taskNo || shortNo(r.taskId)}`.toLowerCase();
  const at = new Date(r.createdAt || 0).getTime();
  const start = filters.startDate ? new Date(`${filters.startDate}T00:00:00`).getTime() : 0;
  const end = filters.endDate ? new Date(`${filters.endDate}T23:59:59`).getTime() : Number.MAX_SAFE_INTEGER;
  return (!keyword || source.includes(keyword))
    && (!filters.platform || r.task?.platform === filters.platform)
    && (!filters.market || r.task?.market === filters.market)
    && (!filters.riskLevel || r.result?.riskLevel === filters.riskLevel)
    && (!filters.decision || r.result?.decision === filters.decision)
    && at >= start && at <= end;
}));

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const pagedRows = computed(() => filtered.value.slice((page.value - 1) * pageSize, (page.value - 1) * pageSize + pageSize));

watch(filtered, () => {
  if (page.value > totalPages.value) page.value = 1;
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    rows.value = await api.getReportList();
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
}

function view(id: string) { router.push(`/reports/${id}`); }
async function download(id: string, format: 'pdf' | 'docx' | 'json') {
  try {
    await api.downloadReport(id, format);
  } catch (e) {
    error.value = getFriendlyError(e);
    await notify(error.value);
  }
}
function print(id: string) { router.push(`/reports/${id}?print=1`); }
async function removeReport(id: string) {
  if (!(await confirmDialog('确认删除该报告吗？'))) return;
  try {
    await api.deleteReport(id);
    await load();
    toast('报告已删除', 'success');
  } catch (e) {
    error.value = getFriendlyError(e);
    await notify(error.value);
  }
}

onMounted(load);
</script>

<style scoped>
.block { display: grid; gap: 10px; }
.filter-grid { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.actions { display: flex; gap: 6px; flex-wrap: nowrap; }
.table-wrap { overflow-x: visible; }
.op-col { min-width: 250px; }
.table th, .table td { white-space: nowrap; }
.table td:nth-child(2) { white-space: normal; min-width: 120px; }
.actions .btn { min-height: 32px; padding: 6px 10px; border-radius: 10px; font-size: 13px; }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; gap: 8px; align-items: center; }
.export-bar { margin-top: 10px; display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; }
.export-bar label { white-space: nowrap; word-break: keep-all; flex: 0 0 auto; }
.export-bar select { min-width: 120px; }
@media (max-width: 1200px) { .filter-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 760px) { .filter-grid { grid-template-columns: 1fr; } }
</style>
