import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import PublicHomeView from "@/views/PublicHomeView.vue";
import TaskNewView from "@/views/TaskNewView.vue";
import TaskDetailView from "@/views/TaskDetailView.vue";
import TaskResultView from "@/views/TaskResultView.vue";
import ReportsView from "@/views/ReportsView.vue";
import ReportDetailView from "@/views/ReportDetailView.vue";
import RulesView from "@/views/RulesView.vue";
import ReviewCenterView from "@/views/ReviewCenterView.vue";
import ReviewDetailView from "@/views/ReviewDetailView.vue";
import UsersView from "@/views/UsersView.vue";
import LogsView from "@/views/LogsView.vue";
import ModelConfigView from "@/views/ModelConfigView.vue";
import PlanCenterView from "@/views/PlanCenterView.vue";
import MyPlanView from "@/views/MyPlanView.vue";
import BatchView from "@/views/BatchView.vue";
import CompaniesView from "@/views/CompaniesView.vue";
import CustomersView from "@/views/CustomersView.vue";
import ApiOpenView from "@/views/ApiOpenView.vue";
import ReportTemplatesView from "@/views/ReportTemplatesView.vue";
import PrivacyView from "@/views/PrivacyView.vue";
import TermsView from "@/views/TermsView.vue";
import ForbiddenView from "@/views/ForbiddenView.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import { getToken, getUserProfile } from "@/lib/api";
import { roleAllows, type UserRole } from "@/lib/permissions";

const DashboardView = () => import("@/views/DashboardView.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home-public" },
    { path: "/home-public", component: PublicHomeView },
    { path: "/privacy", component: PrivacyView },
    { path: "/terms", component: TermsView },
    { path: "/home", component: HomeView, meta: { auth: true } },
    { path: "/plans", component: PlanCenterView, meta: { auth: true } },
    { path: "/my-plan", component: MyPlanView, meta: { auth: true } },
    { path: "/batch", component: BatchView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "OPERATOR", "MANAGER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/companies", component: CompaniesView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "MANAGER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/customers", component: CustomersView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "OPERATOR", "MANAGER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/api-open", component: ApiOpenView, meta: { auth: true } },
    { path: "/report-templates", component: ReportTemplatesView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/dashboard", component: DashboardView, meta: { auth: true, roles: ["MANAGER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/login", redirect: () => ({ path: "/home-public", query: { auth: "login" } }) },
    { path: "/register", redirect: () => ({ path: "/home-public", query: { auth: "login" } }) },

    { path: "/tasks/new", component: TaskNewView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "OPERATOR", "DESIGNER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/tasks/:id", component: TaskDetailView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "OPERATOR", "DESIGNER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/results", component: TaskResultView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "OPERATOR", "DESIGNER", "REVIEWER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/tasks/:id/result", component: TaskResultView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "OPERATOR", "DESIGNER", "REVIEWER", "SYSTEM_ADMIN"] as UserRole[] } },

    { path: "/reviews", component: ReviewCenterView, meta: { auth: true, roles: ["REVIEWER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/reviews/:id", component: ReviewDetailView, meta: { auth: true, roles: ["REVIEWER", "SYSTEM_ADMIN", "OPERATOR", "ENTERPRISE_ADMIN"] as UserRole[] } },

    { path: "/reports", component: ReportsView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "OPERATOR", "REVIEWER", "MANAGER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/reports/:id", component: ReportDetailView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "OPERATOR", "REVIEWER", "MANAGER", "SYSTEM_ADMIN"] as UserRole[] } },

    { path: "/rules", component: RulesView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/users", component: UsersView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/logs", component: LogsView, meta: { auth: true, roles: ["ENTERPRISE_ADMIN", "MANAGER", "SYSTEM_ADMIN"] as UserRole[] } },
    { path: "/model-config", component: ModelConfigView, meta: { auth: true } },

    { path: "/403", component: ForbiddenView, meta: { auth: true } },
    { path: "/:pathMatch(.*)*", component: NotFoundView },
  ],
});

router.beforeEach((to) => {
  const hasToken = !!getToken();
  if (to.meta.auth && !hasToken) return { path: "/home-public", query: { auth: "login", redirect: to.fullPath } };
  if ((to.path === "/login" || to.path === "/register") && hasToken) return "/home";

  if (to.meta.auth) {
    const user = (getUserProfile() || {}) as any;
    const roles = to.meta.roles as UserRole[] | undefined;
    if (!roleAllows(user?.role, roles)) return "/403";
  }

  return true;
});

export default router;
