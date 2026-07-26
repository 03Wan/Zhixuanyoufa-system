<template>
  <AppShell title="企业组织管理">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card">
        <h2 class="section-title">企业组织管理</h2>
        <p class="text-muted">支持企业档案、成员与任务/报告关联查看，后续可扩展企业级权限编排。</p>
        <div class="grid-3">
          <input class="input" v-model="form.name" placeholder="企业名称" />
          <select class="input" v-model="form.industryType">
            <option value="">请选择行业类型</option>
            <option v-for="item in industryOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <input class="input" v-model="form.contactPerson" placeholder="联系人" />
          <input class="input" v-model="form.contactPhone" placeholder="联系方式" />
          <select class="input" v-model="form.planType">
            <option value="">请选择套餐类型</option>
            <option v-for="item in planOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <select class="input" v-model="form.serviceStatus">
            <option v-for="item in statusOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
        <div class="checkbox-group">
          <span>目标市场：</span>
          <label v-for="item in marketOptions" :key="item"><input type="checkbox" :value="item" v-model="form.targetMarkets" /> {{ item }}</label>
        </div>
        <div class="actions" style="margin-top: 8px;">
          <button class="btn btn-primary" :disabled="saving" @click="create">{{ saving ? "保存中" : "新增企业" }}</button>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card">
        <div class="row-between">
          <h3>企业列表</h3>
          <button class="btn btn-secondary" :disabled="loading || refreshing" @click="load">
            {{ loading ? "刷新中" : refreshing ? "同步中" : "刷新" }}
          </button>
        </div>
        <div v-if="loading" class="state loading center-loading">企业数据加载中</div>
        <div v-else-if="refreshing" class="state">后台同步中</div>
        <table v-else class="table">
          <thead><tr><th>企业名称</th><th>行业</th><th>联系人</th><th>目标市场</th><th>套餐</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="c in rows" :key="c.id">
              <td>{{ c.name }}</td>
              <td>{{ c.industryType || "-" }}</td>
              <td>{{ c.contactPerson || "-" }}</td>
              <td>{{ (c.targetMarkets || []).join("、") || "-" }}</td>
              <td>{{ c.planType || "-" }}</td>
              <td>{{ serviceStatusText(c.serviceStatus) }}</td>
              <td><button class="btn btn-secondary btn-xs" @click="removeCompany(c)">删除</button></td>
            </tr>
          </tbody>
        </table>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, reactive, ref } from "vue";
import AppShell from "@/layouts/AppShell.vue";
import { api, getFriendlyError } from "@/lib/api";
import { confirmDialog, notify, toast } from "@/lib/dialog";
import { readViewCache, writeViewCache } from "@/lib/view-cache";

const COMPANY_CACHE_KEY = "view-cache:companies";
const rows = ref<any[]>([]);
const industryOptions = ["跨境电商", "品牌出海", "代运营机构", "外贸服务", "产业带机构", "教育实训"];
const planOptions = ["体验包/按次检测", "基础版", "专业版", "企业版", "定制版", "API接口版"];
const statusOptions = ["开通中", "服务中", "待开通", "已暂停"];
const marketOptions = ["欧美", "中东", "东南亚", "日本", "全球通用"];
const form = reactive({ name: "", industryType: "", contactPerson: "", contactPhone: "", planType: "", serviceStatus: "开通中", targetMarkets: [] as string[] });
const loading = ref(true);
const refreshing = ref(false);
const saving = ref(false);
function serviceStatusText(value?: string) { const map: Record<string, string> = { OPENING: '开通中', ACTIVE: '服务中', PENDING: '待开通', SUSPENDED: '已暂停' }; return map[String(value || '').toUpperCase()] || value || '-'; }

async function load() {
  const silent = rows.value.length > 0;
  if (silent) refreshing.value = true;
  else loading.value = true;
  try {
    rows.value = (await api.getCompanies()) as any[];
    writeViewCache(COMPANY_CACHE_KEY, rows.value, 45_000);
  } catch (e) {
    await notify(getFriendlyError(e));
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function create() {
  saving.value = true;
  try {
    if (!form.name) {
      await notify("请输入企业名称");
      return;
    }
    await api.createCompany({ ...form, targetMarkets: form.targetMarkets.length ? form.targetMarkets : ["欧美"] });
    Object.assign(form, { name: "", industryType: "", contactPerson: "", contactPhone: "", planType: "", serviceStatus: "开通中", targetMarkets: [] });
    await load();
  } catch (e) {
    await notify(getFriendlyError(e));
  } finally {
    saving.value = false;
  }
}

async function removeCompany(item: any) {
  if (!item?.id) return;
  if (!(await confirmDialog(`确认删除企业「${item.name || "-"}」吗？`))) return;
  try {
    await api.deleteCompany(item.id);
    await load();
    toast("企业已删除", "success");
  } catch (e) {
    await notify(getFriendlyError(e));
  }
}

onMounted(() => {
  const cached = readViewCache<any[]>(COMPANY_CACHE_KEY);
  if (cached?.length) {
    rows.value = cached;
    loading.value = false;
  }
  void load();
});
</script>

<style scoped>
.grid-3 { display:grid; gap:8px; grid-template-columns: repeat(3,minmax(0,1fr)); }
.table { width:100%; border-collapse: collapse; }
.table th,.table td { border-bottom:1px solid var(--border); padding:8px; }
.actions { display:flex; gap:8px; }
.checkbox-group { display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-top:8px; color:var(--muted); }
.checkbox-group label { display:inline-flex; align-items:center; gap:4px; color:var(--text); }
.btn-xs { min-height: 30px; padding: 6px 10px; border-radius: 10px; font-size: 12px; }
.center-loading { min-height: 260px; }
@media (max-width:900px){ .grid-3{ grid-template-columns:1fr; } }
</style>
