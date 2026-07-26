<template>
  <AppShell title="数据看板">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card">
        <div class="row-between">
          <h2 class="section-title">数据分析看板</h2>
          <button class="btn btn-secondary" :disabled="refreshing" @click="loadData(true)">
            {{ refreshing ? "刷新中" : "刷新看板" }}
          </button>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" v-if="error && !hasData" class="card state error">{{ error }}</AppGlassSurface>

      <template v-else>
        <div class="grid-4">
          <AppGlassSurface as="article" class="card kpi"><p>今日检测任务</p><h3>{{ dashboard.metrics?.todayTaskCount || 0 }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>待人工复核</p><h3>{{ dashboard.metrics?.pendingReviewCount || 0 }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>高风险素材</p><h3>{{ dashboard.metrics?.highRiskCount || 0 }}</h3></AppGlassSurface>
          <AppGlassSurface as="article" class="card kpi"><p>首发通过率</p><h3>{{ dashboard.metrics?.firstPassRate || 0 }}%</h3></AppGlassSurface>
        </div>

        <div v-if="refreshing" class="state">后台同步中</div>
        <AppGlassSurface as="section" v-if="error && hasData" class="card state error">{{ error }}</AppGlassSurface>

        <div class="charts-grid">
          <AppGlassSurface as="section" class="card chart-card"><h3>近 7 天检测趋势</h3><div ref="trendRef" class="chart"></div></AppGlassSurface>
          <AppGlassSurface as="section" class="card chart-card"><h3>风险等级分布</h3><div ref="riskRef" class="chart"></div></AppGlassSurface>
          <AppGlassSurface as="section" class="card chart-card"><h3>平台风险数量</h3><div ref="platformRef" class="chart"></div></AppGlassSurface>
          <AppGlassSurface as="section" class="card chart-card"><h3>高频风险类型 Top5</h3><div ref="topRiskRef" class="chart"></div></AppGlassSurface>
        </div>
      </template>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { ECharts, ComposeOption } from "echarts/core";
import type { LineSeriesOption, BarSeriesOption, PieSeriesOption } from "echarts/charts";
import type { GridComponentOption, TooltipComponentOption, LegendComponentOption } from "echarts/components";
import AppShell from "@/layouts/AppShell.vue";
import { api, getFriendlyError } from "@/lib/api";
import { readViewCache, writeViewCache } from "@/lib/view-cache";

type ECOption = ComposeOption<LineSeriesOption | BarSeriesOption | PieSeriesOption | GridComponentOption | TooltipComponentOption | LegendComponentOption>;

const error = ref("");
const tasks = ref<any[]>([]);
const reports = ref<any[]>([]);
const dashboard = ref<any>({ metrics: {}, highRiskTasks: [] });
const refreshing = ref(false);
const trendRef = ref<HTMLDivElement | null>(null);
const riskRef = ref<HTMLDivElement | null>(null);
const platformRef = ref<HTMLDivElement | null>(null);
const topRiskRef = ref<HTMLDivElement | null>(null);
const hasData = computed(() => tasks.value.length > 0 || reports.value.length > 0 || Object.keys(dashboard.value.metrics || {}).length > 0);
const DASHBOARD_CACHE_KEY = "view-cache:dashboard";
let ec: any = null;
let trendChart: ECharts | null = null;
let riskChart: ECharts | null = null;
let platformChart: ECharts | null = null;
let topRiskChart: ECharts | null = null;

function riskLabel(task: any) {
  const value = String(task?.detectionResult?.riskLevel || task?.riskLevel || "");
  if (value.includes("高") || value.toUpperCase() === "HIGH") return "高风险";
  if (value.includes("中") || value.toUpperCase() === "MEDIUM") return "中风险";
  if (value.includes("严重")) return "严重风险";
  return value || "低风险";
}

function initChart(el: HTMLDivElement | null, current: ECharts | null) {
  if (!el || !ec) return null;
  current?.dispose();
  return ec.init(el);
}

const trendData = computed(() => {
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: d.toISOString().slice(0, 10), label: `${d.getMonth() + 1}/${d.getDate()}`, count: 0 };
  });
  for (const task of tasks.value) {
    const row = days.find((d) => d.key === String(task.createdAt || "").slice(0, 10));
    if (row) row.count += 1;
  }
  return days;
});

const riskDistribution = computed(() => {
  const map: Record<string, number> = { 高风险: 0, 中风险: 0, 低风险: 0 };
  for (const task of tasks.value) map[riskLabel(task)] = (map[riskLabel(task)] || 0) + 1;
  return Object.entries(map).map(([name, value]) => ({ name, value }));
});

const platformBars = computed(() => {
  const map = new Map<string, number>();
  for (const task of tasks.value) {
    if (riskLabel(task) === "低风险") continue;
    const key = task.platform || "未知平台";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
});

const topRiskTypes = computed(() => {
  const map = new Map<string, number>();
  for (const report of reports.value) {
    for (const rule of report?.result?.matchedRules || []) {
      const key = rule.type || rule.name || "合规风险";
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
});

function renderCharts() {
  if (!ec || !hasData.value) return;
  trendChart = initChart(trendRef.value, trendChart);
  riskChart = initChart(riskRef.value, riskChart);
  platformChart = initChart(platformRef.value, platformChart);
  topRiskChart = initChart(topRiskRef.value, topRiskChart);
  trendChart?.setOption({ tooltip: { trigger: "axis" }, grid: { left: 36, right: 18, top: 24, bottom: 30 }, xAxis: { type: "category", data: trendData.value.map((d) => d.label) }, yAxis: { type: "value", minInterval: 1 }, series: [{ type: "line", smooth: true, areaStyle: {}, data: trendData.value.map((d) => d.count), lineStyle: { width: 3 }, color: "#2563eb" }] } as ECOption);
  riskChart?.setOption({ tooltip: { trigger: "item" }, legend: { bottom: 0 }, series: [{ type: "pie", radius: ["45%", "70%"], itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 }, data: riskDistribution.value, color: ["#ef4444", "#f59e0b", "#10b981"] }] } as ECOption);
  platformChart?.setOption({ tooltip: { trigger: "axis" }, grid: { left: 36, right: 18, top: 24, bottom: 36 }, xAxis: { type: "category", data: platformBars.value.map((d) => d.name), axisLabel: { interval: 0, rotate: 20 } }, yAxis: { type: "value", minInterval: 1 }, series: [{ type: "bar", data: platformBars.value.map((d) => d.value), itemStyle: { borderRadius: [8, 8, 0, 0] }, color: "#2bb8ff" }] } as ECOption);
  topRiskChart?.setOption({ tooltip: { trigger: "axis" }, grid: { left: 90, right: 18, top: 24, bottom: 24 }, xAxis: { type: "value", minInterval: 1 }, yAxis: { type: "category", data: topRiskTypes.value.map((d) => d.name) }, series: [{ type: "bar", data: topRiskTypes.value.map((d) => d.value), itemStyle: { borderRadius: [0, 8, 8, 0] }, color: "#f59e0b" }] } as ECOption);
}

function resizeCharts() {
  trendChart?.resize();
  riskChart?.resize();
  platformChart?.resize();
  topRiskChart?.resize();
}

function applyCachedDashboard() {
  const cached = readViewCache<any>(DASHBOARD_CACHE_KEY);
  if (!cached) return false;
  tasks.value = cached.tasks || [];
  reports.value = cached.reports || [];
  dashboard.value = cached.dashboard || { metrics: {}, highRiskTasks: [] };
  return true;
}

function persistDashboard() {
  writeViewCache(DASHBOARD_CACHE_KEY, {
    tasks: tasks.value,
    reports: reports.value,
    dashboard: dashboard.value,
  }, 45_000);
}

async function loadData(showBusy = false) {
  refreshing.value = showBusy || !hasData.value;
  error.value = "";
  try {
    const [taskList, reportList, dash] = await Promise.all([api.getTaskList(), api.getReportList(), api.getDashboardData()]);
    tasks.value = taskList || [];
    reports.value = reportList || [];
    dashboard.value = dash || { metrics: {}, highRiskTasks: [] };
    persistDashboard();
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    refreshing.value = false;
    await nextTick();
    renderCharts();
    setTimeout(resizeCharts, 60);
  }
}

watch([trendData, riskDistribution, platformBars, topRiskTypes], () => renderCharts());

onMounted(async () => {
  const [{ use }, charts, comps, renderers, echartsCore] = await Promise.all([
    import("echarts/core"),
    import("echarts/charts"),
    import("echarts/components"),
    import("echarts/renderers"),
    import("echarts/core"),
  ]);
  use([charts.LineChart, charts.BarChart, charts.PieChart, comps.TooltipComponent, comps.LegendComponent, comps.GridComponent, renderers.CanvasRenderer]);
  ec = echartsCore;
  applyCachedDashboard();
  await nextTick();
  renderCharts();
  void loadData(false);
  window.addEventListener("resize", resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCharts);
  trendChart?.dispose();
  riskChart?.dispose();
  platformChart?.dispose();
  topRiskChart?.dispose();
});
</script>

<style scoped>
.grid-4 { display: grid; gap: 12px; grid-template-columns: repeat(4, 1fr); }
.kpi { padding: 12px; }
.kpi p { margin: 0; color: var(--muted); }
.kpi h3 { margin: 8px 0 0; font-size: 34px; }
.charts-grid { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
.chart-card h3 { margin-top: 0; }
.chart { height: 320px; width: 100%; }
.state { margin-top: 8px; }
@media (max-width: 1100px) { .charts-grid, .grid-4 { grid-template-columns: 1fr 1fr; } }
@media (max-width: 760px) { .charts-grid, .grid-4 { grid-template-columns: 1fr; } }
</style>
