export type ApiEnvelope<T> = {
    code: number;
    message: string;
    data: T;
};
export type RegisterPayload = {
    username: string;
    email: string;
    password: string;
    companyName?: string;
};
export type LoginPayload = {
    email: string;
    password: string;
};
export type ForgotPasswordPayload = {
    email: string;
};
export type ResetPasswordPayload = {
    email: string;
    token: string;
    newPassword: string;
};
export type ModelRuntimeConfig = {
    enabled?: boolean;
    apiUrl?: string;
    apiKey?: string;
    modelName?: string;
};
export type CreateTaskPayload = {
    sku: string;
    productName: string;
    category: string;
    platform: string;
    market: string;
    purpose: string;
    title: string;
    sellingPoints: string;
    detailText: string;
    adText: string;
    videoScript?: string;
    mainImageUrls?: string[];
    sceneImageUrls?: string[];
    imageUrls?: string[];
};
export type UpdateTaskPayload = Partial<CreateTaskPayload>;
export declare const USE_MOCK: boolean;
export declare function setToken(token: string): void;
export declare function getToken(): string;
export declare function setUserProfile(user: unknown): void;
export declare function getUserProfile(): any;
export declare function clearToken(): void;
export declare const api: {
    logout(): void;
    register(payload: RegisterPayload): Promise<unknown>;
    login(payload: LoginPayload): Promise<{
        accessToken: string;
        user: any;
    }>;
    forgotPassword(payload: ForgotPasswordPayload): Promise<unknown>;
    resetPassword(payload: ResetPasswordPayload): Promise<unknown>;
    getTaskList(): Promise<any>;
    getTaskDetail(taskId: string): Promise<any>;
    createTask(payload: CreateTaskPayload): Promise<unknown>;
    updateTask(taskId: string, payload: UpdateTaskPayload): Promise<any>;
    updateTaskStatus(taskId: string, status: string): Promise<unknown>;
    deleteTask(taskId: string): Promise<unknown>;
    saveTaskMaterials(taskId: string, payload: any): Promise<any>;
    analyzeTask(taskId: string, modelConfig?: ModelRuntimeConfig): Promise<unknown>;
    getDetectionResult(taskId: string): Promise<any>;
    requestManualReview(taskId: string, note?: string): Promise<unknown>;
    generateReport(taskId: string): Promise<unknown>;
    getReportList(params?: {
        page?: number;
        pageSize?: number;
        platform?: string;
        market?: string;
        riskLevel?: string;
        keyword?: string;
    }): Promise<any>;
    getReportDetail(reportId: string): Promise<any>;
    deleteReport(reportId: string): Promise<unknown>;
    downloadReport(reportId: string, format?: "pdf" | "docx" | "json"): Promise<void>;
    getRules(): Promise<any[]>;
    createRule(payload: any): Promise<any>;
    updateRule(ruleId: string, payload: any): Promise<any>;
    deleteRule(ruleId: string): Promise<unknown>;
    getRuleApprovals(): Promise<any[]>;
    approveRule(approvalId: string, approved: boolean, comment?: string): Promise<any>;
    getRuleVersions(ruleId: string): Promise<unknown>;
    rollbackRuleVersion(ruleId: string, versionId: string): Promise<any>;
    getCustomers(): Promise<any[]>;
    updateCustomerPlan(customerId: string, payload: {
        plan?: string;
        quotaTotal?: number;
        expireAt?: string;
        status?: string;
    }): Promise<any>;
    getPlans(): Promise<unknown>;
    getMySubscription(): Promise<unknown>;
    getSubscriptionUsage(): Promise<unknown>;
    selectSubscription(planName: string): Promise<unknown>;
    upgradeSubscription(planName: string): Promise<unknown>;
    quotaCheck(): Promise<unknown>;
    uploadFile(file: File, taskId?: string): Promise<any>;
    getFiles(taskId?: string): Promise<unknown>;
    applyCommercial(payload: {
        type: string;
        contact?: string;
        companyName?: string;
        note?: string;
    }): Promise<unknown>;
    getCompanies(): Promise<unknown>;
    createCompany(payload: any): Promise<any>;
    deleteCompany(companyId: string): Promise<unknown>;
    addCompanyMember(companyId: string, userId: string, role: string): Promise<unknown>;
    getCustomersList(params?: {
        keyword?: string;
        serviceStatus?: string;
    }): Promise<unknown>;
    createCustomer(payload: any): Promise<any>;
    updateCustomer(customerId: string, payload: any): Promise<any>;
    getBatchTasks(): Promise<unknown>;
    getBatchTaskDetail(batchId: string): Promise<any>;
    createBatchTask(payload: any): Promise<unknown>;
    runBatchTask(batchId: string): Promise<any>;
    getMaterialVersions(taskId: string): Promise<unknown>;
    snapshotMaterialVersion(taskId: string, payload: any): Promise<unknown>;
    getModelConfig(): Promise<unknown>;
    saveModelConfig(payload: {
        enabled?: boolean;
        apiUrl?: string;
        apiKey?: string;
        modelName?: string;
        provider?: string;
    }): Promise<unknown>;
    getApiOpenCatalog(): Promise<unknown>;
    getReportTemplates(): Promise<unknown>;
    createReportTemplate(payload: any): Promise<any>;
    updateReportTemplate(templateId: string, payload: any): Promise<any>;
    deleteReportTemplate(templateId: string): Promise<unknown>;
    getReviewTasks(): Promise<any>;
    getReviewDetail(reviewId: string): Promise<any>;
    startReview(reviewId: string): Promise<unknown>;
    submitReviewDecision(reviewId: string, payload: {
        decision: "\u901A\u8FC7\u53D1\u5E03" | "\u9000\u56DE\u4F18\u5316" | "\u6682\u7F13\u53D1\u5E03";
        comment: string;
        reason: string;
    }): Promise<unknown>;
    getUsers(): Promise<any[]>;
    createUser(payload: {
        username: string;
        email: string;
        password: string;
        companyName?: string;
        role?: string;
    }): Promise<any>;
    updateUser(userId: string, payload: {
        role?: string;
        status?: string;
    }): Promise<any>;
    deleteUser(userId: string): Promise<unknown>;
    getLogs(): Promise<any>;
    getDashboardData(): Promise<unknown>;
};
export declare function getFriendlyError(error: unknown): string;
