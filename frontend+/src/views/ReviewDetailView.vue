<template>
  <AppShell title="复核详情">
    <section class="page-stack fade-up" v-if="detail">
      <div class="row-between">
        <h2 class="section-title">复核详情：{{ detail.taskNo || '-' }}</h2>
        <button class="btn btn-secondary" @click="back">返回复核台</button>
      </div>

      <AppGlassSurface as="section" class="card block">
        <h3>商品基础信息</h3>
        <div class="grid-2">
          <p><b>商品名称：</b>{{ detail.productName || '-' }}</p>
          <p><b>平台/市场：</b>{{ detail.platform || '-' }} / {{ detail.market || '-' }}</p>
          <p><b>风险等级：</b>{{ detail.riskLevel || '-' }}</p>
          <p><b>当前状态：</b>{{ detail.status || '-' }}</p>
        </div>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card block">
        <h3>原始素材内容</h3>
        <p><b>商品标题：</b>{{ detail.task?.materialContent?.title || '-' }}</p>
        <p><b>核心卖点：</b>{{ formatAsLine(detail.task?.materialContent?.sellingPoints) }}</p>
        <p><b>详情页文案：</b>{{ detail.task?.materialContent?.detailText || '-' }}</p>
        <p><b>广告语：</b>{{ detail.task?.materialContent?.adText || '-' }}</p>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card block">
        <h3>系统评估结果</h3>
        <p class="score">{{ detail.result?.score ?? detail.result?.totalScore ?? '-' }} 分</p>
        <p>系统建议：{{ detail.systemDecision || detail.result?.decision || '-' }}</p>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card block">
        <h3>历史处理记录</h3>
        <div v-if="!detail.history?.length" class="state">暂无处理记录。</div>
        <table v-else>
          <thead>
            <tr><th>时间</th><th>操作</th><th>处理结论</th><th>原因</th><th>意见</th></tr>
          </thead>
          <tbody>
            <tr v-for="(h, idx) in detail.history" :key="idx">
              <td>{{ toDateTime(h.time) }}</td>
              <td>{{ h.action || '-' }}</td>
              <td>{{ h.decision || '-' }}</td>
              <td>{{ h.reason || '-' }}</td>
              <td>{{ h.comment || h.note || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </AppGlassSurface>

      <AppGlassSurface as="section" class="card block">
        <h3>复核处理</h3>
        <div v-if="!canReview" class="state">当前账号仅可查看复核状态，无处理权限。</div>
        <div class="grid-2">
          <div>
            <label>处理结论 *</label>
            <select v-model="form.decision" :disabled="!canReview">
              <option value="通过发布">通过发布</option>
              <option value="退回优化">退回优化</option>
              <option value="暂缓发布">暂缓发布</option>
            </select>
          </div>
          <div>
            <label>处理原因 *</label>
            <input class="input" v-model.trim="form.reason" placeholder="请输入处理原因" :disabled="!canReview" />
          </div>
        </div>
        <div>
          <label>复核意见 *</label>
          <textarea rows="3" v-model.trim="form.comment" placeholder="请输入复核意见" :disabled="!canReview"></textarea>
        </div>
        <div class="actions">
          <button class="btn btn-primary" :disabled="submitting || !canReview" @click="submit">{{ submitting ? '提交中...' : '提交复核结果' }}</button>
        </div>
      </AppGlassSurface>
    </section>

    <AppGlassSurface v-else-if="loadError" as="section" class="card state">{{ loadError }}</AppGlassSurface>
    <AppGlassSurface v-else as="section" class="card state">复核任务不存在或已删除。</AppGlassSurface>
  </AppShell>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError, getUserProfile } from '@/lib/api';
import { notify } from '@/lib/dialog';

const route = useRoute();
const router = useRouter();
const detail = ref<any>(null);
const loadError = ref('');
const submitting = ref(false);
const currentUser = getUserProfile() as any;
const canReview = currentUser?.role === 'REVIEWER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SYSTEM_ADMIN';
const form = reactive({ decision: '通过发布' as '通过发布' | '退回优化' | '暂缓发布', reason: '', comment: '' });

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

function formatAsLine(value: unknown) {
  if (Array.isArray(value)) return value.join('；');
  if (value == null) return '-';
  return String(value);
}

async function load() {
  loadError.value = '';
  try {
    detail.value = await api.getReviewDetail(String(route.params.id || ''));
  } catch (error) {
    detail.value = null;
    loadError.value = getFriendlyError(error);
    return;
  }
  if (canReview) {
    try {
      await api.startReview(String(route.params.id || ''));
    } catch {
      // A claim failure must never replace a successfully loaded review with an empty screen.
    }
  }
}

function back() {
  const query = route.query.embed === '1' ? { embed: '1', theme: String(route.query.theme || '') || undefined } : undefined;
  router.push({ path: '/reviews', query });
}

async function submit() {
  if (!form.reason || !form.comment) {
    await notify('请填写处理原因和复核意见。');
    return;
  }
  submitting.value = true;
  try {
    await api.submitReviewDecision(String(route.params.id || ''), { ...form });
    await notify('复核结果已提交。任务状态、发布决策和报告意见已更新。');
    await load();
  } catch (e) {
    await notify(getFriendlyError(e));
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.block { display: grid; gap: 10px; }
.score { font-size: 34px; font-weight: 800; margin: 0; color: var(--brand-1); }
.actions { display: flex; justify-content: flex-end; }
</style>
