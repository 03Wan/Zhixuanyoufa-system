<template>
  <AppShell title="首页">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card home-card">
        <div class="row-between">
          <h2 class="section-title">今日待办</h2>
          <button class="btn btn-secondary" :disabled="isRefreshing" @click="loadAll(true)">
            {{ isRefreshing ? "刷新中" : "刷新首页数据" }}
          </button>
        </div>

        <div v-if="pageError" class="state error">{{ pageError }}</div>

        <div class="kpi-grid">
          <AppGlassSurface as="article" class="card kpi-card">
            <p>今日审校任务数</p>
            <div v-if="loading.dashboard" class="metric-skeleton"></div>
            <h3 v-else>{{ dashboard.metrics.todayTaskCount }}</h3>
          </AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi-card">
            <p>待复核任务数</p>
            <div v-if="loading.dashboard" class="metric-skeleton"></div>
            <h3 v-else>{{ dashboard.metrics.pendingReviewCount }}</h3>
          </AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi-card">
            <p>高风险素材数</p>
            <div v-if="loading.dashboard" class="metric-skeleton"></div>
            <h3 v-else>{{ dashboard.metrics.highRiskCount }}</h3>
          </AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi-card">
            <p>首发通过率</p>
            <div v-if="loading.dashboard" class="metric-skeleton"></div>
            <h3 v-else>{{ dashboard.metrics.firstPassRate || 0 }}%</h3>
          </AppGlassSurface>
        </div>

        <AppGlassSurface as="section" class="card panel">
          <div class="row-between">
            <h3>套餐与额度</h3>
            <button class="btn btn-secondary" @click="goMyPlan">我的套餐</button>
          </div>
          <div class="kpi-grid">
            <AppGlassSurface as="article" class="card kpi-card"><p>当前套餐</p><h3>{{ usageInfo.subscription?.plan?.name || "-" }}</h3></AppGlassSurface>
            <AppGlassSurface as="article" class="card kpi-card"><p>本月已检测</p><h3>{{ usageInfo.monthlyUsed ?? 0 }}</h3></AppGlassSurface>
            <AppGlassSurface as="article" class="card kpi-card"><p>剩余检测次数</p><h3>{{ usageInfo.quotaRemaining ?? 0 }}</h3></AppGlassSurface>
            <AppGlassSurface as="article" class="card kpi-card"><p>报告导出权限</p><h3>{{ usageInfo.privileges?.canExportReport ? "支持" : "受限" }}</h3></AppGlassSurface>
            <AppGlassSurface as="article" class="card kpi-card"><p>批量检测</p><h3>{{ usageInfo.privileges?.canBatchDetect ? "支持" : "受限" }}</h3></AppGlassSurface>
            <AppGlassSurface as="article" class="card kpi-card"><p>API接口状态</p><h3>{{ usageInfo.privileges?.canUseApi ? "可申请" : "未开通" }}</h3></AppGlassSurface>
          </div>
          <div v-if="loading.usage" class="inline-state">套餐数据同步中</div>
          <p class="text-muted" style="margin-top: 8px;">
            企业版/定制版能力（批量检测、API接口、私有化部署）按企业审核结果开通。
          </p>
        </AppGlassSurface>

        <AppGlassSurface as="section" class="card panel">
          <div class="row-between">
            <h3>风险提醒</h3>
            <span class="text-muted">最近高风险任务</span>
          </div>
          <div v-if="loading.dashboard" class="inline-state">风险数据加载中</div>
          <div v-else-if="dashboard.highRiskTasks.length === 0" class="state">暂无高风险任务</div>
          <div v-else class="table-wrap">
            <table class="table">
              <thead><tr><th>任务名称</th><th>平台</th><th>风险等级</th><th>决策</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="task in dashboard.highRiskTasks.slice(0, 1)" :key="task.id">
                  <td>{{ task.productName }}</td>
                  <td>{{ task.platform }}</td>
                  <td><span :class="['tag', riskClass(task.riskLevel)]">{{ task.riskLevel }}</span></td>
                  <td>{{ decisionLabel(task.decision) }}</td>
                  <td><button class="btn btn-secondary" @click="goResult(task.id)">查看结果</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </AppGlassSurface>

        <div class="grid-2">
          <AppGlassSurface as="section" class="card panel">
            <div class="row-between">
              <h3>最近任务列表</h3>
              <button class="btn btn-secondary" @click="goTasks">进入任务中心</button>
            </div>
            <div v-if="loading.tasks" class="inline-state">任务加载中</div>
            <div v-else-if="tasks.length === 0" class="state">暂无任务</div>
            <div v-else class="table-wrap">
              <table class="table">
                <thead><tr><th>任务编号</th><th>商品名称</th><th>平台</th><th>状态</th><th>操作</th></tr></thead>
                <tbody>
                  <tr v-for="task in tasks.slice(0, 2)" :key="task.id">
                    <td>{{ task.taskNo || shortNo(task.id) }}</td>
                    <td>{{ task.productName }}</td>
                    <td>{{ task.platform }}</td>
                    <td>{{ statusLabel(task.status) }}</td>
                    <td class="op-row">
                      <button class="btn btn-secondary" @click="goTaskDetail(task.id)">查看</button>
                      <button class="btn btn-secondary" @click="goResult(task.id)">检测</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AppGlassSurface>

          <AppGlassSurface as="section" class="card panel">
            <div class="row-between">
              <h3>最近报告列表</h3>
              <button class="btn btn-secondary" @click="goReports">进入报告中心</button>
            </div>
            <div v-if="loading.reports" class="inline-state">报告加载中</div>
            <div v-else-if="reports.length === 0" class="state">暂无报告</div>
            <div v-else class="table-wrap">
              <table class="table">
                <thead><tr><th>报告编号</th><th>任务名称</th><th>评分</th><th>风险</th><th>操作</th></tr></thead>
                <tbody>
                  <tr v-for="r in reports.slice(0, 2)" :key="r.id">
                    <td>{{ r.reportNo || "-" }}</td>
                    <td>{{ r.task?.productName || r.title || "-" }}</td>
                    <td>{{ r.result?.score ?? "-" }}</td>
                    <td><span :class="['tag', riskClass(r.result?.riskLevel)]">{{ r.result?.riskLevel || "-" }}</span></td>
                    <td class="op-row"><button class="btn btn-secondary" @click="goReportDetail(r.id)">查看</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AppGlassSurface>
        </div>

        <section class="quick-grid">
          <button class="quick-card" @click="goTasks"><h4>新建检测任务</h4><p>创建任务并录入素材</p></button>
          <button class="quick-card" @click="goResults"><h4>查看检测结果</h4><p>查看评分、风险与建议</p></button>
          <button class="quick-card" @click="goReports"><h4>管理检测报告</h4><p>查看、打印、下载报告</p></button>
          <button class="quick-card" @click="goRules"><h4>维护规则库</h4><p>维护规则、风险等级和状态</p></button>
        </section>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "@/layouts/AppShell.vue";
import { api, getFriendlyError } from "@/lib/api";
import { readViewCache, writeViewCache } from "@/lib/view-cache";

const router = useRouter();
const pageError = ref("");
const dashboard = ref<any>({
  metrics: { todayTaskCount: 0, pendingReviewCount: 0, highRiskCount: 0, reportCount: 0 },
  highRiskTasks: [],
});
const tasks = ref<any[]>([]);
const reports = ref<any[]>([]);
const usageInfo = ref<any>({ privileges: {} });
const loading = reactive({
  dashboard: true,
  tasks: true,
  reports: true,
  usage: true,
});
const isRefreshing = ref(false);

const HOME_CACHE_KEY = "view-cache:home";

function shortNo(id: string) {
  return `TSK-${String(id || "").slice(-6).toUpperCase()}`;
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    DRAFT: "待检测",
    PENDING_DETECTION: "待检测",
    DETECTING: "检测中",
    COMPLETED: "已完成",
    REPORTED: "已完成",
    REVIEW_REQUIRED: "待复核",
    HOLD: "暂缓发布",
  };
  return map[String(status || "").toUpperCase()] || status || "-";
}

function riskClass(level?: string) {
  const value = String(level || "");
  if (value.includes("高")) return "tag-danger";
  if (value.includes("中")) return "tag-warning";
  return "tag-success";
}

function decisionLabel(value?: string) {
  const map: Record<string, string> = {
    APPROVE: '可发布',
    REJECT: '人工复核',
    OPTIMIZE_AND_REVIEW: '优化后发布',
    HOLD: '暂缓发布',
  };
  return map[String(value || '').toUpperCase()] || value || '-';
}

function goTasks() { router.push("/tasks/new"); }
function goResults() { router.push("/results"); }
function goReports() { router.push("/reports"); }
function goRules() { router.push("/rules"); }
function goMyPlan() { router.push("/my-plan"); }
function goResult(id: string) { router.push(`/results?taskId=${encodeURIComponent(id)}`); }
function goTaskDetail(id: string) { router.push(`/tasks/${id}`); }
function goReportDetail(id: string) { router.push(`/reports/${id}`); }

function applyCachedHome() {
  const cached = readViewCache<any>(HOME_CACHE_KEY);
  if (!cached) return false;
  dashboard.value = cached.dashboard || dashboard.value;
  tasks.value = cached.tasks || [];
  reports.value = cached.reports || [];
  usageInfo.value = cached.usageInfo || usageInfo.value;
  loading.dashboard = false;
  loading.tasks = false;
  loading.reports = false;
  loading.usage = false;
  return true;
}

function persistHomeCache() {
  writeViewCache(HOME_CACHE_KEY, {
    dashboard: dashboard.value,
    tasks: tasks.value,
    reports: reports.value,
    usageInfo: usageInfo.value,
  }, 45_000);
}

async function loadAll(showBusy = false) {
  if (showBusy) isRefreshing.value = true;
  pageError.value = "";
  const jobs = [
    api.getDashboardData()
      .then((data) => {
        dashboard.value = data;
        loading.dashboard = false;
      }),
    api.getTaskList()
      .then((data) => {
        tasks.value = data || [];
        loading.tasks = false;
      }),
    api.getReportList()
      .then((data) => {
        reports.value = data || [];
        loading.reports = false;
      }),
    api.getSubscriptionUsage()
      .then((data) => {
        usageInfo.value = data || { privileges: {} };
        loading.usage = false;
      }),
  ];

  const results = await Promise.allSettled(jobs);
  const failed = results.find((item) => item.status === "rejected") as PromiseRejectedResult | undefined;
  if (failed) pageError.value = getFriendlyError(failed.reason);
  persistHomeCache();
  isRefreshing.value = false;
}

onMounted(() => {
  const hasCache = applyCachedHome();
  if (!hasCache) {
    loading.dashboard = true;
    loading.tasks = true;
    loading.reports = true;
    loading.usage = true;
  }
  void loadAll(false);
});
</script>

<style scoped>
.home-card { min-height: calc(100vh - 16px); display: flex; flex-direction: column; }
.kpi-grid { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 8px; }
.kpi-card { padding: 10px; border-radius: 12px; }
.kpi-card p { margin: 0; color: var(--muted); }
.kpi-card h3 { margin: 6px 0 0; font-size: clamp(28px, 2.2vw, 40px); }
.panel { padding: 10px; margin-top: 10px; border-radius: 14px; }
.grid-2 { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; margin-top: 10px; }
.table-wrap { overflow: hidden; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid var(--border); padding: 8px 6px; text-align: left; vertical-align: middle; white-space: nowrap; }
.table th { color: var(--muted); font-weight: 600; }
.op-row { display: flex; gap: 6px; flex-wrap: nowrap; }
.tag { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 2px 10px; font-size: clamp(12px, 0.78vw, 13px); line-height: 1.2; font-weight: 700; border: 1px solid transparent; white-space: nowrap; word-break: keep-all; min-width: 64px; }
.tag-success { background: rgba(16, 185, 129, .12); color: #047857; border-color: rgba(16, 185, 129, .28); }
.tag-warning { background: rgba(245, 158, 11, .12); color: #b45309; border-color: rgba(245, 158, 11, .28); }
.tag-danger { background: rgba(239, 68, 68, .12); color: #b91c1c; border-color: rgba(239, 68, 68, .28); }
.quick-grid { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 10px; }
.quick-card { border: 1px solid var(--border); border-radius: 14px; background: var(--card-strong); padding: 10px; text-align: left; cursor: pointer; transition: .2s ease; }
.quick-card h4 { margin: 0 0 6px; font-size: clamp(15px, 1vw, 17px); }
.quick-card p { margin: 0; color: var(--muted); }
.state { border: 1px dashed var(--border); border-radius: 10px; padding: 10px; color: var(--muted); background: var(--card-strong); margin-top: 8px; }
.state.error { color: var(--danger); }
.inline-state { margin-top: 8px; color: var(--muted); font-size: 13px; }
.metric-skeleton { margin-top: 8px; height: 38px; border-radius: 12px; background: linear-gradient(90deg, rgba(148,163,184,.18), rgba(148,163,184,.3), rgba(148,163,184,.18)); background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
@media (max-width: 1200px) { .kpi-grid, .grid-2, .quick-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 760px) { .kpi-grid, .grid-2, .quick-grid { grid-template-columns: 1fr; } }
</style>
