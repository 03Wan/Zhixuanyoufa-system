export type UserRole =
  | "ENTERPRISE_ADMIN"
  | "OPERATOR"
  | "DESIGNER"
  | "REVIEWER"
  | "MANAGER"
  | "SYSTEM_ADMIN"
  | "CUSTOMER_VIEWER";

export const ROLE_LABELS: Record<UserRole, string> = {
  ENTERPRISE_ADMIN: "企业管理员",
  OPERATOR: "运营人员",
  DESIGNER: "设计人员",
  REVIEWER: "复核人员",
  MANAGER: "管理人员",
  SYSTEM_ADMIN: "系统管理员",
  CUSTOMER_VIEWER: "客户查看员",
};

export const ROLE_MENU: Record<UserRole, string[]> = {
  ENTERPRISE_ADMIN: ["home", "plans", "myPlan", "batch", "companies", "customers", "tasks", "results", "reports", "rules", "users", "logs", "modelConfig", "apiOpen", "templates"],
  OPERATOR: ["home", "plans", "myPlan", "batch", "customers", "tasks", "results", "reports", "modelConfig"],
  DESIGNER: ["home", "plans", "myPlan", "tasks", "results", "modelConfig"],
  REVIEWER: ["home", "plans", "myPlan", "results", "reviews", "reports", "modelConfig"],
  MANAGER: ["home", "plans", "myPlan", "dashboard", "companies", "customers", "reports", "logs", "modelConfig", "apiOpen"],
  SYSTEM_ADMIN: ["home", "plans", "myPlan", "dashboard", "batch", "companies", "customers", "tasks", "results", "reviews", "reports", "rules", "users", "logs", "modelConfig", "apiOpen", "templates"],
  CUSTOMER_VIEWER: ["home", "myPlan", "reports", "dashboard"],
};

export const MENU_REGISTRY = {
  home: { key: "home", label: "首页", href: "/home" },
  dashboard: { key: "dashboard", label: "数据看板", href: "/dashboard" },
  plans: { key: "plans", label: "套餐中心", href: "/plans" },
  myPlan: { key: "myPlan", label: "我的套餐", href: "/my-plan" },
  batch: { key: "batch", label: "批量检测", href: "/batch" },
  companies: { key: "companies", label: "企业组织", href: "/companies" },
  customers: { key: "customers", label: "客户档案", href: "/customers" },
  tasks: { key: "tasks", label: "任务中心", href: "/tasks/new" },
  results: { key: "results", label: "检测结果", href: "/results" },
  reviews: { key: "reviews", label: "人工复核台", href: "/reviews" },
  reports: { key: "reports", label: "报告中心", href: "/reports" },
  rules: { key: "rules", label: "规则库", href: "/rules" },
  users: { key: "users", label: "用户管理", href: "/users" },
  logs: { key: "logs", label: "操作日志", href: "/logs" },
  modelConfig: { key: "modelConfig", label: "模型配置", href: "/model-config" },
  apiOpen: { key: "apiOpen", label: "API接口版", href: "/api-open" },
  templates: { key: "templates", label: "报告模板", href: "/report-templates" },
} as const;

export function normalizeRole(role?: string): UserRole {
  const raw = String(role || "").trim().toUpperCase();
  const aliasMap: Record<string, UserRole> = {
    ADMIN: "SYSTEM_ADMIN",
    SYS_ADMIN: "SYSTEM_ADMIN",
    SYSTEMADMIN: "SYSTEM_ADMIN",
    ENTERPRISEADMIN: "ENTERPRISE_ADMIN",
  };
  const mapped = (aliasMap[raw] || raw) as UserRole;
  if (mapped in ROLE_MENU) return mapped;
  return "OPERATOR";
}

export function canAccessMenu(role: string | undefined, menuKey: keyof typeof MENU_REGISTRY): boolean {
  const normalized = normalizeRole(role);
  return ROLE_MENU[normalized].includes(menuKey);
}

export function getRoleMenus(role?: string) {
  const normalized = normalizeRole(role);
  return ROLE_MENU[normalized].map((k) => MENU_REGISTRY[k as keyof typeof MENU_REGISTRY]);
}

export function roleAllows(role: string | undefined, allowedRoles?: UserRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(normalizeRole(role));
}
