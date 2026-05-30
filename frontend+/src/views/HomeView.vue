<template>
  <AppShell title="首页">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card home-card">
        <div class="row-between">
          <h2 class="section-title">首页工作台</h2>
          <button class="btn btn-secondary" :disabled="loading" @click="loadAll">刷新首页数据</button>
        </div>
        <div v-if="loading" class="state loading">加载中</div>
        <div v-else-if="error" class="state error">{{ error }}</div>
        <template v-else>
          <div class="kpi-grid">
            <AppGlassSurface as="article" class="card kpi-card"><p>今日检测任务数</p><h3>{{ dashboard.metrics.todayTaskCount }}</h3></AppGlassSurface>
            <AppGlassSurface as="article" class="card kpi-card"><p>待复核任务数</p><h3>{{ dashboard.metrics.pendingReviewCount }}</h3></AppGlassSurface>
            <AppGlassSurface as="article" class="card kpi-card"><p>高风险素材数</p><h3>{{ dashboard.metrics.highRiskCount }}</h3></AppGlassSurface>
            <AppGlassSurface as="article" class="card kpi-card"><p>已生成报告数</p><h3>{{ dashboard.metrics.reportCount }}</h3></AppGlassSurface>
          </div>

          <AppGlassSurface as="section" class="card panel">
            <div class="row-between">
              <h3>套餐与额度</h3>
              <button class="btn btn-secondary" @click="goMyPlan">我的套餐</button>
            </div>
            <div class="kpi-grid">
              <AppGlassSurface as="article" class="card kpi-card"><p>当前套餐</p><h3>{{ usageInfo.subscription?.plan?.name || '-' }}</h3></AppGlassSurface>
              <AppGlassSurface as="article" class="card kpi-card"><p>本月已检测</p><h3>{{ usageInfo.monthlyUsed ?? 0 }}</h3></AppGlassSurface>
              <AppGlassSurface as="article" class="card kpi-card"><p>剩余检测次数</p><h3>{{ usageInfo.quotaRemaining ?? 0 }}</h3></AppGlassSurface>
              <AppGlassSurface as="article" class="card kpi-card"><p>报告导出权限</p><h3>{{ usageInfo.privileges?.canExportReport ? '支持' : '受限' }}</h3></AppGlassSurface>
              <AppGlassSurface as="article" class="card kpi-card"><p>批量检测</p><h3>{{ usageInfo.privileges?.canBatchDetect ? '支持' : '受限' }}</h3></AppGlassSurface>
              <AppGlassSurface as="article" class="card kpi-card"><p>API接口状态</p><h3>{{ usageInfo.privileges?.canUseApi ? '试点可申请' : '未开通' }}</h3></AppGlassSurface>
            </div>
            <p class="text-muted" style="margin-top:8px;">企业版/定制版能力（批量检测、API接口、私有化部署）当前为商业化阶段规划，可提交试点申请。</p>
          </AppGlassSurface>

          <AppGlassSurface as="section" class="card panel">
            <div class="row-between">
              <h3>风险提醒</h3>
              <span class="text-muted">最近高风险任务</span>
            </div>
            <div v-if="dashboard.highRiskTasks.length === 0" class="state">暂无高风险任务</div>
            <div v-else class="table-wrap">
              <table class="table">
                <thead><tr><th>任务名称</th><th>平台</th><th>风险等级</th><th>决策</th><th>操作</th></tr></thead>
                <tbody>
                  <tr v-for="task in dashboard.highRiskTasks.slice(0, 1)" :key="task.id">
                    <td>{{ task.productName }}</td>
                    <td>{{ task.platform }}</td>
                    <td><span :class="['tag', riskClass(task.riskLevel)]">{{ task.riskLevel }}</span></td>
                    <td>{{ task.decision }}</td>
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
              <div v-if="tasks.length === 0" class="state">暂无任务</div>
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
              <div v-if="reports.length === 0" class="state">暂无报告</div>
              <div v-else class="table-wrap">
                <table class="table">
                  <thead><tr><th>报告编号</th><th>任务名称</th><th>评分</th><th>风险</th><th>操作</th></tr></thead>
                  <tbody>
                    <tr v-for="r in reports.slice(0, 2)" :key="r.id">
                      <td>{{ r.reportNo || "-" }}</td>
                      <td>{{ r.task?.productName || r.title || "-" }}</td>
                      <td>{{ r.result?.score ?? "-" }}</td>
                      <td><span :class="['tag', riskClass(r.result?.riskLevel)]">{{ r.result?.riskLevel || "-" }}</span></td>
                      <td class="op-row">
                        <button class="btn btn-secondary" @click="goReportDetail(r.id)">查看</button>
                      </td>
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
        </template>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "@/layouts/AppShell.vue";
import { api, getFriendlyError } from "@/lib/api";

const router = useRouter();
const loading = ref(false);
const error = ref("");
const dashboard = ref<any>({
  metrics: { todayTaskCount: 0, pendingReviewCount: 0, highRiskCount: 0, reportCount: 0 },
  highRiskTasks: [],
});
const tasks = ref<any[]>([]);
const reports = ref<any[]>([]);
const usageInfo = ref<any>({ privileges: {} });

function shortNo(id: string) {
  return `TSK-${String(id || "").slice(-6).toUpperCase()}`;
}
function formatTime(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`;
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

function goTasks() { router.push("/tasks/new"); }
function goResults() { router.push("/results"); }
function goReports() { router.push("/reports"); }
function goRules() { router.push("/rules"); }
function goMyPlan() { router.push("/my-plan"); }
function goResult(id: string) { router.push(`/results?taskId=${encodeURIComponent(id)}`); }
function goTaskDetail(id: string) { router.push(`/tasks/${id}`); }
function goReportDetail(id: string) { router.push(`/reports/${id}`); }

async function quickReport(taskId: string) {
  try {
    await api.generateReport(taskId);
    reports.value = await api.getReportList();
  } catch (e) {
    error.value = getFriendlyError(e);
  }
}
async function downloadReport(id: string) {
  try {
    await api.downloadReport(id);
  } catch (e) {
    error.value = getFriendlyError(e);
  }
}

async function loadAll() {
  loading.value = true;
  error.value = "";
  try {
    const [d, t, r, u] = await Promise.all([api.getDashboardData(), api.getTaskList(), api.getReportList(), api.getSubscriptionUsage()]);
    dashboard.value = d;
    tasks.value = t;
    reports.value = r;
    usageInfo.value = u;
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
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
@media (max-width: 1200px) { .kpi-grid, .grid-2, .quick-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 760px) { .kpi-grid, .grid-2, .quick-grid { grid-template-columns: 1fr; } }
</style>
