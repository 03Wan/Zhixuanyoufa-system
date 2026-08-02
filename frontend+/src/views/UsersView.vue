<template>
  <AppShell title="用户与客户管理">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card block">
        <div class="row-between">
          <h2 class="section-title">用户管理</h2>
          <div class="actions">
            <button class="btn btn-secondary" @click="openCreate">新增用户</button>
            <button class="btn btn-secondary" :disabled="loading || refreshing" @click="loadAll">
              {{ loading ? "刷新中" : refreshing ? "同步中" : "刷新" }}
            </button>
          </div>
        </div>

        <section v-if="loading" class="state loading">用户数据加载中</section>
        <div v-else-if="refreshing" class="state">后台同步中</div>
        <div class="table-wrap" v-else-if="companyGroups.length">
          <table class="table">
            <thead>
              <tr>
                <th>企业</th>
                <th>用户数</th>
                <th>角色分布</th>
                <th>预览成员</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="group in companyGroups" :key="group.name">
                <td class="company-name">{{ group.name }}</td>
                <td>{{ group.users.length }} 位</td>
                <td>{{ group.roleSummary }}</td>
                <td>{{ group.previewNames }}</td>
                <td class="actions">
                  <button class="btn btn-secondary" @click="openCompany(group)">查看用户</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="state">暂无用户</p>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card block">
        <h2 class="section-title">客户套餐与额度</h2>
        <section v-if="loading" class="state loading">客户数据加载中</section>
        <div class="table-wrap" v-else-if="customers.length">
          <table class="table">
            <thead>
              <tr>
                <th>客户</th>
                <th>套餐</th>
                <th>总额度</th>
                <th>已用额度</th>
                <th>到期时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in customers" :key="c.id">
                <td>{{ c.name }}</td>
                <td>{{ c.plan }}</td>
                <td>{{ c.quotaTotal }}</td>
                <td>{{ c.quotaUsed }}</td>
                <td>{{ c.expireAt }}</td>
                <td>{{ c.status }}</td>
                <td class="actions">
                  <button class="btn btn-secondary" @click="addQuota(c)">+100额度</button>
                  <button class="btn btn-secondary" @click="upgrade(c)">升级 Pro</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="state">暂无客户数据</p>
      </AppGlassSurface>
    </section>

    <div v-if="companyModal.open" class="modal-mask company-mask" @click.self="closeCompanyModal">
      <AppGlassSurface as="section" class="card company-modal" :radius="28">
        <div class="row-between company-modal-head">
          <div>
            <h3 class="section-title">{{ companyModal.name }}</h3>
            <p class="text-muted">共 {{ companyModal.users.length }} 位用户</p>
          </div>
          <button class="btn btn-secondary" @click="closeCompanyModal">关闭</button>
        </div>

        <div v-if="companyModal.users.length" class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in companyModal.users" :key="u.id">
                <td>{{ u.username || u.name }}</td>
                <td>{{ u.email }}</td>
                <td>{{ roleLabel(u.role) }}</td>
                <td class="actions">
                  <button class="btn btn-secondary" @click="openEdit(u)">设置角色</button>
                  <button class="btn btn-secondary" @click="removeUser(u)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="state">该企业暂无用户</p>
      </AppGlassSurface>
    </div>

    <div v-if="modal.open" class="modal-mask edit-mask" @click.self="closeModal">
      <AppGlassSurface as="section" class="card modal-panel edit-modal" :radius="24">
        <h3 class="section-title" style="margin-bottom: 8px;">{{ modal.mode === "create" ? "新增用户" : "设置角色" }}</h3>
        <div class="block">
          <input v-if="modal.mode === 'create'" v-model.trim="form.username" class="input" placeholder="姓名" />
          <input v-if="modal.mode === 'create'" v-model.trim="form.companyName" class="input" placeholder="企业名称" />
          <input v-if="modal.mode === 'create'" v-model.trim="form.email" class="input" placeholder="邮箱" />
          <input v-if="modal.mode === 'create'" v-model.trim="form.password" class="input" type="password" placeholder="初始密码（至少6位）" />
          <select v-model="form.role" class="input">
            <option value="ENTERPRISE_ADMIN">企业管理员</option>
            <option value="OPERATOR">运营人员</option>
            <option value="DESIGNER">设计人员</option>
            <option value="REVIEWER">复核人员</option>
            <option value="MANAGER">管理人员</option>
            <option value="SYSTEM_ADMIN">系统管理员</option>
            <option value="CUSTOMER_VIEWER">客户查看员</option>
          </select>
          <div class="actions modal-actions">
            <button class="btn btn-secondary" @click="closeModal">取消</button>
            <button class="btn btn-primary" @click="saveModal">保存</button>
          </div>
        </div>
      </AppGlassSurface>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onMounted, reactive, ref } from "vue";
import AppShell from "@/layouts/AppShell.vue";
import { api, getFriendlyError } from "@/lib/api";
import { ROLE_LABELS, normalizeRole } from "@/lib/permissions";
import { confirmDialog, notify, toast } from "@/lib/dialog";
import { readViewCache, writeViewCache } from "@/lib/view-cache";

const USER_CUSTOMER_CACHE_KEY = "view-cache:users-and-customers";
const users = ref<any[]>([]);
const customers = ref<any[]>([]);
const loading = ref(true);
const refreshing = ref(false);
const modal = ref({ open: false, mode: "create" as "create" | "edit", userId: "" });
const companyModal = ref({ open: false, name: "", users: [] as any[] });
const form = reactive({ username: "", companyName: "", email: "", password: "", role: "OPERATOR" });

const companyGroups = computed(() => {
  const grouped = new Map<string, any[]>();
  for (const user of users.value) {
    const companyName = String(user.companyName || "平台方");
    const list = grouped.get(companyName) || [];
    list.push(user);
    grouped.set(companyName, list);
  }
  return Array.from(grouped.entries())
    .map(([name, groupUsers]) => ({
      name,
      users: [...groupUsers].sort((a, b) => String(a.username || a.email).localeCompare(String(b.username || b.email), "zh-CN")),
      roleSummary: Array.from(new Set(groupUsers.map((item) => roleLabel(item.role)).filter(Boolean))).join(" / ") || "未分配角色",
      previewNames: groupUsers.slice(0, 4).map((item) => item.username || item.name || item.email).join("、"),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
});

function roleLabel(role?: string) {
  return ROLE_LABELS[normalizeRole(role)];
}

async function loadAll() {
  const silent = users.value.length > 0 || customers.value.length > 0;
  if (silent) refreshing.value = true;
  else loading.value = true;
  try {
    const [nextUsers, nextCustomers] = await Promise.all([api.getUsers(), api.getCustomers()]);
    users.value = nextUsers as any[];
    customers.value = nextCustomers as any[];
    writeViewCache(USER_CUSTOMER_CACHE_KEY, { users: users.value, customers: customers.value }, 45_000);
    if (companyModal.value.open) {
      const nextGroup = companyGroups.value.find((group) => group.name === companyModal.value.name);
      companyModal.value = nextGroup ? { open: true, name: nextGroup.name, users: nextGroup.users } : { open: false, name: "", users: [] };
    }
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function openCreate() {
  closeCompanyModal();
  modal.value = { open: true, mode: "create", userId: "" };
  Object.assign(form, { username: "", companyName: "", email: "", password: "", role: "OPERATOR" });
}

function openEdit(u: any) {
  closeCompanyModal();
  modal.value = { open: true, mode: "edit", userId: u.id };
  Object.assign(form, { username: u.username || "", companyName: u.companyName || "", email: u.email || "", password: "", role: u.role || "OPERATOR" });
}

function closeModal() {
  modal.value.open = false;
}

function openCompany(group: { name: string; users: any[] }) {
  companyModal.value = { open: true, name: group.name, users: group.users };
}

function closeCompanyModal() {
  companyModal.value = { open: false, name: "", users: [] };
}

async function saveModal() {
  try {
    if (modal.value.mode === "create") {
      await api.createUser({ username: form.username, companyName: form.companyName, email: form.email, password: form.password, role: form.role });
      toast("用户已创建", "success");
    } else {
      await api.updateUser(modal.value.userId, { role: form.role });
      toast("角色已更新", "success");
    }
    closeModal();
    await loadAll();
  } catch (e) {
    await notify(getFriendlyError(e));
  }
}

async function removeUser(u: any) {
  if (!(await confirmDialog(`确认删除用户 ${u.username || u.email} 吗？`))) return;
  try {
    await api.deleteUser(u.id);
    await loadAll();
    toast("用户已删除", "success");
  } catch (e) {
    await notify(getFriendlyError(e));
  }
}

async function addQuota(c: any) {
  try {
    await api.updateCustomerPlan(c.id, { quotaTotal: Number(c.quotaTotal || 0) + 100 });
    await loadAll();
    toast("额度已增加", "success");
  } catch (e) {
    await notify(getFriendlyError(e));
  }
}

async function upgrade(c: any) {
  try {
    await api.updateCustomerPlan(c.id, { plan: "Pro", status: "正常" });
    await loadAll();
    toast("客户套餐已升级", "success");
  } catch (e) {
    await notify(getFriendlyError(e));
  }
}

onMounted(() => {
  const cached = readViewCache<{ users: any[]; customers: any[] }>(USER_CUSTOMER_CACHE_KEY);
  if (cached) {
    users.value = cached.users || [];
    customers.value = cached.customers || [];
    loading.value = false;
  }
  void loadAll();
});
</script>

<style scoped>
.block { display: grid; gap: 10px; }
.table-wrap { overflow: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid var(--border); padding: 12px 10px; text-align: left; vertical-align: middle; }
.company-name { font-weight: 700; white-space: nowrap; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.modal-mask { position: fixed; inset: 0; display: grid; place-items: center; padding: 20px; }
.company-mask { z-index: 90; background: rgba(9, 18, 38, 0.46); backdrop-filter: blur(12px) saturate(115%); -webkit-backdrop-filter: blur(12px) saturate(115%); }
.edit-mask { z-index: 120; background: rgba(9, 18, 38, 0.58); backdrop-filter: blur(16px) saturate(120%); -webkit-backdrop-filter: blur(16px) saturate(120%); }
.modal-panel { width: min(520px, calc(100vw - 32px)); }
.company-modal { width: min(1120px, calc(100vw - 32px)); max-height: calc(100vh - 40px); overflow: auto; display: grid; gap: 14px; background: linear-gradient(160deg, rgba(245, 249, 255, 0.92), rgba(226, 237, 255, 0.82)), rgba(230, 239, 253, 0.88) !important; border: 1px solid rgba(188, 209, 243, 0.92) !important; box-shadow: 0 28px 60px rgba(10, 22, 44, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.75) !important; backdrop-filter: blur(22px) saturate(125%) !important; -webkit-backdrop-filter: blur(22px) saturate(125%) !important; }
.edit-modal { background: linear-gradient(160deg, rgba(248, 252, 255, 0.96), rgba(235, 242, 255, 0.9)), rgba(241, 246, 255, 0.94) !important; border: 1px solid rgba(194, 212, 243, 0.96) !important; box-shadow: 0 32px 70px rgba(10, 22, 44, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.78) !important; backdrop-filter: blur(24px) saturate(130%) !important; -webkit-backdrop-filter: blur(24px) saturate(130%) !important; }
:global(html.dark) .company-modal,
:global(html.dark) .edit-modal {
  background: linear-gradient(160deg, rgba(19, 34, 60, .98), rgba(11, 22, 42, .96)) !important;
  border-color: rgba(127, 167, 229, .5) !important;
  box-shadow: 0 28px 70px rgba(0, 4, 15, .68), inset 0 1px 0 rgba(255, 255, 255, .08) !important;
  color: var(--text);
}
:global(html.dark) .company-modal :is(h1, h2, h3, p, td, th, label),
:global(html.dark) .edit-modal :is(h1, h2, h3, p, td, th, label) { color: var(--text); }
:global(html.dark) .company-modal th,
:global(html.dark) .edit-modal th { color: var(--muted); }
.company-modal-head { align-items: start; }
.modal-actions { justify-content: flex-end; }
@media (max-width: 760px) { .actions .btn { width: 100%; } }
</style>
