<template>
  <div class="app-layout" :class="{ embedded: isEmbedded, collapsed }">
    <aside v-if="!isEmbedded" class="glass side-nav fade-up" :class="{ open, collapsed }">
      <div class="brand-block">
        <div class="brand-top">
          <div class="brand-logo">智</div>
          <div v-if="!collapsed">
            <h1>智选优发</h1>
          </div>
        </div>
        <div class="role-chip" :class="{ compact: collapsed }">{{ collapsed ? roleLabel : `当前角色：${roleLabel}` }}</div>
      </div>

      <nav class="side-groups">
        <section v-for="group in groupedLinks" :key="group.key" class="menu-group">
          <button
            type="button"
            class="menu-group-title group-toggle"
            :title="group.label"
            @click="toggleGroup(group.key)"
          >
            <span>{{ collapsed ? shortGroupLabel(group.label) : group.label }}</span>
            <component :is="expandedGroups[group.key] ? ChevronDown : ChevronRight" :size="14" />
          </button>
          <div class="side-links" v-show="expandedGroups[group.key]">
            <button
              v-for="item in group.items"
              :key="item.href"
              type="button"
              :ref="(el) => setMenuRef(el, item.href)"
              class="side-link"
              :class="{ active: isSidebarActive(item.href) }"
              @click="openEmbeddedTab(item)"
              @mouseenter="handleMenuEnter($event, item.href)"
              @mousemove="handleMenuMove"
              @mouseleave="handleMenuLeave"
            >
              <component :is="menuIcon(item.key)" :size="16" />
              <span v-if="!collapsed">{{ item.label }}</span>
              <b v-if="item.key === 'applications' && pendingApplicationCount" class="application-notice-count">{{ pendingApplicationCount }}</b>
            </button>
          </div>
        </section>
      </nav>

      <div
        v-if="hoverTip.visible"
        class="menu-cursor-tip"
        :style="{ left: `${hoverTip.x}px`, top: `${hoverTip.y}px` }"
      >
        {{ hoverTip.text }}
      </div>

      <div class="side-actions">
        <div class="side-utility-actions">
          <button class="btn btn-secondary nav-toggle" :title="collapsed ? '展开侧边栏' : '收起侧边栏'" @click="toggleSidebar">
            <component :is="collapsed ? PanelLeftOpen : PanelLeftClose" :size="16" />
            <span v-if="!collapsed">{{ collapsed ? '展开侧边栏' : '收起侧边栏' }}</span>
          </button>
          <ThemeToggle :compact="collapsed" />
        </div>
        <button class="btn btn-secondary logout-btn" :title="collapsed ? '退出登录' : ''" @click="logout">
          <LogOut :size="16" />
          <span v-if="!collapsed">退出登录</span>
        </button>
      </div>
    </aside>

    <div v-if="dialog.open" class="modal-mask app-dialog-mask" @click.self="resolveDialog(false)">
      <AppGlassSurface as="section" class="card modal-panel app-dialog-panel">
        <h3 class="section-title">{{ dialog.title }}</h3>
        <p>{{ dialog.message }}</p>
        <div class="actions dialog-actions">
          <button v-if="dialog.kind === 'confirm'" class="btn btn-secondary" @click="resolveDialog(false)">取消</button>
          <button class="btn btn-primary" @click="resolveDialog(true)">{{ dialog.kind === 'confirm' ? '确认' : '知道了' }}</button>
        </div>
      </AppGlassSurface>
    </div>

    <div v-if="toasts.length" class="toast-stack" aria-live="polite" aria-atomic="true">
      <div
        v-for="item in toasts"
        :key="item.id"
        class="toast-item"
        :class="[`toast-${item.kind}`]"
      >
        {{ item.message }}
      </div>
    </div>

    <div class="app-shell">
      <main class="page-stack content-body" :class="{ 'embed-content-body': isEmbedded }">
        <template v-if="!isEmbedded">
          <div v-if="showWorkspaceTabs" class="workspace-tabs glass">
            <button
              v-for="tab in allTabs"
              :key="tab.id"
              type="button"
              class="workspace-tab"
              :class="{ active: activeTabId === tab.id }"
              @click="activeTabId = tab.id"
            >
              <span>{{ tab.label }}</span>
              <span v-if="tab.closable" class="tab-close" @click.stop="closeTab(tab.id)">×</span>
            </button>
          </div>

          <section class="workspace-panel">
            <div v-if="activeTabId === baseTabId" class="workspace-pane">
              <slot />
            </div>
            <div
              v-for="tab in embeddedTabs"
              :key="`pane-${tab.id}`"
              v-show="activeTabId === tab.id"
              class="workspace-pane iframe-pane"
            >
              <iframe :ref="setIframeRef" :src="tab.href" class="embedded-frame" :title="tab.label" />
            </div>
          </section>
        </template>

        <template v-else>
          <section class="workspace-pane embedded-plain">
            <slot />
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">

import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { House, BarChart3, ListTodo, ShieldCheck, ClipboardCheck, FileText, BookKey, Users, Logs, SlidersHorizontal, PanelLeftClose, PanelLeftOpen, LogOut, ChevronDown, ChevronRight, Bell } from "lucide-vue-next";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { api, getUserProfile } from "@/lib/api";
import { getRoleMenus, normalizeRole, ROLE_LABELS } from "@/lib/permissions";

const props = defineProps<{ title: string }>();
const route = useRoute();
const router = useRouter();
const open = ref(false);
const collapsed = ref(false);
const hoverTip = ref({ visible: false, text: "", x: 0, y: 0 });
const expandedGroups = ref<Record<string, boolean>>({});
const dialog = ref({
  open: false,
  kind: "alert" as "alert" | "confirm",
  title: "提示",
  message: "",
  resolve: null as null | ((value: boolean) => void),
});
const toasts = ref<Array<{ id: number; message: string; kind: "success" | "error" | "info" }>>([]);
let toastSeq = 0;
const toastTimers = new Map<number, ReturnType<typeof setTimeout>>();
const pendingApplicationCount = ref(0);
let applicationNotificationTimer: ReturnType<typeof setInterval> | null = null;

const baseTabId = "__base__";
const activeTabId = ref<string>(baseTabId);
const embeddedTabs = ref<Array<{ id: string; label: string; href: string }>>([]);
const isEmbedded = computed(() => {
  const byQuery = String(route.query.embed || "") === "1";
  const byIframe = typeof window !== "undefined" && window.self !== window.top;
  return byQuery || byIframe;
});
const iframeRefs = ref<HTMLIFrameElement[]>([]);
const menuRefs = new Map<string, HTMLElement>();

const allTabs = computed(() => [
  { id: baseTabId, label: props.title, closable: false },
  ...embeddedTabs.value.map((tab) => ({ id: tab.id, label: tab.label, closable: true })),
]);
const showWorkspaceTabs = computed(() => false);

const descByPath: Record<string, string> = {
  "/home": "总览任务进度、风险分布与报告动态",
  "/dashboard": "通过图表分析近7天检测趋势与风险结构",
  "/plans": "查看当前套餐能力、额度与升级申请入口",
  "/my-plan": "查看当前套餐、额度使用与升级建议",
  "/batch": "批量检测：支持表格批量录入与批量创建任务",
  "/companies": "企业组织管理：企业信息、成员、任务与报告关联",
  "/customers": "客户档案管理：企业客户信息与服务状态跟踪",
  "/tasks/new": "创建、编辑并跟踪检测任务",
  "/results": "查看评分、风险、建议与发布决策",
  "/reviews": "处理高风险与需人工确认任务",
  "/reports": "统一管理检测报告与打印下载",
  "/applications": "查看企业账号与服务开通申请",
  "/rules": "维护规则策略与敏感触发条件",
  "/users": "管理账号角色、状态与访问权限",
  "/logs": "追踪关键操作与系统审计记录",
  "/model-config": "配置大模型 API 与检测策略",
  "/api-open": "API接口服务：开放能力清单与申请入口",
  "/report-templates": "正式报告模板管理（版）",
};

const currentUser = computed(() => (getUserProfile() || {}) as any);
const roleLabel = computed(() => ROLE_LABELS[normalizeRole(currentUser.value?.role)]);
const isSystemAdmin = computed(() => normalizeRole(currentUser.value?.role) === 'SYSTEM_ADMIN');
const links = computed(() => getRoleMenus(currentUser.value?.role));
const groupedLinks = computed(() => {
  const groups = [
    { key: "workspace", label: "工作台", keys: ["home", "dashboard"] },
    { key: "billing", label: "套餐与商业化", keys: ["plans", "myPlan"] },
    { key: "biz", label: "业务管理", keys: ["batch", "tasks", "results", "reviews", "reports", "customers"] },
    { key: "org", label: "组织与企业", keys: ["companies"] },
    { key: "sys", label: "系统管理", keys: ["applications", "rules", "users", "logs", "modelConfig", "apiOpen", "templates"] },
  ];
  return groups
    .map((g) => ({ ...g, items: links.value.filter((item: any) => g.keys.includes(item.key)) }))
    .filter((g) => g.items.length > 0);
});

watch(
  groupedLinks,
  (groups) => {
    const next: Record<string, boolean> = {};
    for (const g of groups) next[g.key] = expandedGroups.value[g.key] ?? true;
    expandedGroups.value = next;
  },
  { immediate: true },
);

function normalizePath(path: string) {
  return path.startsWith("/tasks/") ? "/tasks/new" : path;
}

function isMenuActive(href: string) {
  return normalizePath(route.path) === normalizePath(href);
}

function isSidebarActive(href: string) {
  return normalizePath(href) !== "/home" && isMenuActive(href);
}

function setMenuRef(el: any, href: string) {
  const key = normalizePath(href);
  if (el instanceof HTMLElement) menuRefs.set(key, el);
  else menuRefs.delete(key);
}

function scrollActiveMenuIntoView() {
  const el = menuRefs.get(normalizePath(route.path));
  el?.scrollIntoView({ block: "center", inline: "nearest" });
}

function shortGroupLabel(label: string) {
  const map: Record<string, string> = {
    工作台: "工作",
    套餐与商业化: "套餐",
    业务管理: "业务",
    组织与企业: "组织",
    系统管理: "系统",
  };
  return map[label] || label.slice(0, 2);
}

function handleMenuEnter(e: MouseEvent, href: string) {
  const hit = links.value.find((item: any) => normalizePath(item.href) === normalizePath(href));
  hoverTip.value = {
    visible: true,
    text: collapsed.value ? (hit?.label || "菜单") : (descByPath[normalizePath(href)] || hit?.label || "业务页面"),
    x: e.clientX + 14,
    y: e.clientY + 14,
  };
}

function handleMenuMove(e: MouseEvent) {
  if (!hoverTip.value.visible) return;
  hoverTip.value = { ...hoverTip.value, x: e.clientX + 14, y: e.clientY + 14 };
}

function handleMenuLeave() {
  hoverTip.value.visible = false;
}

async function refreshApplicationNotifications() {
  if (!isSystemAdmin.value) return;
  try {
    pendingApplicationCount.value = (await api.getNotifications()).length;
  } catch {
    // 通知读取失败不影响工作台其他功能。
  }
}

function toEmbedHref(href: string) {
  const theme = localStorage.getItem("theme") || "light";
  return href.includes("?") ? `${href}&embed=1&theme=${theme}` : `${href}?embed=1&theme=${theme}`;
}

function openEmbeddedTab(item: { href: string; label: string }) {
  const target = normalizePath(item.href);
  const query = isEmbedded.value
    ? { embed: "1", theme: String(route.query.theme || "") || undefined }
    : undefined;
  router.push({ path: target, query });
  embeddedTabs.value = [];
  activeTabId.value = baseTabId;
  open.value = false;
}

function closeTab(id: string) {
  const idx = embeddedTabs.value.findIndex((tab) => tab.id === id);
  if (idx === -1) return;
  embeddedTabs.value.splice(idx, 1);
  if (activeTabId.value === id) activeTabId.value = baseTabId;
}

function setIframeRef(el: any) {
  if (!(el instanceof HTMLIFrameElement)) return;
  if (!iframeRefs.value.includes(el)) iframeRefs.value.push(el);
}

function applyTheme(theme: string) {
  const dark = theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
}

function syncEmbeddedFramesTheme(theme: string) {
  for (const frame of iframeRefs.value) {
    frame.contentWindow?.postMessage({ type: "theme-sync", theme }, window.location.origin);
  }
}

function notifyEmbeddedActivated() {
  for (const frame of iframeRefs.value) {
    frame.contentWindow?.postMessage({ type: "embedded-activated", tabId: activeTabId.value }, window.location.origin);
  }
}

function handleStorageTheme(e: StorageEvent) {
  if (e.key !== "theme") return;
  const theme = e.newValue || "light";
  applyTheme(theme);
}

function handleMessageTheme(e: MessageEvent) {
  if (e.origin !== window.location.origin) return;
  const payload = (e.data || {}) as any;
  if (payload.type !== "theme-sync") return;
  applyTheme(payload.theme === "dark" ? "dark" : "light");
}

function handleDialogEvent(e: Event) {
  const detail = (e as CustomEvent).detail || {};
  dialog.value = {
    open: true,
    kind: detail.kind === "confirm" ? "confirm" : "alert",
    title: detail.title || "提示",
    message: detail.message || "",
    resolve: typeof detail.resolve === "function" ? detail.resolve : null,
  };
}

function resolveDialog(value: boolean) {
  const done = dialog.value.resolve;
  dialog.value.open = false;
  dialog.value.resolve = null;
  done?.(value);
}

function removeToast(id: number) {
  toasts.value = toasts.value.filter((item) => item.id !== id);
  const timer = toastTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    toastTimers.delete(id);
  }
}

function handleToastEvent(e: Event) {
  const detail = (e as CustomEvent).detail || {};
  const message = String(detail.message || "").trim();
  if (!message) return;
  const kind = ["success", "error", "info"].includes(String(detail.kind)) ? detail.kind : "success";
  const duration = Math.max(1200, Number(detail.duration || 2200));
  const id = ++toastSeq;
  toasts.value.push({ id, message, kind });
  const timer = setTimeout(() => removeToast(id), duration);
  toastTimers.set(id, timer);
}

let themeObserver: MutationObserver | null = null;

onMounted(() => {
  const theme = localStorage.getItem("theme") || "light";
  applyTheme(theme);
  collapsed.value = localStorage.getItem("zyyf_sidebar_collapsed") === "1";
  window.addEventListener("storage", handleStorageTheme);
  window.addEventListener("message", handleMessageTheme);
  window.addEventListener("zyyf-dialog", handleDialogEvent);
  window.addEventListener("zyyf-toast", handleToastEvent);

  if (!isEmbedded.value) {
    themeObserver = new MutationObserver(() => {
      const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
      syncEmbeddedFramesTheme(current);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }
  setTimeout(scrollActiveMenuIntoView, 0);
  void refreshApplicationNotifications();
  applicationNotificationTimer = setInterval(() => { void refreshApplicationNotifications(); }, 30_000);
});

watch(activeTabId, () => {
  if (!isEmbedded.value) notifyEmbeddedActivated();
});

watch(
  () => route.path,
  () => setTimeout(scrollActiveMenuIntoView, 0),
);

onBeforeUnmount(() => {
  window.removeEventListener("storage", handleStorageTheme);
  window.removeEventListener("message", handleMessageTheme);
  window.removeEventListener("zyyf-dialog", handleDialogEvent);
  window.removeEventListener("zyyf-toast", handleToastEvent);
  for (const timer of toastTimers.values()) clearTimeout(timer);
  toastTimers.clear();
  if (applicationNotificationTimer) clearInterval(applicationNotificationTimer);
  themeObserver?.disconnect();
});

function menuIcon(key: string) {
  const map: Record<string, any> = {
    home: House,
    dashboard: BarChart3,
    plans: ShieldCheck,
    myPlan: FileText,
    batch: ListTodo,
    companies: Users,
    customers: Users,
    tasks: ListTodo,
    results: ShieldCheck,
    reviews: ClipboardCheck,
    reports: FileText,
    applications: Bell,
    rules: BookKey,
    users: Users,
    logs: Logs,
    modelConfig: SlidersHorizontal,
    apiOpen: SlidersHorizontal,
    templates: FileText,
  };
  return map[key] || House;
}

function logout() {
  api.logout();
  router.push("/home-public");
}

function toggleSidebar() {
  collapsed.value = !collapsed.value;
  localStorage.setItem("zyyf_sidebar_collapsed", collapsed.value ? "1" : "0");
  handleMenuLeave();
}

function toggleGroup(key: string) {
  expandedGroups.value = { ...expandedGroups.value, [key]: !expandedGroups.value[key] };
}
</script>

<style scoped>
.brand-block { display: grid; gap: 10px; }
.brand-top { display: flex; align-items: center; gap: 10px; }
.nav-toggle { min-height: 34px; height: 34px; padding: 0 10px; border-radius: 10px; }
.brand-logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--brand-0), var(--brand-1));
  color: #fff;
  font-weight: 800;
  display: grid;
  place-items: center;
}
.brand-block h1 { margin: 0; font-size: 24px; line-height: 1.1; }
.role-chip {
  border: 1px solid var(--border);
  background: var(--card-strong);
  color: var(--muted);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
}
.role-chip.compact {
  text-align: center;
  padding: 6px 8px;
  line-height: 1.25;
}

.side-groups { display: grid; gap: 12px; align-content: start; }
.menu-group { display: grid; gap: 8px; }
.menu-group-title { margin: 0; font-size: 12px; color: var(--muted); letter-spacing: 0.5px; }
.group-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
  min-height: 22px;
}

.side-links { display: grid; gap: 6px; }
.side-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 10px;
  text-align: left;
  position: relative;
}
.side-link:hover { background: color-mix(in srgb, var(--card) 85%, #fff 15%); }
.side-link.active {
  border-color: color-mix(in srgb, var(--brand-1) 55%, var(--border) 45%);
  background: color-mix(in srgb, var(--brand-1) 16%, var(--card-strong) 84%);
  color: var(--text);
  box-shadow: none;
}
.application-notice-count {
  min-width: 18px;
  height: 18px;
  margin-left: auto;
  display: grid;
  place-items: center;
  padding: 0 4px;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  line-height: 1;
}

.menu-cursor-tip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  max-width: 280px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 10px;
  color: var(--text);
  background: var(--card-strong);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
  font-size: 12px;
  line-height: 1.4;
}

.side-actions {
  margin-top: 6px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
  display: grid;
  gap: 12px;
}
.side-utility-actions { display: grid; gap: 8px; }
.dialog-actions {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
.app-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 18px;
}
.app-dialog-panel {
  width: fit-content;
  min-width: min(360px, calc(100vw - 36px));
  max-width: min(680px, calc(100vw - 36px));
}
.app-dialog-panel p { margin: 0 0 14px; color: var(--muted); line-height: 1.7; }
.logout-btn { width: 100%; }
.logout-btn {
  border-color: color-mix(in srgb, #ef4444 28%, var(--border) 72%);
  color: color-mix(in srgb, #b91c1c 72%, var(--text) 28%);
}
.logout-btn:hover { border-color: color-mix(in srgb, #ef4444 54%, var(--border) 46%); }
.toast-stack {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: grid;
  place-content: center;
  gap: 10px;
  pointer-events: none;
}
.toast-item {
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--card-strong);
  color: var(--text);
  min-width: 220px;
  max-width: min(70vw, 560px);
  padding: 14px 20px;
  box-shadow: 0 18px 46px rgba(12, 31, 66, .24);
  text-align: center;
  font-weight: 700;
  animation: toastFadeIn 0.18s ease-out;
}
.toast-success {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}
.toast-error {
  border-color: rgba(239, 68, 68, 0.44);
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}
.toast-info {
  border-color: color-mix(in srgb, var(--brand-1) 45%, var(--border) 55%);
}
@keyframes toastFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.app-layout.collapsed { grid-template-columns: 96px minmax(0, 1fr); }
.side-nav.collapsed .brand-block { gap: 8px; }
.side-nav.collapsed .brand-top { justify-content: center; }
.side-nav.collapsed .role-chip { font-size: 10px; color: var(--muted); padding: 5px 4px; }
.side-nav.collapsed .menu-group { gap: 6px; }
.side-nav.collapsed .group-toggle {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card-strong);
  padding: 6px 4px;
  justify-content: center;
  gap: 2px;
}
.side-nav.collapsed .group-toggle span {
  display: inline;
  font-size: 10px;
  color: var(--muted);
}
.side-nav.collapsed .side-links { justify-items: center; }
.side-nav.collapsed .side-link {
  width: 36px;
  min-height: 36px;
  padding: 0;
  justify-content: center;
}
.side-nav.collapsed .application-notice-count {
  position: absolute;
  right: -5px;
  top: -5px;
  margin: 0;
  min-width: 14px;
  height: 14px;
  padding: 0 2px;
  font-size: 9px;
}
.side-nav.collapsed .side-actions { justify-items: stretch; }
.side-nav.collapsed .brand-block h1 { display: none; }
.side-nav.collapsed .nav-toggle,
.side-nav.collapsed .logout-btn,
.side-nav.collapsed .side-actions :deep(.btn) {
  min-height: 34px;
  padding: 0;
  justify-content: center;
}
.side-nav.collapsed .logout-btn :deep(svg) { margin: 0; }

.content-body {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(100vh - 36px);
  min-height: 0;
  position: relative;
}
.embed-content-body { margin-top: 0; }

.workspace-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: 12px;
  overflow-x: auto;
}
.workspace-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  background: var(--card);
  color: inherit;
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
  white-space: nowrap;
}
.workspace-tab.active {
  background: var(--card-strong);
  border-color: color-mix(in srgb, var(--brand-1) 30%, var(--border) 70%);
}
.tab-close { font-size: 14px; line-height: 1; opacity: 0.7; }
.tab-close:hover { opacity: 1; }

.workspace-panel {
  flex: 1;
  min-height: 0;
}

.workspace-pane {
  height: 100%;
  min-height: 0;
  overflow: auto;
}

.iframe-pane {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--card);
}
.embedded-frame {
  width: 100%;
  height: 100%;
  min-height: 0;
  border: 0;
  background: #fff;
}

.embedded-plain {
  min-height: 100%;
}

.app-layout.embedded {
  grid-template-columns: 1fr;
  gap: 0;
  min-height: auto;
}
.app-layout.embedded .app-shell {
  min-width: 0;
}

@media (max-width: 1160px) {
  .content-body { height: calc(100vh - 26px); }
}
</style>
