<template>
  <AppShell title="人工复核台">
    <section class="page-stack fade-up">
      <div class="row-between">
        <h2 class="section-title">人工复核任务</h2>
        <button class="btn btn-secondary" :disabled="loading" @click="load">{{ loading ? '刷新中' : '刷新复核任务' }}</button>
      </div>

      <AppGlassSurface as="section" class="card">
        <div v-if="loading" class="state loading">复核任务加载中</div>
        <div v-else-if="error" class="state error">{{ error }}</div>
        <div v-else-if="rows.length === 0" class="state">暂无待复核任务。</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>任务编号</th>
                <th>商品名称</th>
                <th>平台</th>
                <th>市场</th>
                <th>风险等级</th>
                <th>系统建议</th>
                <th>提交时间</th>
                <th>当前状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rows" :key="item.reviewId || item.id">
                <td>{{ taskNumber(item) }}</td>
                <td>{{ item.productName || '-' }}</td>
                <td>{{ item.platform || '-' }}</td>
                <td>{{ item.market || '-' }}</td>
                <td><span :class="['tag', riskClass(item.riskLevel)]">{{ riskLabel(item.riskLevel) }}</span></td>
                <td>{{ decisionLabel(item.systemDecision) }}</td>
                <td>{{ toDateTime(item.submittedAt) }}</td>
                <td><span :class="['tag', statusClass(item.status)]">{{ statusLabel(item.status) }}</span></td>
                <td><button class="btn btn-primary" @click="openDetail(item.reviewId || item.id)">进入复核</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppGlassSurface>
    </section>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const error = ref('');
const rows = ref<any[]>([]);

function toDateTime(v?: string) {
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
  if (v.includes('严重') || v.includes('高')) return 'tag-danger';
  if (v.includes('中')) return 'tag-warning';
  return 'tag-success';
}

function taskNumber(item: any) {
  if (item.taskNo) return item.taskNo;
  const id = String(item.taskId || item.reviewId || item.id || '');
  return id ? `复核-${id.slice(-6).toUpperCase()}` : '待生成';
}
function riskLabel(value?: string) {
  const map: Record<string, string> = { LOW: '低风险', MEDIUM: '中风险', HIGH: '高风险', CRITICAL: '严重风险' };
  return map[String(value || '').toUpperCase()] || value || '待检测';
}
function decisionLabel(value?: string) {
  const map: Record<string, string> = { APPROVE: '可发布', REJECT: '人工复核', OPTIMIZE_AND_REVIEW: '优化后发布', HOLD: '暂缓发布' };
  return map[String(value || '').toUpperCase()] || value || '待检测';
}
function statusLabel(value?: string) {
  const map: Record<string, string> = { PENDING: '待复核', IN_PROGRESS: '复核中', APPROVED: '已通过', RETURNED: '退回优化', HOLD: '暂缓发布' };
  return map[String(value || '').toUpperCase()] || value || '待处理';
}

function statusClass(status?: string) {
  const v = statusLabel(status);
  if (v.includes('通过')) return 'tag-success';
  if (v.includes('暂缓')) return 'tag-danger';
  if (v.includes('待复核')) return 'tag-warning';
  return 'tag-default';
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    rows.value = await api.getReviewTasks();
  } catch (e) {
    error.value = getFriendlyError(e);
  } finally {
    loading.value = false;
  }
}

function openDetail(id: string) {
  const query = route.query.embed === '1' ? { embed: '1', theme: String(route.query.theme || '') || undefined } : undefined;
  router.push({ path: `/reviews/${id}`, query });
}

onMounted(load);
</script>
