const LOG_KEY = "zyyf_audit_logs";
function readLogs() {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function writeLogs(rows) {
    localStorage.setItem(LOG_KEY, JSON.stringify(rows));
}
function currentUser() {
    try {
        return JSON.parse(localStorage.getItem("zyyf_user") || "{}");
    }
    catch {
        return {};
    }
}
export function appendAuditLog(input) {
    const user = currentUser();
    const row = {
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
