export type AuditActionType =
  | "用户登录"
  | "用户退出"
  | "创建任务"
  | "编辑任务"
  | "删除任务"
  | "上传素材"
  | "启动检测"
  | "查看检测结果"
  | "生成审核报告"
  | "下载报告"
  | "新增规则"
  | "编辑规则"
  | "删除规则"
  | "人工复核操作";

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

const LOG_KEY = "zyyf_audit_logs";

function readLogs(): AuditLogItem[] {
  const raw = localStorage.getItem(LOG_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLogs(rows: AuditLogItem[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(rows));
}

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("zyyf_user") || "{}");
  } catch {
    return {};
  }
}

export function appendAuditLog(input: {
  actionType: AuditActionType | string;
  target: string;
  result?: "成功" | "失败";
  remark?: string;
  operator?: string;
  role?: string;
  ip?: string;
}) {
  const user = currentUser() as any;
  const row: AuditLogItem = {
    logId: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    operator: input.operator || user.username || user.name || "系统",
    role: input.role || user.role || "UNKNOWN",
    actionType: input.actionType,
    target: input.target,
    result: input.result || "成功",
    actionTime: new Date().toISOString(),
    ip: input.ip || "127.0.0.1",
    remark: input.remark || "",
  };
  const rows = readLogs();
  rows.unshift(row);
  writeLogs(rows);
  return row;
}

export function listAuditLogs() {
  return readLogs();
}

export function clearAuditLogs() {
  writeLogs([]);
}