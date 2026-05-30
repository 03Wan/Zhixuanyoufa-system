<template>
  <AppShell title="检测结果">
    <section class="page-stack fade-up">
      <section class="glass card result-list-card">
        <div class="row-between">
          <h2 class="section-title">检测结果中心</h2>
          <button class="btn btn-secondary" :disabled="loading.tasks" @click="loadTasks">刷新任务</button>
        </div>
        <div class="task-picker">
          <input class="input" v-model.trim="searchKeyword" placeholder="搜索任务编号/名称" />
        </div>
        <section v-if="loading.detect" class="state loading">
          <p style="margin:0 0 6px;font-weight:700;color:var(--text);">检测中</p>
          <p style="margin:0;">{{ detectStep }}</p>
        </section>
        <section v-if="loading.tasks" class="state loading">任务加载中</section>
        <section v-else-if="loading.detail && !showTaskList" class="state loading">结果加载中</section>
        <div class="table-wrap task-list-wrap" v-if="showTaskList && !loading.tasks && !loading.detail && filteredTasks.length">
          <table class="table">
            <thead>
              <tr>
                <th>任务编号</th>
                <th>商品名称</th>
                <th>平台</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="task in filteredTasks"
                :key="task.id"
              >
                <td>{{ task.taskNo || shortNo(task.id) }}</td>
                <td>{{ task.productName || '-' }}</td>
                <td>{{ task.platform || '-' }}</td>
                <td>
                  <span :class="['tag', resultReady(task.status) ? 'tag-success' : 'tag-warning']">
                    {{ statusLabel(task.status) }}
                  </span>
                </td>
                <td>
                  <div class="actions-row">
                    <button class="btn btn-secondary" @click="goTaskResult(task.id)">查看结果</button>
                    <button class="btn btn-secondary" @click="deleteTask(task.id)">删除任务</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="actions-row back-list-btn" v-if="!showTaskList && selectedTaskId">
          <button class="btn btn-secondary" @click="showTaskList = true">返回任务列表</button>
        </div>
        <div v-if="showTaskList && !loading.tasks && filteredTasks.length === 0" class="state">暂无可展示任务</div>
        <p v-if="error" class="error-text">{{ error }}</p>
      </section>

      <section v-if="selectedTaskId && noResult" class="glass card">
        <p class="warn-text">该任务尚未检测，请先执行检测。</p>
        <button class="btn btn-primary" :disabled="loading.detect" @click="reDetect">
          {{ loading.detect ? '检测中...' : '开始检测' }}
        </button>
      </section>

      <template v-if="selectedTaskId && taskMeta && result && !showTaskList">
        <section class="glass card">
          <h3>任务信息</h3>
          <div class="meta-grid">
            <div><span class="k">任务编号</span><strong>{{ taskMeta.taskNo || shortNo(taskMeta.id) }}</strong></div>
            <div><span class="k">商品名称</span><strong>{{ taskMeta.productName || '-' }}</strong></div>
            <div><span class="k">品类</span><strong>{{ taskMeta.category || '-' }}</strong></div>
            <div><span class="k">平台</span><strong>{{ taskMeta.platform || '-' }}</strong></div>
            <div><span class="k">市场</span><strong>{{ taskMeta.market || '-' }}</strong></div>
            <div><span class="k">目的</span><strong>{{ taskMeta.purpose || '-' }}</strong></div>
          </div>
        </section>

        <section class="glass card">
          <h3>审核结论总览</h3>
          <div class="summary-strip">
            <div class="summary-item">
              <p>最终决策</p>
              <strong :class="decisionTextClass(result.decision)">{{ result.decision || '-' }}</strong>
            </div>
            <div class="summary-item">
              <p>风险等级</p>
              <strong :class="riskTextClass(result.riskLevel)">{{ result.riskLevel || '-' }}</strong>
            </div>
            <div class="summary-item">
              <p>综合评分</p>
              <strong>{{ result.score ?? '-' }}</strong>
            </div>
            <div class="summary-item">
              <p>建议动作</p>
              <strong>{{ actionHint }}</strong>
            </div>
          </div>
          <p class="summary-explain" v-if="result.explanation">{{ result.explanation }}</p>
        </section>

        <section class="glass card">
          <div class="summary-grid">
            <article class="score-card">
              <p>综合分</p>
              <h1>{{ result.score }}</h1>
            </article>
            <article class="meta-card">
              <p>风险等级</p>
              <span :class="['tag', riskClass(result.riskLevel)]">{{ result.riskLevel }}</span>
            </article>
            <article class="meta-card">
              <p>发布决策</p>
              <span :class="['tag', decisionClass(result.decision)]">{{ result.decision }}</span>
            </article>
            <article class="meta-card">
              <p>检测时间</p>
              <strong>{{ formatTime(result.detectedAt) }}</strong>
            </article>
          </div>
        </section>

        <section class="glass card">
          <h3>维度分</h3>
          <div class="dimension-grid">
            <article class="dimension-card" v-for="item in dimensionItems" :key="item.key">
              <p>{{ item.label }}</p>
              <strong>{{ item.value }}</strong>
            </article>
          </div>
        </section>

        <details class="glass card detail-block">
          <summary>问题定位（点击收起/展开）</summary>
          <div class="detail-body">
            <div v-if="riskItems.length === 0" class="state">未命中风险项</div>
            <div v-else class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>风险类型</th>
                    <th>问题位置</th>
                    <th>命中规则</th>
                    <th>问题说明</th>
                    <th>优化建议</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, idx) in riskItems" :key="idx">
                    <td>{{ r.riskType }}</td>
                    <td>{{ r.position }}</td>
                    <td>{{ r.ruleName }}</td>
                    <td>{{ r.description }}</td>
                    <td>{{ r.suggestion }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <details class="glass card detail-block">
          <summary>解析结果（文本/图片）（点击收起/展开）</summary>
          <div class="detail-body">
            <div class="grid-2">
              <article class="parse-card">
                <h4>文本解析</h4>
                <p><strong>关键词：</strong>{{ (result.parseResult?.text?.keywords || []).join('、') || '-' }}</p>
                <p><strong>敏感词：</strong>{{ (result.parseResult?.text?.sensitiveWords || []).join('、') || '-' }}</p>
                <p><strong>承诺表达：</strong>{{ (result.parseResult?.text?.promiseExpressions || []).join('、') || '-' }}</p>
                <p><strong>语言：</strong>{{ result.parseResult?.text?.language || '-' }}</p>
              </article>
              <article class="parse-card">
                <h4>图片识别/OCR（模拟）</h4>
                <p><strong>主体元素：</strong>{{ (result.parseResult?.image?.objects || []).join('、') || '-' }}</p>
                <p><strong>主色：</strong>{{ (result.parseResult?.image?.colors || []).join('、') || '-' }}</p>
                <p><strong>OCR 文本：</strong>{{ (result.parseResult?.image?.ocrText || []).join('、') || '-' }}</p>
                <p><strong>识别风险：</strong>{{ (result.parseResult?.image?.risks || []).join('、') || '-' }}</p>
              </article>
            </div>
          </div>
        </details>

        <details class="glass card detail-block">
          <summary>优化建议（点击收起/展开）</summary>
          <div class="detail-body">
            <div v-if="suggestionItems.length === 0" class="state">暂无优化建议</div>
            <div v-else class="suggestion-list">
              <article v-for="(s, idx) in suggestionItems" :key="idx" class="sug-card">
                <p><strong>原内容：</strong>{{ s.before }}</p>
                <p><strong>建议内容：</strong>{{ s.after }}</p>
                <p><strong>修改理由：</strong>{{ s.reason }}</p>
              </article>
            </div>
          </div>
        </details>

        <details class="glass card detail-block">
          <summary>结构化改写结果（点击收起/展开）</summary>
          <div class="detail-body">
            <div class="suggestion-list">
              <article class="sug-card">
                <h4>标题优化（1-3 方案）</h4>
                <ul class="list-inline">
                  <li v-for="(item, idx) in (result.optimization?.titleVariants || [])" :key="`title-${idx}`">{{ item }}</li>
                </ul>
              </article>
              <article class="sug-card">
                <h4>卖点重组（前后对比）</h4>
                <p><strong>改写前：</strong>{{ formatAsLine(result.optimization?.sellingPointRewrite?.before) }}</p>
                <p><strong>改写后：</strong>{{ formatAsLine(result.optimization?.sellingPointRewrite?.after) }}</p>
              </article>
              <article class="sug-card">
                <h4>详情页结构建议</h4>
                <p><strong>缺失模块：</strong>{{ formatAsLine(result.optimization?.detailStructureAdvice?.missingModules) }}</p>
                <p><strong>补充建议：</strong>{{ formatAsLine(result.optimization?.detailStructureAdvice?.suggestions) }}</p>
              </article>
              <article class="sug-card">
                <h4>广告语多风格</h4>
                <ul class="list-inline">
                  <li v-for="(item, idx) in (result.optimization?.adCopyVariants || [])" :key="`ad-${idx}`">
                    【{{ item.style || '-' }}】{{ item.text || '-' }}
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </details>

        <section class="glass card">
          <div class="actions-row">
            <button class="btn btn-primary" :disabled="loading.report" @click="generateReport">
              {{ loading.report ? '生成中...' : '生成报告' }}
            </button>
            <button class="btn btn-secondary" :disabled="loading.review" @click="submitReview">
              {{ loading.review ? '提交中...' : '提交复核' }}
            </button>
            <button class="btn btn-secondary" :disabled="loading.detect" @click="reDetect">
              {{ loading.detect ? '检测中...' : '重新检测' }}
            </button>
            <button v-if="taskMeta?.report?.id" class="btn btn-secondary" @click="deleteReport(taskMeta.report.id)">删除报告</button>
            <button class="btn btn-secondary" @click="deleteTask(selectedTaskId)">删除任务</button>
            <button class="btn btn-secondary" @click="downloadSuggestion">下载建议</button>
          </div>
          <p v-if="tip" class="tip-text">{{ tip }}</p>
        </section>
      </template>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { confirmDialog, toast } from '@/lib/dialog';

const route = useRoute();
const router = useRouter();

const loading = reactive({ tasks: false, detail: false, detect: false, report: false, review: false });
const detectStep = ref('');
const error = ref('');
const tip = ref('');
const searchKeyword = ref('');
const tasks = ref<any[]>([]);
function getRouteTaskId() {
  return String((route.params.id as string) || (route.query.taskId as string) || '');
}

const selectedTaskId = ref<string>(getRouteTaskId());
const showTaskList = ref(!selectedTaskId.value);
const noResult = ref(false);
const taskMeta = ref<any>(null);
const result = ref<any>(null);

const filteredTasks = computed(() => {
  const kw = searchKeyword.value.toLowerCase();
  if (!kw) return tasks.value;
  return tasks.value.filter((t) => [t.taskNo, t.productName, shortNo(t.id)].some((v) => String(v || '').toLowerCase().includes(kw)));
});

const riskItems = computed(() => {
  const ruleItems = (result.value?.matchedRules || []).map((r: any) => ({
    riskType: r.riskLevel || '中风险',
    position: positionLabel(r.position),
    ruleName: r.name || '-',
    description: r.description || '-',
    suggestion: r.suggestion || '-',
  }));
  const issueItems = (result.value?.issues || []).map((i: any) => ({
    riskType: i.riskLevel || '中风险',
    position: positionLabel(i.position),
    ruleName: i.type || '规则命中',
    description: i.description || '-',
    suggestion: i.suggestion || '请按建议调整后复检',
  }));
  return [...ruleItems, ...issueItems];
});

const suggestionItems = computed(() => {
  return (result.value?.suggestions || []).map((s: any) => ({
    before: s.before || s.problem || '-',
    after: s.after || s.suggestion || '-',
    reason: s.reason || '降低风险并提升可读性',
  }));
});

const dimensionItems = computed(() => {
  const ds = result.value?.dimensionScores || {};
  return [
    { key: 'completeness', label: '完整性', value: ds.completeness ?? '-' },
    { key: 'accuracy', label: '准确性', value: ds.accuracy ?? '-' },
    { key: 'compliance', label: '规范性', value: ds.compliance ?? '-' },
    { key: 'attractiveness', label: '吸引力', value: ds.attractiveness ?? '-' },
    { key: 'localization', label: '市场适配', value: ds.localization ?? '-' },
  ];
});
const actionHint = computed(() => {
  const decision = String(result.value?.decision || '');
  if (decision.includes('可发布')) return '可直接发布';
  if (decision.includes('优化')) return '先优化再发布';
  if (decision.includes('复核')) return '提交人工复核';
  if (decision.includes('暂缓')) return '暂停发布并整改';
  return '-';
});

function shortNo(id: string) {
  return `TSK-${String(id || '').slice(-6).toUpperCase()}`;
}
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
function riskClass(level?: string) {
  const v = String(level || '');
  if (v.includes('高')) return 'tag-danger';
  if (v.includes('中')) return 'tag-warning';
  return 'tag-success';
}
function decisionClass(decision?: string) {
  const v = String(decision || '');
  if (v.includes('暂缓')) return 'tag-danger';
  if (v.includes('复核') || v.includes('优化')) return 'tag-warning';
  return 'tag-success';
}
function decisionTextClass(v?: string) {
  const t = String(v || '');
  if (t.includes('暂缓')) return 'text-danger';
  if (t.includes('复核') || t.includes('优化')) return 'text-warning';
  return 'text-success';
}
function riskTextClass(v?: string) {
  const t = String(v || '');
  if (t.includes('严重') || t.includes('高')) return 'text-danger';
  if (t.includes('中')) return 'text-warning';
  return 'text-success';
}
function positionLabel(pos?: string) {
  const map: Record<string, string> = {
    title: '商品标题',
    sellingPoints: '核心卖点',
    detailText: '详情文案',
    adText: '广告语',
    imageUrls: '图片素材',
  };
  return map[String(pos || '')] || pos || '-';
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    DRAFT: '草稿',
    PENDING_DETECTION: '待检测',
    DETECTING: '检测中',
    COMPLETED: '已完成',
    REPORTED: '已出报告',
    REVIEW_REQUIRED: '待复核',
    HOLD: '暂缓发布',
  };
  return map[String(status || '').toUpperCase()] || status || '-';
}

function resultReady(status?: string) {
  const s = String(status || '').toUpperCase();
  return ['COMPLETED', 'REPORTED', 'REVIEW_REQUIRED'].includes(s);
}

function goTaskResult(taskId: string) {
  showTaskList.value = false;
  const query = route.query.embed === '1'
    ? { embed: '1', theme: String(route.query.theme || '') || undefined }
    : undefined;
  router.push({ path: `/tasks/${taskId}/result`, query });
}

function formatAsLine(value: unknown) {
  if (Array.isArray(value)) return value.join('；');
  if (value == null) return '-';
  return String(value);
}

function normalizeResult(raw: any) {
  if (!raw) return null;
  const score = Number(raw.score ?? raw.totalScore ?? 0);
  return {
    ...raw,
    score,
    totalScore: Number(raw.totalScore ?? score),
    detectedAt: raw.detectedAt || raw.updatedAt || raw.createdAt || new Date().toISOString(),
    dimensionScores: {
      completeness: raw.dimensionScores?.completeness ?? raw.completenessScore ?? 0,
      accuracy: raw.dimensionScores?.accuracy ?? raw.accuracyScore ?? 0,
      compliance: raw.dimensionScores?.compliance ?? raw.complianceScore ?? 0,
      attractiveness: raw.dimensionScores?.attractiveness ?? raw.attractivenessScore ?? 0,
      localization: raw.dimensionScores?.localization ?? raw.localizationScore ?? 0,
    },
    riskLevel: raw.riskLevel || '-',
    decision: raw.decision || '-',
    issues: Array.isArray(raw.issues) ? raw.issues : [],
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
    matchedRules: Array.isArray(raw.matchedRules) ? raw.matchedRules : [],
  };
}

async function loadTasks() {
  loading.tasks = true;
  error.value = '';
  try {
    tasks.value = await api.getTaskList();
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.tasks = false;
  }
}

async function loadResult(taskId: string) {
  tip.value = '';
  error.value = '';
  noResult.value = false;
  result.value = null;
  taskMeta.value = null;
  if (!taskId) return;
  loading.detail = true;
  try {
    const [detail, list] = await Promise.all([api.getTaskDetail(taskId), tasks.value.length ? Promise.resolve(tasks.value) : api.getTaskList()]);
    taskMeta.value = detail;
    if (!tasks.value.length) tasks.value = list as any[];
    const taskRow = tasks.value.find((t) => t.id === taskId);
    const status = String(taskRow?.status || detail?.status || '').toUpperCase();
    if (!['COMPLETED', 'REPORTED', 'REVIEW_REQUIRED'].includes(status)) {
      noResult.value = true;
      return;
    }
    result.value = normalizeResult(await api.getDetectionResult(taskId));
  } catch (e) {
    noResult.value = true;
    error.value = getFriendlyError(e);
  } finally {
    loading.detail = false;
  }
}

async function reDetect() {
  if (!selectedTaskId.value) return;
  loading.detect = true;
  const startedAt = Date.now();
  error.value = '';
  tip.value = '';
  try {
    detectStep.value = '准备检测任务...';
    await new Promise((r) => setTimeout(r, 700));
    detectStep.value = '分析文本与图片素材...';
    await api.analyzeTask(selectedTaskId.value);
    detectStep.value = '生成风险评估与优化建议...';
    const elapsed = Date.now() - startedAt;
    if (elapsed < 2600) {
      await new Promise((r) => setTimeout(r, 2600 - elapsed));
    }
    await api.updateTaskStatus(selectedTaskId.value, 'COMPLETED');
    tip.value = '已完成重新检测。';
    await loadTasks();
    await loadResult(selectedTaskId.value);
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    detectStep.value = '';
    loading.detect = false;
  }
}

async function generateReport() {
  if (!selectedTaskId.value) return;
  loading.report = true;
  error.value = '';
  tip.value = '';
  try {
    const report = (await api.generateReport(selectedTaskId.value)) as any;
    tip.value = '报告已生成。';
    if (report?.id) {
      const query = route.query.embed === '1' ? { embed: '1', theme: String(route.query.theme || '') || undefined } : undefined;
      router.push({ path: `/reports/${report.id}`, query });
    }
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.report = false;
  }
}

async function submitReview() {
  if (!selectedTaskId.value) return;
  loading.review = true;
  error.value = '';
  tip.value = '';
  try {
    await api.requestManualReview(selectedTaskId.value, '检测结果页提交人工复核');
    await api.updateTaskStatus(selectedTaskId.value, 'REVIEW_REQUIRED');
    tip.value = '已提交人工复核。';
    await loadTasks();
    await loadResult(selectedTaskId.value);
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.review = false;
  }
}

async function deleteTask(taskId?: string) {
  if (!taskId) return;
  if (!(await confirmDialog('确认删除该检测任务及关联结果/报告吗？'))) return;
  try {
    await api.deleteTask(taskId);
    tip.value = '任务已删除';
    toast('任务已删除', 'success');
    if (selectedTaskId.value === taskId) {
      selectedTaskId.value = '';
      showTaskList.value = true;
      result.value = null;
      taskMeta.value = null;
      noResult.value = false;
      const query = route.query.embed === '1' ? { embed: '1', theme: String(route.query.theme || '') || undefined } : undefined;
      router.replace({ path: '/results', query });
    }
    await loadTasks();
  } catch (e) {
    error.value = getFriendlyError(e);
  }
}

async function deleteReport(reportId: string) {
  if (!reportId) return;
  if (!(await confirmDialog('确认删除该报告吗？'))) return;
  try {
    await api.deleteReport(reportId);
    if (taskMeta.value?.report) taskMeta.value.report = null;
    tip.value = '报告已删除';
    toast('报告已删除', 'success');
    await loadTasks();
  } catch (e) {
    error.value = getFriendlyError(e);
  }
}

function downloadSuggestion() {
  if (!result.value) return;
  const lines = [
    `任务：${taskMeta.value?.productName || '-'}`,
    `综合分：${result.value?.score ?? '-'}`,
    `风险等级：${result.value?.riskLevel || '-'}`,
    `发布决策：${result.value?.decision || '-'}`,
    '',
    '优化建议：',
    ...suggestionItems.value.map((s: { before: string; after: string; reason: string }, idx: number) => `${idx + 1}. 原内容：${s.before}\n   建议内容：${s.after}\n   修改理由：${s.reason}`),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `检测建议-${taskMeta.value?.taskNo || shortNo(selectedTaskId.value)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

watch(selectedTaskId, async (id) => {
  if (id) showTaskList.value = false;
  const query: Record<string, string> = {};
  if (route.query.embed === '1') {
    query.embed = '1';
    if (route.query.theme) query.theme = String(route.query.theme);
  }
  if (route.path !== `/tasks/${id}/result`) {
    router.replace({ path: `/tasks/${id}/result`, query });
  }
  await loadResult(id);
});

watch(
  () => route.fullPath,
  async () => {
    const id = getRouteTaskId();
    if (!id || id === selectedTaskId.value) return;
    selectedTaskId.value = id;
    await loadResult(id);
  },
);

onMounted(async () => {
  await loadTasks();
  if (selectedTaskId.value) await loadResult(selectedTaskId.value);
});
</script>

<style scoped>
.task-picker { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; margin-top: 10px; }
.result-list-card { min-height: 0; }
.task-list-wrap { margin-top: 10px; max-height: none; }
.meta-grid { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.meta-grid > div { border: 1px solid var(--border); border-radius: 10px; padding: 10px; background: var(--card-strong); display: grid; gap: 6px; }
.meta-grid .k { color: var(--muted); font-size: 12px; }
.summary-grid { display: grid; gap: 10px; grid-template-columns: 2fr 1fr 1fr 1fr; }
.summary-strip { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 10px; }
.summary-item { border: 1px solid var(--border); border-radius: 10px; padding: 12px; background: var(--card-strong); }
.summary-item p { margin: 0; color: var(--muted); }
.summary-item strong { display: inline-block; margin-top: 6px; font-size: 22px; }
.summary-explain { margin: 10px 0 0; color: var(--muted); line-height: 1.7; }
.text-success { color: #047857; }
.text-warning { color: #b45309; }
.text-danger { color: #b91c1c; }
.score-card, .meta-card { border: 1px solid var(--border); border-radius: 12px; padding: 12px; background: var(--card-strong); }
.score-card h1 { margin: 6px 0 0; font-size: 48px; color: var(--brand-1); }
.dimension-grid { display: grid; gap: 10px; grid-template-columns: repeat(5, minmax(0, 1fr)); }
.dimension-card { border: 1px solid var(--border); border-radius: 10px; background: var(--card-strong); padding: 10px; }
.dimension-card p { margin: 0; color: var(--muted); }
.dimension-card strong { display: inline-block; margin-top: 6px; font-size: 20px; }
.table-wrap { overflow: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid var(--border); padding: 10px 8px; text-align: left; vertical-align: top; }
.table th { color: var(--muted); font-weight: 600; }
.parse-card { border: 1px solid var(--border); border-radius: 10px; background: var(--card-strong); padding: 10px; }
.parse-card h4 { margin: 0 0 8px; }
.parse-card p { margin: 6px 0 0; }
.suggestion-list { display: grid; gap: 10px; }
.sug-card { border: 1px solid var(--border); border-radius: 10px; background: var(--card-strong); padding: 10px; }
.list-inline { margin: 6px 0 0; padding-left: 18px; }
.actions-row { display: flex; gap: 10px; flex-wrap: wrap; }
.tag { display: inline-flex; align-items: center; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 700; border: 1px solid transparent; }
.tag-success { background: rgba(16, 185, 129, .12); color: #047857; border-color: rgba(16, 185, 129, .28); }
.tag-warning { background: rgba(245, 158, 11, .12); color: #b45309; border-color: rgba(245, 158, 11, .28); }
.tag-danger { background: rgba(239, 68, 68, .12); color: #b91c1c; border-color: rgba(239, 68, 68, .28); }
.state { border: 1px dashed var(--border); border-radius: 10px; padding: 14px; color: var(--muted); background: var(--card-strong); }
.warn-text { margin: 0 0 10px; color: #b45309; }
.error-text { color: #ef4444; margin: 8px 0 0; }
.tip-text { margin: 8px 0 0; color: var(--brand-1); }
.detail-block summary { cursor: pointer; font-weight: 700; color: var(--brand-1); }
.detail-body { margin-top: 12px; }
.back-list-btn { margin-top: 8px; }
@media (max-width: 1100px) {
  .task-picker, .meta-grid, .summary-grid, .summary-strip, .dimension-grid { grid-template-columns: 1fr; }
}
</style>
