<template>
  <main class="public-page team-page">
    <PublicSiteHeader @login="openLogin" @apply="openApply" />

    <section class="public-dark-hero team-hero">
      <div class="public-shell team-hero-layout">
        <div>
          <p class="public-kicker"><UsersRound :size="18" />团队介绍</p>
          <h1 class="public-title">
            <span class="public-title-line">围绕真实任务，</span>
            <span class="public-title-line">形成完整执行闭环</span>
          </h1>
          <p class="public-lead">学生核心团队负责执行与成果产出，导师顾问提供专业指导，产业资源协助场景验证，共同推进智选优发从需求调研走向产品验证。</p>
        </div>
        <div class="team-overview" aria-label="团队规模概览">
          <article v-for="item in overview" :key="item.label">
            <strong>{{ item.value }}</strong>
            <div><b>{{ item.label }}</b><span>{{ item.copy }}</span></div>
          </article>
        </div>
      </div>
    </section>

    <section class="public-section">
      <div class="public-shell">
        <div class="public-section-head center">
          <p class="public-kicker">核心岗位</p>
          <h2>八类能力覆盖项目推进的关键任务</h2>
          <p>团队分工以岗位和成果为中心，覆盖项目统筹、系统研发、商业测算、市场验证、产品规划、智能评估、规则建设与成果展示。</p>
        </div>
        <div class="role-grid">
          <article v-for="role in roles" :key="role.title" class="public-card role-card">
            <div class="role-card-head">
              <div class="icon-box"><component :is="role.icon" :size="23" /></div>
              <span>{{ role.index }}</span>
            </div>
            <h3>{{ role.title }}</h3>
            <p>{{ role.responsibility }}</p>
            <div class="role-output">
              <b>代表性产出</b>
              <ul>
                <li v-for="output in role.outputs" :key="output">{{ output }}</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="public-section soft">
      <div class="public-shell cycle-layout">
        <div class="public-section-head">
          <p class="public-kicker">能力闭环</p>
          <h2>从问题发现到持续迭代，每一步都有承接</h2>
          <p>不同岗位围绕同一产品目标协同，让业务问题能够转化为功能、规则、验证结果和下一轮改进。</p>
        </div>
        <ol class="team-cycle" aria-label="团队协作闭环">
          <li v-for="(step, index) in cycle" :key="step">
            <span>{{ String(index + 1).padStart(2, '0') }}</span><b>{{ step }}</b>
          </li>
        </ol>
      </div>
    </section>

    <section class="public-section">
      <div class="public-shell">
        <div class="public-section-head center">
          <p class="public-kicker">专业与产业支撑</p>
          <h2>专业指导校准方向，产业资源验证落地</h2>
          <p>支撑方不作为创业团队成员展示，仅提供专业指导、资源对接、场景验证或技术支持。</p>
        </div>
        <div class="support-layout">
          <section class="support-panel" aria-labelledby="advisor-support-title">
            <header><GraduationCap :size="26" /><div><span>5 位导师顾问</span><h3 id="advisor-support-title">五类专业指导方向</h3></div></header>
            <div class="advisor-list">
              <article v-for="(item, index) in advisorSupport" :key="item.title">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <div><b>{{ item.title }}</b><p>{{ item.copy }}</p></div>
              </article>
            </div>
          </section>
          <section class="support-panel" aria-labelledby="industry-support-title">
            <header><Network :size="26" /><div><span>3 类产业资源</span><h3 id="industry-support-title">三类场景验证支撑</h3></div></header>
            <div class="resource-list">
              <article v-for="resource in industrySupport" :key="resource.title">
                <b>{{ resource.title }}</b><p>{{ resource.copy }}</p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>

    <section class="public-section soft">
      <div class="public-shell">
        <div class="public-section-head center">
          <p class="public-kicker">推进机制</p>
          <h2>用明确机制保障任务持续交付</h2>
        </div>
        <div class="mechanism-grid">
          <article v-for="item in mechanisms" :key="item.title" class="public-card mechanism-card">
            <component :is="item.icon" :size="24" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.copy }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="public-section">
      <div class="public-shell public-cta">
        <div><p class="public-kicker">共同验证</p><h2>让真实业务场景成为产品迭代依据</h2><p>从一条真实发布任务开始，验证规则审校、风险解释与团队协作流程。</p></div>
        <button class="public-button primary" type="button" @click="openApply">申请共创 <ArrowRight :size="17" /></button>
      </div>
    </section>

    <PublicFooter />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Code2,
  DatabaseZap,
  FileArchive,
  Flag,
  GraduationCap,
  LineChart,
  Megaphone,
  MessageSquareText,
  Network,
  Palette,
  PanelsTopLeft,
  ShieldCheck,
  UsersRound,
} from 'lucide-vue-next';
import PublicSiteHeader from '@/components/PublicSiteHeader.vue';
import PublicFooter from '@/components/PublicFooter.vue';
import { usePublicScrollReveal } from '@/composables/usePublicScrollReveal';

const router = useRouter();
usePublicScrollReveal();

const overview = [
  { value: '8', label: '名核心成员', copy: '承担八个关键岗位' },
  { value: '5', label: '位导师顾问', copy: '覆盖五类专业方向' },
  { value: '3', label: '类产业资源', copy: '支持验证与落地' },
];

const roles = [
  { index: '01', title: '项目统筹', icon: Flag, responsibility: '统筹项目进度、协调任务与资源，承接项目整体推进和成果组织。', outputs: ['项目计划书与路演框架', '八类岗位阶段协同'] },
  { index: '02', title: '技术开发', icon: Code2, responsibility: '负责前后端开发、系统架构、云端部署、模型接口调用与基础测试。', outputs: ['系统 MVP 架构与核心页面', '前后端联调及基础功能测试'] },
  { index: '03', title: '财务测算', icon: LineChart, responsibility: '负责成本预算、收入预测、收益测算和产品定价逻辑。', outputs: ['三年收入、成本与利润模型', '盈亏平衡与敏感性分析'] },
  { index: '04', title: '运营推广', icon: Megaphone, responsibility: '负责目标用户调研、竞品分析、推广路径设计和市场验证。', outputs: ['28 份有效客户调研', '试用到续费的转化漏斗'] },
  { index: '05', title: '产品规划', icon: PanelsTopLeft, responsibility: '负责需求分析、功能规划、产品流程设计和用户体验优化。', outputs: ['七层系统功能结构', 'MVP 核心功能与报告模板'] },
  { index: '06', title: '算法模型', icon: BrainCircuit, responsibility: '负责 AIGC 应用、多模态识别和智能评估逻辑设计。', outputs: ['多模态评估指标体系', '规则引擎与评分模型路径'] },
  { index: '07', title: '规则库建设', icon: DatabaseZap, responsibility: '负责平台规则、案例样本、目标市场规范及规则维护流程。', outputs: ['平台规则库字段结构', '规则采集、审核、更新与验证 SOP'] },
  { index: '08', title: '视觉展示', icon: Palette, responsibility: '负责路演材料、系统界面和成果展示的视觉表达。', outputs: ['系统界面与截图优化', '路演视觉风格与图表呈现'] },
];

const cycle = ['调研', '规划', '开发', '测试', '展示', '反馈', '迭代'];
const advisorSupport = [
  { title: '外贸实务', copy: '校准跨境商品发布与外贸业务流程。' },
  { title: '人工智能技术', copy: '指导技术路线、系统架构与智能评估。' },
  { title: '商业模式与财务', copy: '完善定价逻辑、成本收益与可行性测算。' },
  { title: '跨境运营', copy: '验证平台运营、目标市场与应用场景。' },
  { title: '供应链数字化', copy: '衔接跨境服务链路与产业协同。' },
];
const industrySupport = [
  { title: '实验验证', copy: '提供规范实验环境，支持模型测试、鲁棒性验证和结果复核。' },
  { title: '业务样本', copy: '提供脱敏素材、区域规则样本和真实业务场景经验。' },
  { title: '技术架构', copy: '支持系统稳定性、扩展能力和企业级架构设计验证。' },
];
const mechanisms = [
  { title: '目标管理', copy: '按研发、市场验证、材料完善与商业化探索设置阶段成果。', icon: Flag },
  { title: '进度管理', copy: '分解开发、样本、规则、调研与展示任务，明确节点和责任。', icon: BarChart3 },
  { title: '质量管理', copy: '系统功能和展示材料经过内部测试与专业反馈后再交付。', icon: ShieldCheck },
  { title: '反馈管理', copy: '收集使用反馈和验证结果，转化为需求池与后续迭代计划。', icon: MessageSquareText },
  { title: '成果归档', copy: '持续沉淀产品、文档、数据、市场与知识产权类成果。', icon: FileArchive },
];

function openLogin() { router.push({ path: '/home-public', query: { auth: 'login' } }); }
function openApply() { router.push({ path: '/home-public', query: { apply: 'pilot' } }); }
</script>

<style scoped>
.team-hero{min-height:540px}.team-hero-layout{min-height:540px;display:grid;grid-template-columns:1fr .82fr;gap:64px;align-items:center}.team-overview{display:grid;gap:12px}.team-overview article{padding:20px 22px;display:grid;grid-template-columns:72px 1fr;align-items:center;gap:18px;border:1px solid #2f6da9;border-radius:14px;background:rgba(6,30,66,.92);box-shadow:0 18px 45px rgba(0,0,0,.16)}.team-overview strong{font-size:40px;line-height:1;color:#59ddf5;text-align:center}.team-overview div{display:grid;gap:3px}.team-overview b{color:#fff;font-size:17px}.team-overview span{color:#9fb1cd;font-size:13px}.role-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.role-card{display:flex;flex-direction:column;min-height:360px}.role-card-head{display:flex;align-items:center;justify-content:space-between}.role-card-head>span{color:#315b8e;font-size:27px;font-weight:900}.role-card>p{min-height:84px}.role-output{margin-top:auto;padding-top:20px;border-top:1px solid #28517e}.role-output>b{color:#77e2f4;font-size:13px}.role-output ul{margin:10px 0 0;padding-left:20px;color:#b8c8de}.role-output li{margin-top:6px;line-height:1.6}.cycle-layout{display:grid;grid-template-columns:.75fr 1.25fr;gap:70px;align-items:center}.team-cycle{margin:0;padding:0;display:grid;grid-template-columns:repeat(7,1fr);list-style:none}.team-cycle li{position:relative;min-height:116px;display:grid;place-items:center;align-content:center;gap:5px;border:1px solid #2b5e92;border-left:0;background:rgba(7,31,67,.9)}.team-cycle li:first-child{border-left:1px solid #2b5e92;border-radius:14px 0 0 14px}.team-cycle li:last-child{border-radius:0 14px 14px 0}.team-cycle li:not(:last-child)::after{content:"";position:absolute;z-index:2;right:-6px;width:10px;height:10px;border-top:2px solid #59ddf5;border-right:2px solid #59ddf5;transform:rotate(45deg)}.team-cycle span{color:#4b7caf;font-size:12px;font-weight:900}.team-cycle b{color:#fff;font-size:15px}.support-layout{display:grid;grid-template-columns:1fr 1fr;gap:20px}.support-panel{padding:30px;border:1px solid #2b5e92;border-radius:16px;background:rgba(7,31,67,.92)}.support-panel>header{display:flex;align-items:center;gap:14px;color:#59ddf5}.support-panel header div{display:grid}.support-panel header span{color:#8fa5c4;font-size:12px;font-weight:800}.support-panel h3{margin:2px 0 0;color:#fff;font-size:23px}.advisor-list{margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.advisor-list article{min-height:92px;padding:14px;display:grid;grid-template-columns:30px 1fr;gap:10px;align-items:start;border:1px solid #285b8f;border-radius:10px;background:#0a294f}.advisor-list article:last-child{grid-column:1 / -1;min-height:82px}.advisor-list>article>span{width:27px;height:27px;display:grid;place-items:center;border-radius:8px;background:#0c4778;color:#78e2f4;font-size:11px;font-weight:900}.advisor-list article div{display:grid;gap:4px}.advisor-list b{color:#fff;line-height:1.35}.advisor-list p{margin:0;color:#aebfd8;font-size:13px;line-height:1.55}.resource-list{margin-top:24px;display:grid;gap:12px}.resource-list article{padding:15px 17px;border-left:3px solid #38d7ff;background:#0a294f}.resource-list b{color:#fff}.resource-list p{margin:4px 0 0;color:#aebfd8;line-height:1.65}.mechanism-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}.mechanism-card{min-height:230px}.mechanism-card>svg{color:#59ddf5}.mechanism-card h3{margin-top:18px}@media(max-width:1150px){.role-grid{grid-template-columns:repeat(2,1fr)}.mechanism-grid{grid-template-columns:repeat(3,1fr)}.team-hero-layout{grid-template-columns:1fr;padding:64px 0;gap:36px}.team-overview{grid-template-columns:repeat(3,1fr)}.team-overview article{grid-template-columns:1fr;text-align:center}.team-overview div{justify-items:center}}@media(max-width:900px){.cycle-layout{grid-template-columns:1fr;gap:28px}.team-cycle{grid-template-columns:repeat(4,1fr)}.team-cycle li,.team-cycle li:first-child,.team-cycle li:last-child{border:1px solid #2b5e92;border-radius:10px}.team-cycle li:not(:last-child)::after{display:none}.support-layout{grid-template-columns:1fr}}@media(max-width:640px){.team-overview{grid-template-columns:1fr}.team-overview article{grid-template-columns:66px 1fr;text-align:left}.team-overview div{justify-items:start}.role-grid,.mechanism-grid{grid-template-columns:1fr}.role-card{min-height:0}.role-card>p{min-height:0}.team-cycle{grid-template-columns:repeat(2,1fr)}.support-panel{padding:24px}.advisor-list{grid-template-columns:1fr}.advisor-list article:last-child{grid-column:auto}}
</style>
