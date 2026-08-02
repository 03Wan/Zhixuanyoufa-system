<template>
  <main class="report-page fade-up" id="report-print-area">
    <AppGlassSurface as="section" class="card no-print">
      <button class="btn btn-secondary" @click="goBack">返回</button>
    </AppGlassSurface>
    <AppGlassSurface as="section" v-if="loading" class="card state loading">报告加载中</AppGlassSurface>
    <AppGlassSurface as="section" v-else-if="error" class="card state error">{{ error }}</AppGlassSurface>

    <template v-else-if="report">
      <AppGlassSurface as="header" class="card report-cover">
        <div>
          <h1>智选优发审核报告</h1>
          <p>系统名称：智选优发——商品素材评估与发布决策辅助系统</p>
        </div>
        <div class="cover-meta">
          <p><strong>报告编号：</strong>{{ report.reportNo || '-' }}</p>
          <p><strong>报告标题：</strong>{{ report.title || '-' }}</p>
          <p><strong>生成时间：</strong>{{ formatTime(report.createdAt) }}</p>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card report-section">
        <h2>审核结论总览</h2>
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
            <strong>{{ scoreValue }}</strong>
          </div>
          <div class="summary-item">
            <p>建议动作</p>
            <strong>{{ actionHint }}</strong>
          </div>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card report-section">
        <h2>任务基本信息</h2>
        <div class="kv-grid">
          <p><strong>商品名称：</strong>{{ report.task?.productName || '-' }}</p>
          <p><strong>SKU：</strong>{{ report.task?.sku || '-' }}</p>
          <p><strong>平台：</strong>{{ report.task?.platform || '-' }}</p>
          <p><strong>市场：</strong>{{ report.task?.market || '-' }}</p>
          <p><strong>品类：</strong>{{ report.task?.category || '-' }}</p>
          <p><strong>任务编号：</strong>{{ report.task?.taskNo || shortNo(report.task?.id || report.taskId) }}</p>
          <p><strong>素材数量：</strong>{{ report.materialCount ?? report.fileAssets?.length ?? 0 }}</p>
          <p><strong>人工复核：</strong>{{ report.hasManualReview ? '已复核' : '未复核' }}</p>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card report-section">
        <h2>商业化阶段说明</h2>
        <p>报告内容来自当前真实检测记录；Pro 与 Enterprise 可继续扩展客户归档、专属模板和接口返回能力。</p>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card report-section">
        <h2>综合检测结论</h2>
        <div class="result-grid">
          <article class="result-card">
            <p>综合评分</p>
            <h3>{{ scoreValue }}</h3>
          </article>
          <article class="result-card">
            <p>风险等级</p>
            <span :class="['tag', riskClass(result.riskLevel)]">{{ result.riskLevel || '-' }}</span>
          </article>
          <article class="result-card">
            <p>发布决策</p>
            <span :class="['tag', decisionClass(result.decision)]">{{ result.decision || '-' }}</span>
          </article>
          <article class="result-card result-summary">
            <p>结论摘要</p>
            <p>{{ report.summary || result.explanation || '-' }}</p>
          </article>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="details" class="card report-section detail-block" open>
        <summary>维度评分明细（点击收起/展开）</summary>
        <div class="detail-body">
          <div class="dimension-grid">
            <article class="dimension-card" v-for="item in dimensionItems" :key="item.key">
              <p>{{ item.label }}</p>
              <strong>{{ item.value }}</strong>
              <small>{{ item.tip }}</small>
            </article>
          </div>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="details" class="card report-section detail-block">
        <summary>命中问题明细（点击收起/展开）</summary>
        <div class="detail-body">
          <div v-if="issueRows.length === 0" class="state">未命中明显风险项</div>
          <div v-else class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>风险等级</th>
                  <th>问题位置</th>
                  <th>风险类型</th>
                  <th>命中内容/规则</th>
                  <th>问题说明</th>
                  <th>处理建议</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in issueRows" :key="idx">
                  <td><span :class="['tag', riskClass(row.riskLevel)]">{{ row.riskLevel }}</span></td>
                  <td>{{ row.position }}</td>
                  <td>{{ row.type }}</td>
                  <td>{{ row.hit }}</td>
                  <td>{{ row.description }}</td>
                  <td>{{ row.suggestion }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="details" class="card report-section detail-block">
        <summary>优化建议与改写方案（点击收起/展开）</summary>
        <div class="detail-body">
          <div v-if="suggestionRows.length === 0" class="state">暂无优化建议</div>
          <div v-else class="suggestion-list">
            <article class="sug-card" v-for="(s, idx) in suggestionRows" :key="idx">
              <p><strong>问题：</strong>{{ s.problem }}</p>
              <p><strong>建议：</strong>{{ s.suggestion }}</p>
              <p v-if="s.recommendedText"><strong>推荐改写：</strong>{{ s.recommendedText }}</p>
            </article>
          </div>

          <div class="optimization-block" v-if="hasOptimization">
            <h3>结构化优化结果</h3>
            <div class="suggestion-list">
              <article class="sug-card">
                <h4>标题优化（1-3方案）</h4>
                <ul>
                  <li v-for="(item, idx) in (result.optimization?.titleVariants || [])" :key="`title-${idx}`">{{ item }}</li>
                </ul>
              </article>
              <article class="sug-card">
                <h4>卖点重组（前后对比）</h4>
                <p><strong>改写前：</strong>{{ toLine(result.optimization?.sellingPointRewrite?.before) }}</p>
                <p><strong>改写后：</strong>{{ toLine(result.optimization?.sellingPointRewrite?.after) }}</p>
              </article>
              <article class="sug-card">
                <h4>详情页结构补全</h4>
                <p><strong>缺失模块：</strong>{{ toLine(result.optimization?.detailStructureAdvice?.missingModules) }}</p>
                <p><strong>补充建议：</strong>{{ toLine(result.optimization?.detailStructureAdvice?.suggestions) }}</p>
              </article>
              <article class="sug-card">
                <h4>广告语多风格</h4>
                <ul>
                  <li v-for="(item, idx) in (result.optimization?.adCopyVariants || [])" :key="`ad-${idx}`">【{{ item.style || '-' }}】{{ item.text || '-' }}</li>
                </ul>
              </article>
            </div>
          </div>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="details" class="card report-section detail-block">
        <summary>解析证据（文本/图片）（点击收起/展开）</summary>
        <div class="detail-body">
          <div class="parse-grid">
            <article class="parse-card">
              <h4>文本解析</h4>
              <p><strong>关键词：</strong>{{ toLine(result.parseResult?.text?.keywords) }}</p>
              <p><strong>敏感词：</strong>{{ toLine(result.parseResult?.text?.sensitiveWords) }}</p>
              <p><strong>承诺表达：</strong>{{ toLine(result.parseResult?.text?.promiseExpressions) }}</p>
              <p><strong>语言：</strong>{{ result.parseResult?.text?.language || '-' }}</p>
            </article>
            <article class="parse-card">
              <h4>图片识别（模拟）</h4>
              <p><strong>主体元素：</strong>{{ toLine(result.parseResult?.image?.objects) }}</p>
              <p><strong>主色：</strong>{{ toLine(result.parseResult?.image?.colors) }}</p>
              <p><strong>OCR文本：</strong>{{ toLine(result.parseResult?.image?.ocrText) }}</p>
              <p><strong>识别风险：</strong>{{ toLine(result.parseResult?.image?.risks) }}</p>
            </article>
          </div>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="details" class="card report-section detail-block">
        <summary>处理记录时间线（点击收起/展开）</summary>
        <div class="detail-body">
          <div v-if="timelineRows.length === 0" class="state">暂无处理记录</div>
          <ul v-else class="timeline">
            <li v-for="(item, idx) in timelineRows" :key="idx">
              <div class="timeline-dot"></div>
              <div>
                <p class="timeline-title">{{ item.action }}</p>
                <p class="timeline-meta">{{ formatTime(item.time) }} · {{ item.operator || '系统' }}</p>
                <p class="timeline-desc" v-if="item.note">{{ item.note }}</p>
              </div>
            </li>
          </ul>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card report-actions no-print">
        <p class="download-tip">导出权限按当前套餐与数据库授权控制：免费版仅在线查看，Starter 及以上支持导出。</p>
        <select v-model="downloadFormat" class="download-select">
          <option value="pdf">PDF</option>
          <option value="docx">Word</option>
          <option value="json">JSON</option>
        </select>
        <button class="btn btn-primary" :disabled="downloading" @click="download">{{ downloading ? '下载中...' : '下载报告' }}</button>
        <button class="btn btn-secondary" @click="print">打印</button>
        <p v-if="downloadTip" class="download-tip">{{ downloadTip }}</p>
      </AppGlassSurface>
    </template>
  </main>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, getFriendlyError } from '@/lib/api';

const route = useRoute();
const router = useRouter();
const report = ref<any>(null);
const loading = ref(true);
const error = ref('');
const downloading = ref(false);
const downloadFormat = ref<'pdf' | 'docx' | 'json'>('pdf');
const downloadTip = ref('');

const result = computed(() => report.value?.result || {});
const scoreValue = computed(() => result.value?.score ?? result.value?.totalScore ?? '-');
const actionHint = computed(() => {
  const decision = String(result.value?.decision || '');
  if (decision.includes('可发布')) return '可直接发布';
  if (decision.includes('优化')) return '先优化再发布';
  if (decision.includes('复核')) return '提交人工复核';
  if (decision.includes('暂缓')) return '暂停发布并整改';
  return '-';
});

const dimensionItems = computed(() => {
  const ds = result.value?.dimensionScores || {};
  return [
    { key: 'completeness', label: '完整性', value: ds.completeness ?? '-', tip: '素材字段是否齐全' },
    { key: 'accuracy', label: '准确性', value: ds.accuracy ?? '-', tip: '表达是否明确可理解' },
    { key: 'compliance', label: '规范性', value: ds.compliance ?? '-', tip: '是否命中平台/合规风险' },
    { key: 'attractiveness', label: '吸引力', value: ds.attractiveness ?? '-', tip: '是否具备用户吸引力' },
    { key: 'localization', label: '市场适配', value: ds.localization ?? '-', tip: '是否符合目标市场表达' },
  ];
});

const issueRows = computed(() => {
  const rules = (result.value?.matchedRules || []).map((r: any) => ({
    riskLevel: r.riskLevel || '中风险',
    position: positionLabel(r.position),
    type: '规则命中',
    hit: r.name || '-',
    description: r.description || '-',
    suggestion: r.suggestion || '-',
  }));

  const issues = (result.value?.issues || []).map((i: any) => ({
    riskLevel: i.riskLevel || '中风险',
    position: positionLabel(i.position),
    type: i.type || '问题项',
    hit: i.hitContent || '-',
    description: i.description || '-',
    suggestion: i.suggestion || '建议按优化方案修改后复检',
  }));

  return [...rules, ...issues];
});

const suggestionRows = computed(() => {
  return (result.value?.suggestions || []).map((s: any) => ({
    problem: s.problem || s.before || '-',
    suggestion: s.suggestion || s.after || '-',
    recommendedText: s.recommendedText || '',
  }));
});

const hasOptimization = computed(() => {
  const opt = result.value?.optimization || {};
  return Boolean(
    (opt.titleVariants && opt.titleVariants.length) ||
    opt.sellingPointRewrite ||
    opt.detailStructureAdvice ||
    (opt.adCopyVariants && opt.adCopyVariants.length),
  );
});

const timelineRows = computed(() => {
  const rows: Array<{ action: string; time: string; operator?: string; note?: string }> = [];
  (report.value?.logs || []).forEach((l: any) => rows.push({ action: l.action || '系统操作', time: l.time || l.createdAt, operator: l.operator, note: l.note }));
  (report.value?.result?.reviewHistory || []).forEach((h: any) => rows.push({ action: h.action || '复核处理', time: h.time, operator: h.operator, note: `${h.reason || ''} ${h.comment || ''}`.trim() }));
  return rows.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
});

function shortNo(id?: string) {
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

function toLine(value: unknown) {
  if (Array.isArray(value)) return value.join('、');
  if (value == null) return '-';
  return String(value);
}

function riskClass(v?: string) {
  const t = String(v || '');
  if (t.includes('严重') || t.includes('高')) return 'tag-danger';
  if (t.includes('中')) return 'tag-warning';
  return 'tag-success';
}

function decisionClass(v?: string) {
  const t = String(v || '');
  if (t.includes('暂缓')) return 'tag-danger';
  if (t.includes('复核') || t.includes('优化')) return 'tag-warning';
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
    localization: '市场适配',
  };
  return map[String(pos || '')] || pos || '-';
}

async function download() {
  if (!report.value?.id) return;
  downloading.value = true;
  downloadTip.value = '';
  try {
    await api.downloadReport(report.value.id, downloadFormat.value);
    downloadTip.value = `已触发下载：${downloadFormat.value.toUpperCase()}。如果浏览器拦截，请检查下载权限。`;
  } catch (e) {
    downloadTip.value = getFriendlyError(e);
  } finally {
    downloading.value = false;
  }
}

function print() {
  window.print();
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/reports');
}

onMounted(async () => {
  try {
    report.value = await api.getReportDetail(String(route.params.id));
    if (route.query.print === '1') setTimeout(() => window.print(), 300);
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.report-page { display: grid; gap: 12px; }
.report-cover h1 { margin: 0 0 8px; font-size: 34px; }
.report-cover p { margin: 0; }
.cover-meta { display: grid; gap: 4px; margin-top: 8px; }
.cover-meta p { margin: 0; }

.report-section h2 { margin: 0 0 12px; }
.summary-strip { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.summary-item { border: 1px solid var(--border); border-radius: 10px; padding: 12px; background: var(--card-strong); }
.summary-item p { margin: 0; color: var(--muted); }
.summary-item strong { display: inline-block; margin-top: 6px; font-size: 22px; }
.text-success { color: #047857; }
.text-warning { color: #b45309; }
.text-danger { color: #b91c1c; }

.kv-grid { display: grid; gap: 8px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.kv-grid p { margin: 0; }

.result-grid { display: grid; gap: 10px; grid-template-columns: 1fr 1fr 1fr 2fr; }
.result-card { border: 1px solid var(--border); border-radius: 10px; padding: 10px; background: var(--card-strong); }
.result-card h3 { margin: 6px 0 0; font-size: 34px; color: var(--brand-1); }
.result-card p { margin: 0; }
.result-summary p + p { margin-top: 6px; color: var(--muted); line-height: 1.6; }

.dimension-grid { display: grid; gap: 10px; grid-template-columns: repeat(5, minmax(0, 1fr)); }
.dimension-card { border: 1px solid var(--border); border-radius: 10px; padding: 10px; background: var(--card-strong); display: grid; gap: 4px; }
.dimension-card p { margin: 0; color: var(--muted); }
.dimension-card strong { font-size: 24px; color: var(--brand-1); }
.dimension-card small { color: var(--muted); }

.table-wrap { overflow: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid var(--border); padding: 10px 8px; text-align: left; vertical-align: top; }

.suggestion-list { display: grid; gap: 10px; }
.sug-card { border: 1px solid var(--border); border-radius: 10px; padding: 10px; background: var(--card-strong); }
.sug-card h4 { margin: 0 0 8px; }
.sug-card p { margin: 6px 0 0; }
.sug-card ul { margin: 6px 0 0; padding-left: 18px; }
.optimization-block { margin-top: 10px; }

.parse-grid { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }
.parse-card { border: 1px solid var(--border); border-radius: 10px; padding: 10px; background: var(--card-strong); }
.parse-card h4 { margin: 0 0 8px; }
.parse-card p { margin: 6px 0 0; }

.timeline { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.timeline li { display: grid; grid-template-columns: 14px 1fr; gap: 10px; align-items: start; }
.timeline-dot { width: 10px; height: 10px; border-radius: 999px; background: var(--brand-1); margin-top: 7px; }
.timeline-title { margin: 0; font-weight: 700; }
.timeline-meta { margin: 2px 0 0; color: var(--muted); font-size: 13px; }
.timeline-desc { margin: 4px 0 0; }

.report-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.download-select { min-width: 120px; }
.download-tip { margin: 0; color: var(--muted); align-self: center; }
.detail-block summary { cursor: pointer; font-weight: 700; color: var(--brand-1); }
.detail-body { margin-top: 12px; }

@media (max-width: 1100px) {
  .summary-strip,
  .kv-grid,
  .result-grid,
  .dimension-grid,
  .parse-grid { grid-template-columns: 1fr; }
}

@media print {
  .no-print { display: none !important; }
}
</style>
