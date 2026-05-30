# 智选优发 API / Mock 结构说明

## 统一返回格式（后端目标）

```ts
{
  code: 0,
  message: "success",
  data: {}
}
```

## 前端接口封装

- 文件：`frontend+/src/lib/api.ts`
- 设计：先走真实接口；失败后回退 mock（便于比赛演示和后续替换）

## 主要数据结构

### 任务

- `id`
- `taskNo`
- `productName`
- `category`
- `platform`
- `market`
- `purpose`
- `status`
- `createdAt`

### 检测结果

- `score`
- `riskLevel`
- `decision`
- `detectedAt`
- `dimensionScores`
- `matchedRules`
- `issues`
- `suggestions`
- `reviewStatus`

### 规则

- `ruleId`
- `name`
- `type`
- `platform`
- `market`
- `category`
- `keywords`
- `riskLevel`
- `description`
- `suggestion`
- `status`
- `updatedAt`

### 报告

- `id`
- `reportNo`
- `taskId`
- `task`
- `result`
- `logs`
- `createdAt`

### 操作日志

- `logId`
- `operator`
- `role`
- `actionType`
- `target`
- `result`
- `actionTime`
- `ip`
- `remark`

## mock 数据位置

- `frontend+/src/lib/mock/demo-data.ts`
- `frontend+/src/lib/mock/dashboard.ts`
- `frontend+/src/lib/audit-log.ts`

