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
  ENTERPRISE_ADMIN: ["home", "plans", "myPlan", "generate", "batch", "companies", "customers", "tasks", "results", "reports", "applications", "rules", "users", "logs", "modelConfig", "apiOpen", "templates"],
  OPERATOR: ["home", "plans", "myPlan", "generate", "batch", "customers", "tasks", "results", "reports", "modelConfig"],
  DESIGNER: ["home", "plans", "myPlan", "generate", "tasks", "results", "modelConfig"],
  REVIEWER: ["home", "plans", "myPlan", "results", "reviews", "reports", "modelConfig"],
  MANAGER: ["home", "plans", "myPlan", "dashboard", "generate", "companies", "customers", "reports", "applications", "logs", "modelConfig", "apiOpen"],
  SYSTEM_ADMIN: ["home", "plans", "myPlan", "dashboard", "generate", "batch", "companies", "customers", "tasks", "results", "reviews", "reports", "applications", "rules", "users", "logs", "modelConfig", "apiOpen", "templates"],
  CUSTOMER_VIEWER: ["home", "myPlan", "reports", "dashboard"],
};

export const MENU_REGISTRY = {
  home: { key: "home", label: "今日待办", href: "/home" },
  dashboard: { key: "dashboard", label: "成效分析", href: "/dashboard" },
  plans: { key: "plans", label: "套餐与共创", href: "/plans" },
  myPlan: { key: "myPlan", label: "我的套餐", href: "/my-plan" },
  batch: { key: "batch", label: "批量导入任务", href: "/batch" },
  generate: { key: "generate", label: "生成跨境素材", href: "/generate" },
  companies: { key: "companies", label: "企业组织", href: "/companies" },
  customers: { key: "customers", label: "客户档案", href: "/customers" },
  tasks: { key: "tasks", label: "创建审校任务", href: "/tasks/new" },
  results: { key: "results", label: "审校结论", href: "/results" },
  reviews: { key: "reviews", label: "人工复核", href: "/reviews" },
  reports: { key: "reports", label: "报告中心", href: "/reports" },
  applications: { key: "applications", label: "企业申请", href: "/applications" },
  rules: { key: "rules", label: "规则库", href: "/rules" },
  users: { key: "users", label: "用户管理", href: "/users" },
  logs: { key: "logs", label: "操作日志", href: "/logs" },
  modelConfig: { key: "modelConfig", label: "模型配置", href: "/model-config" },
  apiOpen: { key: "apiOpen", label: "集成与 API", href: "/api-open" },
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
