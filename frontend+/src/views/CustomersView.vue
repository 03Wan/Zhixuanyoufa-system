<template>
  <AppShell title="客户档案">
    <section class="page-stack fade-up">
      <section class="glass card">
        <h2 class="section-title">客户档案</h2>
        <div class="grid-3">
          <input class="input" v-model="form.name" placeholder="客户名称" />
          <select class="input" v-model="form.customerType">
            <option value="">请选择客户类型</option>
            <option v-for="item in customerTypeOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <input class="input" v-model="form.contactPerson" placeholder="联系人" />
          <input class="input" v-model="form.contactPhone" placeholder="联系方式" />
          <select class="input" v-model="form.industry">
            <option value="">请选择所属行业</option>
            <option v-for="item in industryOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <select class="input" v-model="form.targetPlatform">
            <option value="">请选择目标平台</option>
            <option v-for="item in platformOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <select class="input" v-model="form.targetMarket">
            <option value="">请选择目标市场</option>
            <option v-for="item in marketOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <select class="input" v-model="form.planType">
            <option value="">请选择套餐类型</option>
            <option v-for="item in planOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <select class="input" v-model="form.serviceStatus">
            <option v-for="item in statusOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
        <textarea class="input" style="margin-top:8px;" v-model="form.remark" placeholder="备注"></textarea>
        <div class="actions" style="margin-top:8px;"><button class="btn btn-primary" :disabled="saving" @click="create">{{ saving ? '保存中' : '新增客户' }}</button></div>
      </section>

      <section class="glass card">
        <div class="row-between"><h3>客户列表</h3><button class="btn btn-secondary" :disabled="loading" @click="load">{{ loading ? '刷新中' : '刷新' }}</button></div>
        <div v-if="loading" class="state loading center-loading">客户数据加载中</div>
        <table v-else class="table">
          <thead><tr><th>客户名称</th><th>类型</th><th>联系人</th><th>行业</th><th>平台/市场</th><th>套餐</th><th>状态</th></tr></thead>
          <tbody>
            <tr v-for="c in rows" :key="c.id">
              <td>{{ c.name }}</td><td>{{ c.customerType||'-' }}</td><td>{{ c.contactPerson||'-' }} / {{ c.contactPhone||'-' }}</td><td>{{ c.industry||'-' }}</td><td>{{ c.targetPlatform||'-' }} / {{ c.targetMarket||'-' }}</td><td>{{ c.planType||'-' }}</td><td>{{ c.serviceStatus||'-' }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
import { notify } from '@/lib/dialog';

const rows = ref<any[]>([]);
const form = reactive<any>({ name:'', customerType:'', contactPerson:'', contactPhone:'', industry:'', targetPlatform:'', targetMarket:'', planType:'', serviceStatus:'试点中', remark:'' });
const loading = ref(true);
const saving = ref(false);
const customerTypeOptions = ['试点客户', '中小卖家', '代运营机构', '品牌企业', '产业带机构', '服务商平台'];
const industryOptions = ['跨境电商', '品牌出海', '代运营服务', '外贸服务', '教育实训', '产业带服务'];
const platformOptions = ['Amazon', 'Shopee', 'TikTok Shop', 'Lazada', 'eBay', 'Walmart', '独立站', '多平台'];
const marketOptions = ['欧美', '中东', '东南亚', '日本', '全球通用', '多市场'];
const planOptions = ['体验包/按次检测', '基础版', '专业版', '企业版', '定制版', 'API接口版'];
const statusOptions = ['试点中', '服务中', '待开通', '已暂停'];

async function load() {
  loading.value = true;
  try {
    rows.value = await api.getCustomersList() as any[];
  } catch (e) {
    await notify(getFriendlyError(e));
  } finally {
    loading.value = false;
  }
}
async function create() {
  saving.value = true;
  try {
    if (!form.name) {
      await notify('请输入客户名称');
      return;
    }
    await api.createCustomer({ ...form });
    Object.assign(form, { name:'', customerType:'', contactPerson:'', contactPhone:'', industry:'', targetPlatform:'', targetMarket:'', planType:'', serviceStatus:'试点中', remark:'' });
    await load();
  } catch (e) { await notify(getFriendlyError(e)); }
  finally { saving.value = false; }
}

onMounted(load);
</script>

<style scoped>
.grid-3 { display:grid; gap:8px; grid-template-columns: repeat(3,minmax(0,1fr)); }
.table { width:100%; border-collapse: collapse; }
.table th,.table td { border-bottom:1px solid var(--border); padding:8px; }
.actions { display:flex; gap:8px; }
.center-loading { min-height: 260px; }
@media (max-width:900px){ .grid-3{ grid-template-columns:1fr; } }
</style>
