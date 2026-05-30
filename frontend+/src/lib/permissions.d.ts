export type UserRole = "ENTERPRISE_ADMIN" | "OPERATOR" | "DESIGNER" | "REVIEWER" | "MANAGER" | "SYSTEM_ADMIN" | "CUSTOMER_VIEWER";
export declare const ROLE_LABELS: Record<UserRole, string>;
export declare const ROLE_MENU: Record<UserRole, string[]>;
export declare const MENU_REGISTRY: {
    readonly home: {
        readonly key: "home";
        readonly label: "首页";
        readonly href: "/home";
    };
    readonly dashboard: {
        readonly key: "dashboard";
        readonly label: "数据看板";
        readonly href: "/dashboard";
    };
    readonly plans: {
        readonly key: "plans";
        readonly label: "套餐中心";
        readonly href: "/plans";
    };
    readonly myPlan: {
        readonly key: "myPlan";
        readonly label: "我的套餐";
        readonly href: "/my-plan";
    };
    readonly batch: {
        readonly key: "batch";
        readonly label: "批量检测";
        readonly href: "/batch";
    };
    readonly companies: {
        readonly key: "companies";
        readonly label: "企业组织";
        readonly href: "/companies";
    };
    readonly customers: {
        readonly key: "customers";
        readonly label: "客户档案";
        readonly href: "/customers";
    };
    readonly tasks: {
        readonly key: "tasks";
        readonly label: "任务中心";
        readonly href: "/tasks/new";
    };
    readonly results: {
        readonly key: "results";
        readonly label: "检测结果";
        readonly href: "/results";
    };
    readonly reviews: {
        readonly key: "reviews";
        readonly label: "人工复核台";
        readonly href: "/reviews";
    };
    readonly reports: {
        readonly key: "reports";
        readonly label: "报告中心";
        readonly href: "/reports";
    };
    readonly rules: {
        readonly key: "rules";
        readonly label: "规则库";
        readonly href: "/rules";
    };
    readonly users: {
        readonly key: "users";
        readonly label: "用户管理";
        readonly href: "/users";
    };
    readonly logs: {
        readonly key: "logs";
        readonly label: "操作日志";
        readonly href: "/logs";
    };
    readonly modelConfig: {
        readonly key: "modelConfig";
        readonly label: "模型配置";
        readonly href: "/model-config";
    };
    readonly apiOpen: {
        readonly key: "apiOpen";
        readonly label: "API接口版";
        readonly href: "/api-open";
    };
    readonly templates: {
        readonly key: "templates";
        readonly label: "报告模板";
        readonly href: "/report-templates";
    };
};
export declare function normalizeRole(role?: string): UserRole;
export declare function canAccessMenu(role: string | undefined, menuKey: keyof typeof MENU_REGISTRY): boolean;
export declare function getRoleMenus(role?: string): ({
    readonly key: "home";
    readonly label: "首页";
    readonly href: "/home";
} | {
    readonly key: "dashboard";
    readonly label: "数据看板";
    readonly href: "/dashboard";
} | {
    readonly key: "plans";
    readonly label: "套餐中心";
    readonly href: "/plans";
} | {
    readonly key: "myPlan";
    readonly label: "我的套餐";
    readonly href: "/my-plan";
} | {
    readonly key: "batch";
    readonly label: "批量检测";
    readonly href: "/batch";
} | {
    readonly key: "companies";
    readonly label: "企业组织";
    readonly href: "/companies";
} | {
    readonly key: "customers";
    readonly label: "客户档案";
    readonly href: "/customers";
} | {
    readonly key: "tasks";
    readonly label: "任务中心";
    readonly href: "/tasks/new";
} | {
    readonly key: "results";
    readonly label: "检测结果";
    readonly href: "/results";
} | {
    readonly key: "reviews";
    readonly label: "人工复核台";
    readonly href: "/reviews";
} | {
    readonly key: "reports";
    readonly label: "报告中心";
    readonly href: "/reports";
} | {
    readonly key: "rules";
    readonly label: "规则库";
    readonly href: "/rules";
} | {
    readonly key: "users";
    readonly label: "用户管理";
    readonly href: "/users";
} | {
    readonly key: "logs";
    readonly label: "操作日志";
    readonly href: "/logs";
} | {
    readonly key: "modelConfig";
    readonly label: "模型配置";
    readonly href: "/model-config";
} | {
    readonly key: "apiOpen";
    readonly label: "API接口版";
    readonly href: "/api-open";
} | {
    readonly key: "templates";
    readonly label: "报告模板";
    readonly href: "/report-templates";
})[];
export declare function roleAllows(role: string | undefined, allowedRoles?: UserRole[]): boolean;
