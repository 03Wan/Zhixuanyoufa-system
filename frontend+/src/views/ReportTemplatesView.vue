<template>
  <AppShell title="报告模板">
    <section class="page-stack fade-up">
      <section class="glass card">
        <div class="row-between">
          <div>
            <h2 class="section-title">正式报告模板</h2>
            <p class="text-muted">支持模板结构管理与导出；定制版可扩展专属模板。</p>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" :disabled="loading" @click="load">{{ loading ? '刷新中' : '刷新' }}</button>
            <button class="btn btn-primary" @click="openCreate">新增模板</button>
          </div>
        </div>
        <div v-if="loading" class="state loading center-loading">模板加载中</div>
        <table v-else class="table">
          <thead><tr><th>模板名称</th><th>编码</th><th>作用域</th><th>版本</th><th>结构</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="t in rows" :key="t.id">
              <td>{{ t.name }}</td><td>{{ codeText(t.code) }}</td><td>{{ scopeText(t.scope) }}</td><td>{{ t.versionNo }}</td><td>{{ sections(t.schema) }}</td>
              <td class="actions">
                <button class="btn btn-secondary btn-xs" @click="openEdit(t)">编辑</button>
                <button class="btn btn-secondary btn-xs" @click="removeTemplate(t)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div v-if="editor.open" class="modal-mask" @click.self="closeEditor">
        <section class="glass card modal-panel template-modal">
          <h3 class="section-title">{{ editor.id ? '编辑模板' : '新增模板' }}</h3>
          <div class="form-grid">
            <input class="input" v-model="editor.name" placeholder="模板名称" />
            <input class="input" v-model="editor.code" placeholder="模板编码" />
            <select class="input" v-model="editor.scope">
              <option value="SYSTEM">系统通用</option>
              <option value="COMPANY">企业专属</option>
              <option value="CUSTOM">定制模板</option>
            </select>
            <input class="input" type="number" v-model.number="editor.versionNo" placeholder="版本号" />
          </div>
          <textarea class="input" v-model="editor.sectionsText" placeholder="模板结构，用中文顿号或逗号分隔，如：封面、基础信息、评分、风险、建议、复核"></textarea>
          <div class="actions dialog-actions">
            <button class="btn btn-secondary" @click="closeEditor">取消</button>
            <button class="btn btn-primary" :disabled="saving" @click="saveTemplate">{{ saving ? '保存中' : '保存' }}</button>
          </div>
        </section>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { confirmDialog, notify } from '@/lib/dialog';

const rows = ref<any[]>([]);
const loading = ref(true);
const saving = ref(false);
const editor = reactive<any>({ open: false, id: '', name: '', code: '', scope: 'SYSTEM', versionNo: 1, sectionsText: '' });
function sections(schema: any){ return (schema?.sections || []).join('、') || '-'; }
function codeText(code?: string) {
  const map: Record<string, string> = { MVP_STANDARD: '标准审核模板' };
  return map[String(code || '')] || code || '-';
}
function scopeText(scope?: string) {
  const map: Record<string, string> = { SYSTEM: '系统通用', COMPANY: '企业专属', CUSTOM: '定制模板' };
  return map[String(scope || '').toUpperCase()] || scope || '-';
}
async function load() {
  loading.value = true;
  try {
    rows.value = await api.getReportTemplates() as any[];
  } catch (e) {
    await notify(getFriendlyError(e));
  } finally {
    loading.value = false;
  }
}
function openCreate() {
  Object.assign(editor, { open: true, id: '', name: '', code: '', scope: 'SYSTEM', versionNo: 1, sectionsText: '封面、基础信息、评分、风险、建议、复核' });
}
function openEdit(item: any) {
  Object.assign(editor, {
    open: true,
    id: item.id,
    name: item.name || '',
    code: item.code || '',
    scope: item.scope || 'SYSTEM',
    versionNo: item.versionNo || 1,
    sectionsText: sections(item.schema),
  });
}
function closeEditor() { editor.open = false; }
function parseSections() {
  return String(editor.sectionsText || '')
    .split(/[、,，\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}
async function saveTemplate() {
  if (!editor.name || !editor.code) {
    await notify('请填写模板名称和编码。');
    return;
  }
  saving.value = true;
  try {
    const payload = { name: editor.name, code: editor.code, scope: editor.scope, versionNo: editor.versionNo || 1, schema: { sections: parseSections() } };
    if (editor.id) await api.updateReportTemplate(editor.id, payload);
    else await api.createReportTemplate(payload);
    closeEditor();
    await load();
    await notify('模板已保存。');
  } catch (e) {
    await notify(getFriendlyError(e));
  } finally {
    saving.value = false;
  }
}
async function removeTemplate(item: any){
  if (!item?.id) return;
  if (!(await confirmDialog(`确认删除模板「${item.name || '-'}」吗？`))) return;
  try {
    await api.deleteReportTemplate(item.id);
    await load();
  } catch (e) { await notify(getFriendlyError(e)); }
}
onMounted(load);
</script>

<style scoped>
.table { width:100%; border-collapse: collapse; }
.table th,.table td { border-bottom:1px solid var(--border); padding:8px; }
.btn-xs { min-height: 30px; padding: 6px 10px; border-radius: 10px; font-size: 12px; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.center-loading { min-height: 320px; }
.modal-mask { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 18px; background: var(--modal-mask); }
.template-modal { width: min(720px, calc(100vw - 32px)); display: grid; gap: 10px; max-height: calc(100vh - 36px); overflow: auto; }
.form-grid { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dialog-actions { justify-content: flex-end; }
@media (max-width: 760px) { .form-grid { grid-template-columns: 1fr; } }
</style>
