<template>
  <AppShell title="规则与模板">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card block">
        <div class="row-between">
          <h2 class="section-title">规则与模板</h2>
          <div class="actions">
            <button class="btn btn-secondary" @click="openCreateModal">新增规则</button>
            <button class="btn btn-secondary" @click="triggerImport">一键导入规则</button>
            <button class="btn btn-secondary" :disabled="loading" @click="loadAll">{{ loading ? '刷新中' : '刷新' }}</button>
          </div>
        </div>

        <p class="text-muted">审校结果保留规则来源、适用范围、版本和更新时间，便于复核发布依据。</p>
        <input ref="importInput" class="hidden-input" type="file" accept="application/json,.json" @change="importRules" />
        <div v-if="rules.length" class="rule-filters">
          <button :class="['filter-chip', { active: filters.type === '' }]" @click="filters.type = ''">全部 {{ rules.length }}</button>
          <button v-for="item in categories" :key="item.value" :class="['filter-chip', { active: filters.type === item.value }]" @click="filters.type = item.value">{{ item.label }} {{ item.count }}</button>
          <select v-model="filters.platform" aria-label="按平台筛选"><option value="">全部平台</option><option v-for="item in platforms" :key="item" :value="item">{{ item }}</option></select>
          <select v-model="filters.risk" aria-label="按风险筛选"><option value="">全部风险</option><option value="LOW">低风险</option><option value="MEDIUM">中风险</option><option value="HIGH">高风险</option></select>
        </div>

        <section v-if="loading" class="state loading">规则加载中</section>
        <p v-else-if="error" class="state error">{{ error }}</p>

        <div class="table-wrap" v-else-if="filteredRules.length">
          <table class="table rules-table">
            <thead><tr><th>名称</th><th>类型</th><th>平台</th><th>市场</th><th>风险</th><th>来源</th><th>版本/更新时间</th><th>状态</th><th class="actions-col">操作</th></tr></thead>
            <tbody>
              <tr v-for="r in filteredRules" :key="r.id">
                <td>{{ r.name }}</td>
                <td>{{ typeText(r.type) }}</td>
                <td>{{ r.platform || '-' }}</td>
                <td>{{ r.market || '-' }}</td>
                <td>{{ riskText(r.riskLevel) }}</td>
                <td class="content-cell">{{ r.source || 'SYSTEM' }}</td>
                <td>{{ r.version || '-' }}<br /><small class="text-muted">{{ time(r.updatedAt) }}</small></td>
                <td>{{ statusText(r.status, r.enabled) }}</td>
                <td class="actions actions-cell">
                  <button class="btn btn-secondary" @click="openEditModal(r)">编辑</button>
                  <button class="btn btn-secondary" @click="openDetailModal(r)">详情</button>
                  <button class="btn btn-secondary" @click="openVersionModal(r)">版本</button>
                  <button class="btn btn-secondary" @click="toggleStatus(r)">{{ statusText(r.status, r.enabled) === '启用' ? '停用' : '启用' }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty">没有符合筛选条件的规则</p>
      </AppGlassSurface>
    </section>

    <div v-if="modal.type" class="modal-mask" @click.self="closeModal">
      <AppGlassSurface as="section" class="card modal-panel" v-if="modal.type === 'create' || modal.type === 'edit'">
        <h3 class="modal-title">{{ modal.type === 'create' ? '新增规则' : '编辑规则' }}</h3>
        <div class="form-grid">
          <div><label>名称</label><input class="input" v-model.trim="editing.form.name" placeholder="例如：绝对化用语风险" /></div>
          <div><label>类型</label><input class="input" v-model.trim="editing.form.type" placeholder="平台规则 / 市场文化 / 品类规范" /></div>
          <div><label>平台</label><input class="input" v-model.trim="editing.form.platform" placeholder="Amazon / Shopee / TikTok Shop" /></div>
          <div><label>市场</label><input class="input" v-model.trim="editing.form.market" placeholder="欧美 / 中东 / 东南亚" /></div>
          <div><label>风险等级</label><select v-model="editing.form.riskLevel"><option value="LOW">低风险</option><option value="MEDIUM">中风险</option><option value="HIGH">高风险</option></select></div>
          <div><label>状态</label><select v-model="editing.form.status"><option>启用</option><option>停用</option></select></div>
          <div class="span-2"><label>关键词（逗号分隔）</label><input class="input" v-model.trim="editing.form.keywordsText" placeholder="最强, 100%有效" /></div>
          <div class="span-2"><label>修正建议</label><textarea class="input" rows="3" v-model.trim="editing.form.suggestion" placeholder="建议替换为客观、可验证的描述。" /></div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" @click="saveEditing">保存</button>
          <button class="btn btn-secondary" @click="closeModal">取消</button>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card modal-panel" v-else-if="modal.type === 'detail' && selectedRule">
        <h3 class="modal-title">规则详情</h3>
        <div class="rule-detail">
          <p><strong>名称：</strong>{{ selectedRule.name }}</p>
          <p><strong>类型：</strong>{{ typeText(selectedRule.type) }}</p>
          <p><strong>平台/市场：</strong>{{ selectedRule.platform || '-' }} / {{ selectedRule.market || '-' }}</p>
          <p><strong>风险等级：</strong>{{ riskText(selectedRule.riskLevel) }}</p>
          <p><strong>规则来源：</strong>{{ selectedRule.source || '待补充来源' }}</p>
          <p><strong>适用类目：</strong>{{ selectedRule.category || '通用' }}</p>
          <p><strong>版本与校验：</strong>v{{ selectedRule.version || 1 }} · 最近更新 {{ time(selectedRule.updatedAt) }}</p>
          <p><strong>关键词：</strong>{{ asText(selectedRule.keywords) }}</p>
          <p><strong>修正建议：</strong>{{ asText(selectedRule.suggestion || selectedRule.description) }}</p>
        </div>
        <div class="actions"><button class="btn btn-secondary" @click="closeModal">关闭</button></div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card modal-panel" v-else-if="modal.type === 'version' && selectedRule">
        <h3 class="modal-title">版本记录：{{ selectedRule.name }}</h3>
        <div class="table-wrap" v-if="versions.length">
          <table class="table">
            <thead><tr><th>版本</th><th>创建人</th><th>创建时间</th><th>操作</th></tr></thead>
            <tbody><tr v-for="v in versions" :key="v.id"><td>{{ v.version }}</td><td>{{ v.createdBy }}</td><td>{{ time(v.createdAt) }}</td><td><button class="btn btn-secondary" @click="rollback(v.id)">回滚到此版本</button></td></tr></tbody>
          </table>
        </div>
        <p v-else class="empty">暂无版本记录</p>
        <div class="actions"><button class="btn btn-secondary" @click="closeModal">关闭</button></div>
      </AppGlassSurface>
    </div>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onMounted, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { notify } from '@/lib/dialog';

const rules = ref<any[]>([]);
const selectedRule = ref<any>(null);
const versions = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const filters = ref({ type: '', platform: '', risk: '' });
const importInput = ref<HTMLInputElement | null>(null);
const modal = ref<{ type: '' | 'create' | 'edit' | 'detail' | 'version' }>({ type: '' });
const editing = ref<any>({ mode: 'create', ruleId: '', form: emptyForm() });

const categories = computed(() => ['PLATFORM', 'MARKET_CULTURE', 'CATEGORY']
  .map((value) => ({ value, label: typeText(value), count: rules.value.filter((rule) => String(rule.type).toUpperCase() === value).length }))
  .filter((item) => item.count));
const platforms = computed(() => [...new Set(rules.value.map((rule) => rule.platform).filter(Boolean))].sort());
const filteredRules = computed(() => rules.value.filter((rule) =>
  (!filters.value.type || String(rule.type).toUpperCase() === filters.value.type)
  && (!filters.value.platform || rule.platform === filters.value.platform)
  && (!filters.value.risk || String(rule.riskLevel).toUpperCase() === filters.value.risk),
));

function emptyForm() { return { name: '', type: '', platform: '', market: '', riskLevel: 'MEDIUM', status: '启用', keywordsText: '', suggestion: '' }; }
function time(v?: string) { if (!v) return '-'; const d = new Date(v); if (Number.isNaN(d.getTime())) return '-'; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
function typeText(v?: string) { const map: Record<string, string> = { PLATFORM: '平台规则', MARKET_CULTURE: '市场文化', CATEGORY: '品类规范' }; return map[String(v || '').toUpperCase()] || v || '-'; }
function riskText(v?: string) { const map: Record<string, string> = { LOW: '低风险', MEDIUM: '中风险', HIGH: '高风险' }; const raw = String(v || '').toUpperCase(); return map[raw] || v || '-'; }
function statusText(status?: string, enabled?: boolean) { if (status === '启用' || status === '停用') return status; if (enabled === false) return '停用'; return '启用'; }
function asText(value: unknown) { if (Array.isArray(value)) return value.length ? value.join('、') : '-'; if (typeof value === 'string') return value || '-'; if (value && typeof value === 'object') return JSON.stringify(value); return '-'; }
function summarizeRule(rule: any) { const keyword = Array.isArray(rule.keywords) && rule.keywords.length ? `关键词：${rule.keywords.join('、')}` : ''; return keyword || asText(rule.suggestion || rule.description); }
function triggerImport() { importInput.value?.click(); }
async function importRules(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const items = Array.isArray(parsed) ? parsed : parsed.rules;
    if (!Array.isArray(items) || !items.length) throw new Error('导入文件须为规则数组，或包含 rules 数组。');
    const payloads = items.map((item: any) => ({
      name: String(item.name || '').trim(), type: String(item.type || '').trim(), platform: item.platform || null,
      market: item.market || null, riskLevel: String(item.riskLevel || 'MEDIUM').toUpperCase(),
      enabled: item.enabled !== false, status: item.status || (item.enabled === false ? '停用' : '启用'),
      keywords: Array.isArray(item.keywords) ? item.keywords : String(item.keywords || '').split(',').map((value) => value.trim()).filter(Boolean),
      suggestion: item.suggestion || item.description || '',
    }));
    if (payloads.some((item) => !item.name || !item.type)) throw new Error('每条规则都必须包含 name 和 type。');
    await Promise.all(payloads.map((item) => api.createRule(item)));
    await loadAll();
    await notify(`已成功导入 ${payloads.length} 条规则。`);
  } catch (error) {
    await notify(error instanceof Error ? error.message : '规则导入失败，请检查 JSON 格式。');
  } finally { input.value = ''; }
}

async function loadAll() { loading.value = true; error.value = ''; try { rules.value = await api.getRules(); } catch (e) { error.value = getFriendlyError(e); } finally { loading.value = false; } }
function closeModal() { modal.value.type = ''; }
function openCreateModal() { editing.value = { mode: 'create', ruleId: '', form: emptyForm() }; modal.value.type = 'create'; }
function openEditModal(rule: any) { editing.value = { mode: 'edit', ruleId: rule.id, form: { name: rule.name || '', type: typeText(rule.type) === '-' ? '' : typeText(rule.type), platform: rule.platform || '', market: rule.market || '', riskLevel: String(rule.riskLevel || 'MEDIUM').toUpperCase(), status: statusText(rule.status, rule.enabled), keywordsText: Array.isArray(rule.keywords) ? rule.keywords.join(', ') : '', suggestion: asText(rule.suggestion || rule.description) } }; modal.value.type = 'edit'; }
function openDetailModal(rule: any) { selectedRule.value = rule; modal.value.type = 'detail'; }
async function openVersionModal(rule: any) { selectedRule.value = rule; versions.value = await api.getRuleVersions(rule.id) as any[]; modal.value.type = 'version'; }
async function saveEditing() {
  const f = editing.value.form;
  const keywords = String(f.keywordsText || '').split(',').map((s) => s.trim()).filter(Boolean);
  const payload = { name: f.name, type: f.type, platform: f.platform || null, market: f.market || null, riskLevel: f.riskLevel, enabled: f.status === '启用', status: f.status, keywords, suggestion: f.suggestion };
  if (!payload.name || !payload.type) { await notify('请填写规则名称和类型。'); return; }
  if (editing.value.mode === 'create') await api.createRule(payload); else await api.updateRule(editing.value.ruleId, payload);
  closeModal(); await loadAll();
}
async function toggleStatus(rule: any) { const nextEnabled = statusText(rule.status, rule.enabled) !== '启用'; await api.updateRule(rule.id, { enabled: nextEnabled, status: nextEnabled ? '启用' : '停用' }); await loadAll(); }
async function rollback(versionId: string) { if (!selectedRule.value) return; await api.rollbackRuleVersion(selectedRule.value.id, versionId); versions.value = await api.getRuleVersions(selectedRule.value.id) as any[]; await loadAll(); }

onMounted(loadAll);
</script>

<style scoped>
.block { display: grid; gap: 10px; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.hidden-input { display: none; }
.rule-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; padding: 10px; border: 1px solid var(--border); border-radius: 14px; background: var(--card-strong); }
.filter-chip { border: 1px solid var(--border); border-radius: 999px; padding: 6px 10px; background: transparent; color: var(--muted); cursor: pointer; }
.filter-chip.active { color: #fff; border-color: var(--brand-1); background: var(--brand-1); }
.rule-filters select { width: auto; min-width: 116px; padding: 7px 10px; }
.empty { color: var(--muted); padding: 8px 2px; }
.table-wrap { overflow-x: auto; }
.rules-table { min-width: 1350px; }
.content-cell { max-width: 520px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.actions-col, .actions-cell { min-width: 280px; }
.modal-mask { position: fixed; inset: 0; background: rgba(15, 23, 42, .36); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-panel { width: min(900px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow: auto; }
.modal-title { margin: 0 0 12px; font-size: 24px; }
.rule-detail { display: grid; gap: 8px; }
.form-grid { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }
.span-2 { grid-column: span 2; }
@media (max-width: 860px) { .form-grid { grid-template-columns: 1fr; } .span-2 { grid-column: span 1; } }
</style>
