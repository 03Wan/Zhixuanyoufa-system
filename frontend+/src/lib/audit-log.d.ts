export type AuditActionType = "用户登录" | "用户退出" | "创建任务" | "编辑任务" | "删除任务" | "上传素材" | "启动检测" | "查看检测结果" | "生成审核报告" | "下载报告" | "新增规则" | "编辑规则" | "删除规则" | "人工复核操作";
export type AuditLogItem = {
    logId: string;
    operator: string;
    role: string;
    actionType: AuditActionType | string;
    target: string;
    result: "成功" | "失败";
    actionTime: string;
    ip: string;
    remark?: string;
};
export declare function appendAuditLog(input: {
    actionType: AuditActionType | string;
    target: string;
    result?: "成功" | "失败";
    remark?: string;
    operator?: string;
    role?: string;
    ip?: string;
}): AuditLogItem;
export declare function listAuditLogs(): AuditLogItem[];
export declare function clearAuditLogs(): void;
