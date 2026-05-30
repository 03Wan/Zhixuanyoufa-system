import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { House, BarChart3, ListTodo, ShieldCheck, ClipboardCheck, FileText, BookKey, Users, Logs, SlidersHorizontal, PanelLeftClose, PanelLeftOpen, LogOut, ChevronDown, ChevronRight } from "lucide-vue-next";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { api, getUserProfile } from "@/lib/api";
import { getRoleMenus, normalizeRole, ROLE_LABELS } from "@/lib/permissions";
const props = defineProps();
const route = useRoute();
const router = useRouter();
const open = ref(false);
const collapsed = ref(false);
const hoverTip = ref({ visible: false, text: "", x: 0, y: 0 });
const expandedGroups = ref({});
const dialog = ref({
    open: false,
    kind: "alert",
    title: "提示",
    message: "",
    resolve: null,
});
const globalLoading = ref(false);
const toasts = ref([]);
let toastSeq = 0;
const toastTimers = new Map();
const baseTabId = "__base__";
const activeTabId = ref(baseTabId);
const embeddedTabs = ref([]);
const isEmbedded = computed(() => {
    const byQuery = String(route.query.embed || "") === "1";
    const byIframe = typeof window !== "undefined" && window.self !== window.top;
    return byQuery || byIframe;
});
const iframeRefs = ref([]);
const menuRefs = new Map();
const allTabs = computed(() => [
    { id: baseTabId, label: props.title, closable: false },
    ...embeddedTabs.value.map((tab) => ({ id: tab.id, label: tab.label, closable: true })),
]);
const showWorkspaceTabs = computed(() => false);
const descByPath = {
    "/home": "总览任务进度、风险分布与报告动态",
    "/dashboard": "通过图表分析近7天检测趋势与风险结构",
    "/plans": "展示演示版套餐体系与商业化阶段规划",
    "/my-plan": "查看当前套餐、额度使用与升级建议",
    "/batch": "MVP批量检测：支持表格批量录入与批量创建任务",
    "/companies": "企业组织管理：企业信息、成员、任务与报告关联",
    "/customers": "客户档案管理：试点客户信息与服务状态跟踪",
    "/tasks/new": "创建、编辑并跟踪检测任务",
    "/results": "查看评分、风险、建议与发布决策",
    "/reviews": "处理高风险与需人工确认任务",
    "/reports": "统一管理检测报告与打印下载",
    "/rules": "维护规则策略与敏感触发条件",
    "/users": "管理账号角色、状态与访问权限",
    "/logs": "追踪关键操作与系统审计记录",
    "/model-config": "配置大模型 API 与检测策略",
    "/api-open": "API接口版试点：开放能力清单与申请入口",
    "/report-templates": "正式报告模板管理（MVP版）",
};
const currentUser = computed(() => (getUserProfile() || {}));
const roleLabel = computed(() => ROLE_LABELS[normalizeRole(currentUser.value?.role)]);
const links = computed(() => getRoleMenus(currentUser.value?.role));
const groupedLinks = computed(() => {
    const groups = [
        { key: "workspace", label: "工作台", keys: ["home", "dashboard"] },
        { key: "billing", label: "套餐与商业化", keys: ["plans", "myPlan"] },
        { key: "biz", label: "业务管理", keys: ["batch", "tasks", "results", "reviews", "reports", "customers"] },
        { key: "org", label: "组织与企业", keys: ["companies"] },
        { key: "sys", label: "系统管理", keys: ["rules", "users", "logs", "modelConfig", "apiOpen", "templates"] },
    ];
    return groups
        .map((g) => ({ ...g, items: links.value.filter((item) => g.keys.includes(item.key)) }))
        .filter((g) => g.items.length > 0);
});
watch(groupedLinks, (groups) => {
    const next = {};
    for (const g of groups)
        next[g.key] = expandedGroups.value[g.key] ?? true;
    expandedGroups.value = next;
}, { immediate: true });
function normalizePath(path) {
    return path.startsWith("/tasks/") ? "/tasks/new" : path;
}
function isMenuActive(href) {
    return normalizePath(route.path) === normalizePath(href);
}
function isSidebarActive(href) {
    return normalizePath(href) !== "/home" && isMenuActive(href);
}
function setMenuRef(el, href) {
    const key = normalizePath(href);
    if (el instanceof HTMLElement)
        menuRefs.set(key, el);
    else
        menuRefs.delete(key);
}
function scrollActiveMenuIntoView() {
    const el = menuRefs.get(normalizePath(route.path));
    el?.scrollIntoView({ block: "center", inline: "nearest" });
}
function shortGroupLabel(label) {
    const map = {
        工作台: "工作",
        套餐与商业化: "套餐",
        业务管理: "业务",
        组织与企业: "组织",
        系统管理: "系统",
    };
    return map[label] || label.slice(0, 2);
}
function handleMenuEnter(e, href) {
    const hit = links.value.find((item) => normalizePath(item.href) === normalizePath(href));
    hoverTip.value = {
        visible: true,
        text: collapsed.value ? (hit?.label || "菜单") : (descByPath[normalizePath(href)] || hit?.label || "业务页面"),
        x: e.clientX + 14,
        y: e.clientY + 14,
    };
}
function handleMenuMove(e) {
    if (!hoverTip.value.visible)
        return;
    hoverTip.value = { ...hoverTip.value, x: e.clientX + 14, y: e.clientY + 14 };
}
function handleMenuLeave() {
    hoverTip.value.visible = false;
}
function toEmbedHref(href) {
    const theme = localStorage.getItem("theme") || "light";
    return href.includes("?") ? `${href}&embed=1&theme=${theme}` : `${href}?embed=1&theme=${theme}`;
}
function openEmbeddedTab(item) {
    const target = normalizePath(item.href);
    const query = isEmbedded.value
        ? { embed: "1", theme: String(route.query.theme || "") || undefined }
        : undefined;
    router.push({ path: target, query });
    embeddedTabs.value = [];
    activeTabId.value = baseTabId;
    open.value = false;
}
function closeTab(id) {
    const idx = embeddedTabs.value.findIndex((tab) => tab.id === id);
    if (idx === -1)
        return;
    embeddedTabs.value.splice(idx, 1);
    if (activeTabId.value === id)
        activeTabId.value = baseTabId;
}
function setIframeRef(el) {
    if (!(el instanceof HTMLIFrameElement))
        return;
    if (!iframeRefs.value.includes(el))
        iframeRefs.value.push(el);
}
function applyTheme(theme) {
    const dark = theme === "dark";
    document.documentElement.classList.toggle("dark", dark);
}
function syncEmbeddedFramesTheme(theme) {
    for (const frame of iframeRefs.value) {
        frame.contentWindow?.postMessage({ type: "theme-sync", theme }, window.location.origin);
    }
}
function notifyEmbeddedActivated() {
    for (const frame of iframeRefs.value) {
        frame.contentWindow?.postMessage({ type: "embedded-activated", tabId: activeTabId.value }, window.location.origin);
    }
}
function handleStorageTheme(e) {
    if (e.key !== "theme")
        return;
    const theme = e.newValue || "light";
    applyTheme(theme);
}
function handleMessageTheme(e) {
    if (e.origin !== window.location.origin)
        return;
    const payload = (e.data || {});
    if (payload.type !== "theme-sync")
        return;
    applyTheme(payload.theme === "dark" ? "dark" : "light");
}
function handleDialogEvent(e) {
    const detail = e.detail || {};
    dialog.value = {
        open: true,
        kind: detail.kind === "confirm" ? "confirm" : "alert",
        title: detail.title || "提示",
        message: detail.message || "",
        resolve: typeof detail.resolve === "function" ? detail.resolve : null,
    };
}
function resolveDialog(value) {
    const done = dialog.value.resolve;
    dialog.value.open = false;
    dialog.value.resolve = null;
    done?.(value);
}
function removeToast(id) {
    toasts.value = toasts.value.filter((item) => item.id !== id);
    const timer = toastTimers.get(id);
    if (timer) {
        clearTimeout(timer);
        toastTimers.delete(id);
    }
}
function handleToastEvent(e) {
    const detail = e.detail || {};
    const message = String(detail.message || "").trim();
    if (!message)
        return;
    const kind = ["success", "error", "info"].includes(String(detail.kind)) ? detail.kind : "success";
    const duration = Math.max(1200, Number(detail.duration || 2200));
    const id = ++toastSeq;
    toasts.value.push({ id, message, kind });
    const timer = setTimeout(() => removeToast(id), duration);
    toastTimers.set(id, timer);
}
function handleLoadingEvent(e) {
    const detail = e.detail || {};
    globalLoading.value = !!detail.active;
}
let themeObserver = null;
onMounted(() => {
    const theme = localStorage.getItem("theme") || "light";
    applyTheme(theme);
    collapsed.value = localStorage.getItem("zyyf_sidebar_collapsed") === "1";
    window.addEventListener("storage", handleStorageTheme);
    window.addEventListener("message", handleMessageTheme);
    window.addEventListener("zyyf-dialog", handleDialogEvent);
    window.addEventListener("zyyf-toast", handleToastEvent);
    window.addEventListener("zyyf-loading", handleLoadingEvent);
    if (!isEmbedded.value) {
        themeObserver = new MutationObserver(() => {
            const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
            syncEmbeddedFramesTheme(current);
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }
    setTimeout(scrollActiveMenuIntoView, 0);
});
watch(activeTabId, () => {
    if (!isEmbedded.value)
        notifyEmbeddedActivated();
});
watch(() => route.path, () => setTimeout(scrollActiveMenuIntoView, 0));
onBeforeUnmount(() => {
    window.removeEventListener("storage", handleStorageTheme);
    window.removeEventListener("message", handleMessageTheme);
    window.removeEventListener("zyyf-dialog", handleDialogEvent);
    window.removeEventListener("zyyf-toast", handleToastEvent);
    window.removeEventListener("zyyf-loading", handleLoadingEvent);
    for (const timer of toastTimers.values())
        clearTimeout(timer);
    toastTimers.clear();
    themeObserver?.disconnect();
});
function menuIcon(key) {
    const map = {
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
function toggleGroup(key) {
    expandedGroups.value = { ...expandedGroups.value, [key]: !expandedGroups.value[key] };
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brand-block']} */ ;
/** @type {__VLS_StyleScopedClasses['role-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['side-link']} */ ;
/** @type {__VLS_StyleScopedClasses['side-link']} */ ;
/** @type {__VLS_StyleScopedClasses['app-dialog-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-block']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-top']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['role-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-group']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['group-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['group-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['side-links']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['side-link']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['side-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-block']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['side-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['version-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-close']} */ ;
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['embedded']} */ ;
/** @type {__VLS_StyleScopedClasses['content-body']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-layout" },
    ...{ class: ({ embedded: __VLS_ctx.isEmbedded, collapsed: __VLS_ctx.collapsed }) },
});
if (!__VLS_ctx.isEmbedded) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
        ...{ class: "glass side-nav fade-up" },
        ...{ class: ({ open: __VLS_ctx.open, collapsed: __VLS_ctx.collapsed }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "brand-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "brand-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "brand-logo" },
    });
    if (!__VLS_ctx.collapsed) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "role-chip" },
        ...{ class: ({ compact: __VLS_ctx.collapsed }) },
    });
    (__VLS_ctx.collapsed ? __VLS_ctx.roleLabel : `当前角色：${__VLS_ctx.roleLabel}`);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
        ...{ class: "side-groups" },
    });
    for (const [group] of __VLS_getVForSourceType((__VLS_ctx.groupedLinks))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            key: (group.key),
            ...{ class: "menu-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.isEmbedded))
                        return;
                    __VLS_ctx.toggleGroup(group.key);
                } },
            type: "button",
            ...{ class: "menu-group-title group-toggle" },
            title: (group.label),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.collapsed ? __VLS_ctx.shortGroupLabel(group.label) : group.label);
        const __VLS_0 = ((__VLS_ctx.expandedGroups[group.key] ? __VLS_ctx.ChevronDown : __VLS_ctx.ChevronRight));
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            size: (14),
        }));
        const __VLS_2 = __VLS_1({
            size: (14),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "side-links" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.expandedGroups[group.key]) }, null, null);
        for (const [item] of __VLS_getVForSourceType((group.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.isEmbedded))
                            return;
                        __VLS_ctx.openEmbeddedTab(item);
                    } },
                ...{ onMouseenter: (...[$event]) => {
                        if (!(!__VLS_ctx.isEmbedded))
                            return;
                        __VLS_ctx.handleMenuEnter($event, item.href);
                    } },
                ...{ onMousemove: (__VLS_ctx.handleMenuMove) },
                ...{ onMouseleave: (__VLS_ctx.handleMenuLeave) },
                key: (item.href),
                type: "button",
                ref: ((el) => __VLS_ctx.setMenuRef(el, item.href)),
                ...{ class: "side-link" },
                ...{ class: ({ active: __VLS_ctx.isSidebarActive(item.href) }) },
            });
            const __VLS_4 = ((__VLS_ctx.menuIcon(item.key)));
            // @ts-ignore
            const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
                size: (16),
            }));
            const __VLS_6 = __VLS_5({
                size: (16),
            }, ...__VLS_functionalComponentArgsRest(__VLS_5));
            if (!__VLS_ctx.collapsed) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (item.label);
            }
        }
    }
    if (__VLS_ctx.hoverTip.visible) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "menu-cursor-tip" },
            ...{ style: ({ left: `${__VLS_ctx.hoverTip.x}px`, top: `${__VLS_ctx.hoverTip.y}px` }) },
        });
        (__VLS_ctx.hoverTip.text);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "side-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleSidebar) },
        ...{ class: "btn btn-secondary nav-toggle" },
        title: (__VLS_ctx.collapsed ? '展开侧边栏' : '收起侧边栏'),
    });
    const __VLS_8 = ((__VLS_ctx.collapsed ? __VLS_ctx.PanelLeftOpen : __VLS_ctx.PanelLeftClose));
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        size: (16),
    }));
    const __VLS_10 = __VLS_9({
        size: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    if (!__VLS_ctx.collapsed) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.collapsed ? '展开侧边栏' : '收起侧边栏');
    }
    /** @type {[typeof ThemeToggle, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(ThemeToggle, new ThemeToggle({
        compact: (__VLS_ctx.collapsed),
    }));
    const __VLS_13 = __VLS_12({
        compact: (__VLS_ctx.collapsed),
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.logout) },
        ...{ class: "btn btn-secondary logout-btn" },
        title: (__VLS_ctx.collapsed ? '退出登录' : ''),
    });
    const __VLS_15 = {}.LogOut;
    /** @type {[typeof __VLS_components.LogOut, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        size: (16),
    }));
    const __VLS_17 = __VLS_16({
        size: (16),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    if (!__VLS_ctx.collapsed) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "version-badge" },
    });
}
if (__VLS_ctx.dialog.open) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.dialog.open))
                    return;
                __VLS_ctx.resolveDialog(false);
            } },
        ...{ class: "modal-mask app-dialog-mask" },
    });
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card modal-panel app-dialog-panel" },
    }));
    const __VLS_20 = __VLS_19({
        as: "section",
        ...{ class: "card modal-panel app-dialog-panel" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_21.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "section-title" },
    });
    (__VLS_ctx.dialog.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.dialog.message);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions dialog-actions" },
    });
    if (__VLS_ctx.dialog.kind === 'confirm') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.dialog.open))
                        return;
                    if (!(__VLS_ctx.dialog.kind === 'confirm'))
                        return;
                    __VLS_ctx.resolveDialog(false);
                } },
            ...{ class: "btn btn-secondary" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.dialog.open))
                    return;
                __VLS_ctx.resolveDialog(true);
            } },
        ...{ class: "btn btn-primary" },
    });
    (__VLS_ctx.dialog.kind === 'confirm' ? '确认' : '知道了');
    var __VLS_21;
}
if (__VLS_ctx.toasts.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "toast-stack" },
        'aria-live': "polite",
        'aria-atomic': "true",
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.toasts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.id),
            ...{ class: "toast-item" },
            ...{ class: ([`toast-${item.kind}`]) },
        });
        (item.message);
    }
}
if (__VLS_ctx.globalLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "global-loading-mask" },
        'aria-live': "assertive",
        'aria-busy': "true",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "global-loading-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
        ...{ class: "global-loading-spinner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "page-stack content-body" },
    ...{ class: ({ 'embed-content-body': __VLS_ctx.isEmbedded }) },
});
if (!__VLS_ctx.isEmbedded) {
    if (__VLS_ctx.showWorkspaceTabs) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "workspace-tabs glass" },
        });
        for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.allTabs))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.isEmbedded))
                            return;
                        if (!(__VLS_ctx.showWorkspaceTabs))
                            return;
                        __VLS_ctx.activeTabId = tab.id;
                    } },
                key: (tab.id),
                type: "button",
                ...{ class: "workspace-tab" },
                ...{ class: ({ active: __VLS_ctx.activeTabId === tab.id }) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (tab.label);
            if (tab.closable) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ onClick: (...[$event]) => {
                            if (!(!__VLS_ctx.isEmbedded))
                                return;
                            if (!(__VLS_ctx.showWorkspaceTabs))
                                return;
                            if (!(tab.closable))
                                return;
                            __VLS_ctx.closeTab(tab.id);
                        } },
                    ...{ class: "tab-close" },
                });
            }
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "workspace-panel" },
    });
    if (__VLS_ctx.activeTabId === __VLS_ctx.baseTabId) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "workspace-pane" },
        });
        var __VLS_22 = {};
    }
    for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.embeddedTabs))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`pane-${tab.id}`),
            ...{ class: "workspace-pane iframe-pane" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.activeTabId === tab.id) }, null, null);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.iframe)({
            ref: (__VLS_ctx.setIframeRef),
            src: (tab.href),
            ...{ class: "embedded-frame" },
            title: (tab.label),
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "workspace-pane embedded-plain" },
    });
    var __VLS_24 = {};
}
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-block']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-top']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['role-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['side-groups']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-group']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['group-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['side-links']} */ ;
/** @type {__VLS_StyleScopedClasses['side-link']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-cursor-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['side-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['version-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['app-dialog-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['app-dialog-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-item']} */ ;
/** @type {__VLS_StyleScopedClasses['global-loading-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['global-loading-card']} */ ;
/** @type {__VLS_StyleScopedClasses['global-loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['content-body']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-close']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-pane']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-pane']} */ ;
/** @type {__VLS_StyleScopedClasses['iframe-pane']} */ ;
/** @type {__VLS_StyleScopedClasses['embedded-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-pane']} */ ;
/** @type {__VLS_StyleScopedClasses['embedded-plain']} */ ;
// @ts-ignore
var __VLS_23 = __VLS_22, __VLS_25 = __VLS_24;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            PanelLeftClose: PanelLeftClose,
            PanelLeftOpen: PanelLeftOpen,
            LogOut: LogOut,
            ChevronDown: ChevronDown,
            ChevronRight: ChevronRight,
            ThemeToggle: ThemeToggle,
            open: open,
            collapsed: collapsed,
            hoverTip: hoverTip,
            expandedGroups: expandedGroups,
            dialog: dialog,
            globalLoading: globalLoading,
            toasts: toasts,
            baseTabId: baseTabId,
            activeTabId: activeTabId,
            embeddedTabs: embeddedTabs,
            isEmbedded: isEmbedded,
            allTabs: allTabs,
            showWorkspaceTabs: showWorkspaceTabs,
            roleLabel: roleLabel,
            groupedLinks: groupedLinks,
            isSidebarActive: isSidebarActive,
            setMenuRef: setMenuRef,
            shortGroupLabel: shortGroupLabel,
            handleMenuEnter: handleMenuEnter,
            handleMenuMove: handleMenuMove,
            handleMenuLeave: handleMenuLeave,
            openEmbeddedTab: openEmbeddedTab,
            closeTab: closeTab,
            setIframeRef: setIframeRef,
            resolveDialog: resolveDialog,
            menuIcon: menuIcon,
            logout: logout,
            toggleSidebar: toggleSidebar,
            toggleGroup: toggleGroup,
        };
    },
    __typeProps: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
