<template>
  <AppShell title="用户与客户管理">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card block">
        <div class="row-between">
          <h2 class="section-title">用户管理</h2>
          <div class="actions">
            <button class="btn btn-secondary" @click="openCreate">新增用户</button>
            <button class="btn btn-secondary" :disabled="loading" @click="loadAll">{{ loading ? '刷新中' : '刷新' }}</button>
          </div>
        </div>
        <section v-if="loading" class="state loading">用户数据加载中</section>
        <div class="table-wrap" v-else-if="users.length">
          <table class="table">
            <thead><tr><th>姓名</th><th>邮箱</th><th>企业</th><th>角色</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.username || u.name }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.companyName || '-' }}</td>
                <td>{{ roleLabel(u.role) }}</td>
                <td class="actions">
                  <button class="btn btn-secondary" @click="openEdit(u)">设置角色</button>
                  <button class="btn btn-secondary" @click="removeUser(u)">删除</button>
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
            <thead><tr><th>客户</th><th>套餐</th><th>总额度</th><th>已用额度</th><th>到期时间</th><th>状态</th><th>操作</th></tr></thead>
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
                  <button class="btn btn-secondary" @click="upgrade(c)">升级企业版</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="state">暂无客户数据</p>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card block">
        <h2 class="section-title">角色权限说明（MVP版）</h2>
        <ul>
          <li>系统管理员：全局管理、规则、用户、日志、套餐与企业配置。</li>
          <li>企业管理员：企业成员、批量检测、客户档案、规则管理。</li>
          <li>运营人员：任务创建、批量检测、报告查看、客户档案。</li>
          <li>设计人员：素材编辑与检测结果查看。</li>
          <li>复核人员：人工复核流转处理。</li>
          <li>客户查看员：仅查看报告和看板（后续企业版可配置）。</li>
        </ul>
      </AppGlassSurface>
    </section>

    <div v-if="modal.open" class="modal-mask" @click.self="closeModal">
      <AppGlassSurface as="section" class="card modal-panel">
        <h3 class="section-title" style="margin-bottom:8px;">{{ modal.mode === 'create' ? '新增用户' : '设置角色' }}</h3>
        <div class="block">
          <input v-if="modal.mode === 'create'" class="input" v-model.trim="form.username" placeholder="姓名" />
          <input v-if="modal.mode === 'create'" class="input" v-model.trim="form.companyName" placeholder="企业名称" />
          <input v-if="modal.mode === 'create'" class="input" v-model.trim="form.email" placeholder="邮箱" />
          <input v-if="modal.mode === 'create'" class="input" type="password" v-model.trim="form.password" placeholder="初始密码（至少6位）" />
          <select v-model="form.role">
            <option value="ENTERPRISE_ADMIN">企业管理员</option>
            <option value="OPERATOR">运营人员</option>
            <option value="DESIGNER">设计人员</option>
            <option value="REVIEWER">复核人员</option>
            <option value="MANAGER">管理人员</option>
            <option value="SYSTEM_ADMIN">系统管理员</option>
            <option value="CUSTOMER_VIEWER">客户查看员</option>
          </select>
          <div class="actions" style="justify-content:flex-end;">
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
import { onMounted, reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { ROLE_LABELS, normalizeRole } from '@/lib/permissions';
import { confirmDialog, notify, toast } from '@/lib/dialog';

const users = ref<any[]>([]);
const customers = ref<any[]>([]);
const loading = ref(false);
const modal = ref({ open: false, mode: 'create' as 'create' | 'edit', userId: '' });
const form = reactive({ username: '', companyName: '', email: '', password: '', role: 'OPERATOR' });

function roleLabel(role?: string) {
  return ROLE_LABELS[normalizeRole(role)];
}

async function loadAll() {
  loading.value = true;
  try {
    users.value = await api.getUsers();
    customers.value = await api.getCustomers();
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  modal.value = { open: true, mode: 'create', userId: '' };
  Object.assign(form, { username: '', companyName: '', email: '', password: '', role: 'OPERATOR' });
}

function openEdit(u: any) {
  modal.value = { open: true, mode: 'edit', userId: u.id };
  Object.assign(form, { username: u.username || '', companyName: u.companyName || '', email: u.email || '', password: '', role: u.role || 'OPERATOR' });
}

function closeModal() {
  modal.value.open = false;
}

async function saveModal() {
  if (modal.value.mode === 'create') {
    await api.createUser({ username: form.username, companyName: form.companyName, email: form.email, password: form.password, role: form.role });
  } else {
    await api.updateUser(modal.value.userId, { role: form.role });
  }
  closeModal();
  await loadAll();
}

async function removeUser(u: any) {
  if (!(await confirmDialog(`确认删除用户 ${u.username || u.email} 吗？`))) return;
  try {
    await api.deleteUser(u.id);
    await loadAll();
    toast('用户已删除', 'success');
  } catch (e) {
    await notify(getFriendlyError(e));
  }
}

async function addQuota(c: any) {
  await api.updateCustomerPlan(c.id, { quotaTotal: Number(c.quotaTotal || 0) + 100 });
  await loadAll();
}

async function upgrade(c: any) {
  await api.updateCustomerPlan(c.id, { plan: '企业版', status: '正常' });
  await loadAll();
}

onMounted(loadAll);
</script>

<style scoped>
.block { display: grid; gap: 10px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid var(--border); padding: 10px 8px; text-align: left; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.modal-mask { position: fixed; inset: 0; background: rgba(15,23,42,.36); display: grid; place-items: center; z-index: 90; }
.modal-panel { width: min(520px, calc(100vw - 32px)); }
</style>
