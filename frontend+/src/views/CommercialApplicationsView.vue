<template>
  <AppShell title="企业申请">
    <section class="page-stack fade-up">
      <AppGlassSurface as="section" class="card">
        <div class="row-between">
          <div><h2 class="section-title">企业申请</h2><p class="text-muted">此处显示数据库中的真实申请记录。</p></div>
          <button class="btn btn-secondary" :disabled="loading" @click="load">刷新</button>
        </div>
      </AppGlassSurface>
      <AppGlassSurface as="section" class="card">
        <div v-if="loading" class="state loading">申请记录加载中</div>
        <div v-else-if="!rows.length" class="state">暂无申请记录</div>
        <div v-else class="table-wrap"><table><thead><tr><th>企业</th><th>申请类型</th><th>联系人</th><th>邮箱</th><th>提交时间</th><th>状态</th><th v-if="canReview">操作</th></tr></thead><tbody>
          <tr v-for="item in rows" :key="item.id"><td>{{ item.companyName || '-' }}</td><td>{{ item.type }}</td><td>{{ item.contactName || '-' }}</td><td>{{ item.email || item.contact || '-' }}</td><td>{{ time(item.createdAt) }}</td><td><span class="tag">{{ statusLabel(item.status) }}</span></td><td v-if="canReview"><div v-if="item.status === 'PENDING'" class="actions"><button class="btn btn-primary btn-xs" @click="review(item, 'APPROVED')">通过</button><button class="btn btn-secondary btn-xs" @click="review(item, 'REJECTED')">驳回</button></div><span v-else>-</span></td></tr>
        </tbody></table></div>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AppGlassSurface from '@/components/AppGlassSurface.vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError, getUserProfile } from '@/lib/api';
import { confirmDialog, notify, toast } from '@/lib/dialog';

const rows = ref<any[]>([]); const loading = ref(true);
const canReview = computed(() => String((getUserProfile() as any)?.role || '').toUpperCase() === 'SYSTEM_ADMIN');
const statusLabel = (value: string) => ({ PENDING: '待审核', IN_REVIEW: '审核中', APPROVED: '已通过', REJECTED: '已驳回' }[value] || value || '-');
function time(value?: string) { const d = value ? new Date(value) : null; return d && !Number.isNaN(d.getTime()) ? d.toLocaleString('zh-CN', { hour12: false }) : '-'; }
async function load() { loading.value = true; try { rows.value = await api.getCommercialApplications(); } catch (error) { await notify(getFriendlyError(error)); } finally { loading.value = false; } }
async function review(item: any, status: 'APPROVED' | 'REJECTED') { const label = status === 'APPROVED' ? '通过' : '驳回'; if (!(await confirmDialog(`确认${label}“${item.companyName || '该企业'}”的申请吗？`))) return; try { await api.reviewCommercialApplication(item.id, status); toast(`申请已${label}`, 'success'); await load(); } catch (error) { await notify(getFriendlyError(error)); } }
onMounted(async () => { if (canReview.value) await api.markNotificationsRead(); await load(); });
</script>

<style scoped>
.row-between { display:flex; align-items:center; justify-content:space-between; gap:12px; }.row-between p { margin:4px 0 0; }.table-wrap { overflow:auto; }.actions { display:flex; gap:8px; }.btn-xs { min-height:30px; padding:5px 10px; font-size:12px; }.tag { white-space:nowrap; }
</style>
