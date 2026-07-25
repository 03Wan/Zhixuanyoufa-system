<template>
  <AppShell title="操作日志">
    <section class="page-stack fade-up">
      <div class="row-between">
        <h2 class="section-title">操作日志</h2>
        <div class="actions-row">
          <span class="text-muted">最近同步：{{ lastSyncText }}</span>
          <button class="btn btn-secondary" :disabled="loading || refreshing" @click="load()">{{ loading ? '刷新中' : refreshing ? '同步中' : '刷新日志' }}</button>
        </div>
      </div>

      <AppGlassSurface as="section" class="card block">
        <h3 style="margin: 0;">筛选条件</h3>
        <div class="filter-grid">
          <select v-model="filters.operator">
            <option value="">全部操作人</option>
            <option v-for="name in operatorOptions" :key="name" :value="name">{{ name }}</option>
          </select>
          <select v-model="filters.action">
            <option value="">全部操作类型</option>
            <option v-for="a in actionOptions" :key="a.value" :value="a.value">{{ a.label }}</option>
          </select>
          <select v-model="filters.result">
            <option value="">全部结果</option>
            <option value="成功">成功</option>
            <option value="失败">失败</option>
          </select>
          <input class="input" type="date" v-model="filters.startDate" />
          <input class="input" type="date" v-model="filters.endDate" />
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card">
        <div v-if="loading" class="state loading">日志加载中</div>
        <div v-else-if="pagedRows.length === 0" class="state">暂无符合条件的日志</div>
        <div v-else class="table-wrap">
          <table>
            <thead><tr><th>日志时间</th><th>操作人</th><th>用户角色</th><th>操作类型</th><th>操作对象</th><th>结果</th><th>备注</th></tr></thead>
            <tbody>
              <tr v-for="row in pagedRows" :key="row.logId || row.id">
                <td>{{ time(row.createdAt || row.actionTime) }}</td>
                <td>{{ row.operator || '-' }}</td>
                <td>{{ roleLabel(row.role) }}</td>
                <td>{{ actionLabel(row.action || row.actionType) }}</td>
                <td>{{ objectLabel(row) }}</td>
                <td><span :class="['tag', (row.result || '成功') === '成功' ? 'tag-success' : 'tag-danger']">{{ row.result || '成功' }}</span></td>
                <td>{{ row.note || row.remark || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager" v-if="totalPages > 1">
          <button class="btn btn-secondary" :disabled="page === 1" @click="page--">上一页</button>
          <span>第 {{ page }} / {{ totalPages }} 页</span>
          <button class="btn btn-secondary" :disabled="page === totalPages" @click="page++">下一页</button>
        </div>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api } from '@/lib/api';
import { ROLE_LABELS, normalizeRole } from '@/lib/permissions';

const loading = ref(true);
const refreshing = ref(false);
const rows = ref<any[]>([]);
const page = ref(1);
const pageSize = 10;
const lastSyncAt = ref<number>(0);
const syncTimer = ref<number | null>(null);
let loadPromise: Promise<void> | null = null;
const filters = reactive({ operator: '', action: '', result: '', startDate: '', endDate: '' });
const ACTION_MAP: Record<string, string> = {
  USER_LOGIN: '用户登录', USER_LOGOUT: '用户退出', CREATE_TASK: '创建任务', DELETE_TASK: '删除任务', UPDATE_TASK: '编辑任务', EDIT_TASK: '编辑任务',
  UPLOAD_MATERIAL: '上传素材', RUN_DETECTION: '启动检测', REQUEST_MANUAL_REVIEW: '提交人工复核', REVIEW_ACTION: '人工复核操作',
  GENERATE_REPORT: '生成审核报告', DOWNLOAD_REPORT: '下载报告', CREATE_RULE: '新增规则', UPDATE_RULE: '编辑规则', RULE_APPROVAL: '规则审批',
  RULE_ROLLBACK: '规则回滚', CUSTOMER_PLAN_UPDATE: '客户套餐调整', SEED_CREATE_TASK: '初始化任务',
  COMMERCIAL_APPLY: '企业账号申请', COMMERCIAL_APPROVE: '企业账号审批', REVIEW_START: '开始复核', REVIEW_COMPLETE: '完成复核',
};
const TARGET_MAP: Record<string, string> = { MATERIAL_TASK: '检测任务', REPORT: '审核报告', RULE: '规则', USER: '用户', REVIEW_TASK: '复核任务', RESOURCE: '资源', COMMERCIAL: '商业化申请' };
const actionOptions = Object.entries(ACTION_MAP).map(([value, label]) => ({ value, label }));
const operatorOptions = computed(() => Array.from(new Set(rows.value.map((row) => row.operator).filter(Boolean))).sort());

function time(v?: string) { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return '-'; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
function roleLabel(role?: string) { return role ? ROLE_LABELS[normalizeRole(role)] : '-'; }
function actionLabel(action?: string) { const key = String(action || '').toUpperCase(); return ACTION_MAP[key] || action || '-'; }
function shortId(id?: string) { if (!id) return '-'; return id.length > 12 ? id.slice(-12) : id; }
function displayObjectName(value: unknown) {
  const text = String(value || '').trim();
  const systemNames: Record<string, string> = { 'QA transient task': '测试临时任务', '?????': '未命名任务' };
  if (systemNames[text]) return systemNames[text];
  if (!text || /^\?+$/.test(text)) return '未命名任务';
  if (/^[A-Za-z0-9_-]{6,}$/.test(text)) return `编号：${text}`;
  return text;
}
function objectLabel(row: any) { const targetName = TARGET_MAP[String(row.targetType || '').toUpperCase()] || '业务对象'; const detail = row.detail || {}; const fromDetail = detail.productName || detail.reportNo || detail.ruleName || detail.taskNo || detail.targetName || ''; const id = row.targetId || row.target || ''; return `${targetName}：${displayObjectName(fromDetail || shortId(id))}`; }

const filteredRows = computed(() => rows.value.filter((row) => {
  const action = String(row.action || row.actionType || '').toUpperCase();
  const result = row.result || '成功';
  const at = new Date(row.createdAt || row.actionTime || 0).getTime();
  const start = filters.startDate ? new Date(`${filters.startDate}T00:00:00`).getTime() : 0;
  const end = filters.endDate ? new Date(`${filters.endDate}T23:59:59`).getTime() : Number.MAX_SAFE_INTEGER;
  return (!filters.operator || row.operator === filters.operator) && (!filters.action || action === filters.action) && (!filters.result || result === filters.result) && at >= start && at <= end;
}));
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)));
const pagedRows = computed(() => filteredRows.value.slice((page.value - 1) * pageSize, (page.value - 1) * pageSize + pageSize));
const lastSyncText = computed(() => lastSyncAt.value ? time(new Date(lastSyncAt.value).toISOString()) : '-');
watch(filteredRows, () => { if (page.value > totalPages.value) page.value = 1; });

async function load(options: { silent?: boolean } = {}) {
  if (loadPromise) return loadPromise;
  const silent = !!options.silent && rows.value.length > 0;
  if (silent) refreshing.value = true;
  else loading.value = true;
  loadPromise = (async () => {
    try {
      rows.value = await api.getLogs();
      lastSyncAt.value = Date.now();
    } finally {
      loading.value = false;
      refreshing.value = false;
      loadPromise = null;
    }
  })();
  return loadPromise;
}

function scheduleRefresh() {
  if (document.visibilityState !== 'visible') return;
  void load({ silent: true });
}

onMounted(async () => {
  await load();
  syncTimer.value = window.setInterval(scheduleRefresh, 30000);
});
onUnmounted(() => { if (syncTimer.value) clearInterval(syncTimer.value); });
</script>

<style scoped>
.block { display: grid; gap: 10px; }
.filter-grid { display: grid; gap: 10px; grid-template-columns: repeat(5, minmax(0, 1fr)); }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
.actions-row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.table-wrap { overflow:auto; }
@media (max-width: 1200px) { .filter-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 760px) { .filter-grid { grid-template-columns: 1fr; } }
</style>
