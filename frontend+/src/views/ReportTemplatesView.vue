<template>
  <AppShell title="报告模板">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card">
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
              <td>{{ t.name }}</td>
              <td>{{ codeText(t.code) }}</td>
              <td>{{ scopeText(t.scope) }}</td>
              <td>{{ t.versionNo }}</td>
              <td>{{ sections(t.schema) }}</td>
              <td class="actions">
                <button class="btn btn-secondary btn-xs" @click="openEdit(t)">编辑</button>
                <button class="btn btn-secondary btn-xs" @click="removeTemplate(t)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </AppGlassSurface>

      <Teleport to="body">
        <div v-if="editor.open" class="modal-mask" @click.self="closeEditor">
          <AppGlassSurface as="section" class="card modal-panel template-modal">
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

            <section class="section-picker">
              <p class="picker-title">报告结构模块</p>
              <div class="preset-grid">
                <label v-for="section in presetSections" :key="section" class="preset-item">
                  <input
                    type="checkbox"
                    :checked="editor.sections.includes(section)"
                    @change="togglePreset(section)"
                  />
                  <span>{{ section }}</span>
                </label>
              </div>

              <div class="custom-row">
                <input
                  class="input"
                  v-model.trim="editor.customSection"
                  placeholder="新增自定义模块，如：合规声明"
                  @keydown.enter.prevent="addCustomSection"
                />
                <button class="btn btn-secondary" type="button" @click="addCustomSection">添加</button>
              </div>

              <div class="picked-list" v-if="editor.sections.length">
                <span class="picked-tag" v-for="section in editor.sections" :key="section">
                  {{ section }}
                  <button type="button" class="tag-remove" @click="removeSection(section)">×</button>
                </span>
              </div>
            </section>

            <div class="actions dialog-actions">
              <button class="btn btn-secondary" @click="closeEditor">取消</button>
              <button class="btn btn-primary" :disabled="saving" @click="saveTemplate">{{ saving ? '保存中' : '保存' }}</button>
            </div>
          </AppGlassSurface>
        </div>
      </Teleport>
    </section>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { confirmDialog, notify, toast } from '@/lib/dialog';

const presetSections = ['封面', '基础信息', '评分', '风险', '建议', '复核'];
const rows = ref<any[]>([]);
const loading = ref(true);
const saving = ref(false);
const editor = reactive<any>({
  open: false,
  id: '',
  name: '',
  code: '',
  scope: 'SYSTEM',
  versionNo: 1,
  sections: [] as string[],
  customSection: '',
});

function sections(schema: any) {
  return (schema?.sections || []).join('、') || '-';
}
function codeText(code?: string) {
  const map: Record<string, string> = { MVP_STANDARD: '标准审核模板' };
  return map[String(code || '')] || code || '-';
}
function scopeText(scope?: string) {
  const map: Record<string, string> = { SYSTEM: '系统通用', COMPANY: '企业专属', CUSTOM: '定制模板' };
  return map[String(scope || '').toUpperCase()] || scope || '-';
}

function normalizeSections(input: any) {
  const list = Array.isArray(input?.sections) ? input.sections : [];
  const cleaned = list.map((x: unknown) => String(x || '').trim()).filter(Boolean);
  return Array.from(new Set(cleaned));
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
  Object.assign(editor, {
    open: true,
    id: '',
    name: '',
    code: '',
    scope: 'SYSTEM',
    versionNo: 1,
    sections: [...presetSections],
    customSection: '',
  });
}

function openEdit(item: any) {
  Object.assign(editor, {
    open: true,
    id: item.id,
    name: item.name || '',
    code: item.code || '',
    scope: item.scope || 'SYSTEM',
    versionNo: item.versionNo || 1,
    sections: normalizeSections(item.schema),
    customSection: '',
  });
}

function closeEditor() {
  editor.open = false;
}

function togglePreset(section: string) {
  if (editor.sections.includes(section)) {
    editor.sections = editor.sections.filter((x: string) => x !== section);
    return;
  }
  editor.sections = [...editor.sections, section];
}

async function addCustomSection() {
  const value = String(editor.customSection || '').trim();
  if (!value) {
    await notify('请输入自定义模块名称。');
    return;
  }
  if (!editor.sections.includes(value)) {
    editor.sections = [...editor.sections, value];
  }
  editor.customSection = '';
}

function removeSection(section: string) {
  editor.sections = editor.sections.filter((x: string) => x !== section);
}

function parseSections() {
  const cleaned = editor.sections.map((x: string) => String(x || '').trim()).filter(Boolean);
  return Array.from(new Set(cleaned));
}

async function saveTemplate() {
  if (!editor.name || !editor.code) {
    await notify('请填写模板名称和编码。');
    return;
  }
  const sectionList = parseSections();
  if (!sectionList.length) {
    await notify('请至少选择一个结构模块。');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: editor.name,
      code: editor.code,
      scope: editor.scope,
      versionNo: editor.versionNo || 1,
      schema: { sections: sectionList },
    };
    if (editor.id) await api.updateReportTemplate(editor.id, payload);
    else await api.createReportTemplate(payload);
    closeEditor();
    await load();
    toast('模板已保存', 'success');
  } catch (e) {
    await notify(getFriendlyError(e));
  } finally {
    saving.value = false;
  }
}

async function removeTemplate(item: any) {
  if (!item?.id) return;
  if (!(await confirmDialog(`确认删除模板「${item.name || '-'}」吗？`))) return;
  try {
    await api.deleteReportTemplate(item.id);
    await load();
    toast('模板已删除', 'success');
  } catch (e) {
    await notify(getFriendlyError(e));
  }
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
.template-modal { width: min(760px, calc(100vw - 32px)); display: grid; gap: 12px; max-height: calc(100vh - 36px); overflow: auto; }
.form-grid { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.section-picker { display: grid; gap: 10px; }
.picker-title { margin: 0; font-weight: 700; color: var(--text); }
.preset-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.preset-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 10px;
  background: var(--card-strong);
}
.custom-row { display: grid; gap: 8px; grid-template-columns: 1fr auto; align-items: center; }
.picked-list { display: flex; flex-wrap: wrap; gap: 8px; }
.picked-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  background: var(--card-strong);
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
}
.tag-remove {
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
}
.dialog-actions { justify-content: flex-end; }
@media (max-width: 760px) {
  .form-grid,
  .preset-grid,
  .custom-row { grid-template-columns: 1fr; }
}
</style>
