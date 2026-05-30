# Mock 字段到后端接口映射（P0）

> 目标：当前前端默认走 Mock，但字段结构与后端接口保持同形，便于下一阶段平滑切换到 NestJS。

## 统一响应包装

- 约定：`{ code: 0, message: "success", data: ... }`
- 前端消费：`src/lib/api.ts` 中 `request<T>()` 和 `run()` 已统一处理。

## 认证

### 登录
- Mock 方法：`api.login(payload)`
- 目标接口：`POST /api/auth/login`
- 入参：`{ email, password }`
- 返回：
  - `accessToken` -> `token`
  - `user` -> `userInfo`

### 注册
- Mock 方法：`api.register(payload)`
- 目标接口：`POST /api/auth/register`
- 入参：`{ username, email, password, companyName? }`

## 任务与素材

### 创建任务
- Mock 方法：`api.createTask(payload)`
- 目标接口：`POST /api/tasks`
- 核心字段映射：
  - `sku` -> `sku`
  - `productName` -> `productName`
  - `category` -> `category`
  - `platform` -> `platform`
  - `market` -> `market`
  - `purpose` -> `purpose`
  - `title/sellingPoints/detailText/adText/videoScript` -> `materialContent.*`
  - `mainImageUrls/sceneImageUrls/imageUrls` -> `materialContent.*`

### 素材上传/更新
- Mock 方法：`api.saveTaskMaterials(taskId, payload)`
- 目标接口：`POST /api/tasks/{id}/materials`
- 入参建议：
  - `title`
  - `sellingPoints`
  - `detailText`
  - `adText`
  - `videoScript`
  - `mainImageUrls`
  - `sceneImageUrls`
  - `imageUrls`

### 任务查询
- Mock 方法：`api.getTaskList()` / `api.getTaskDetail(id)`
- 目标接口：`GET /api/tasks` / `GET /api/tasks/{id}`

## 检测

### 启动检测
- Mock 方法：`api.analyzeTask(taskId)`
- 目标接口：`POST /api/tasks/{id}/detect`
- 返回重点：
  - `totalScore`
  - `dimensionScores`
  - `riskLevel`
  - `decision`
  - `issues[]`
  - `suggestions[]`
  - `parseResult`
  - `optimization`
  - `explanation`

### 查询结果
- Mock 方法：`api.getDetectionResult(taskId)`
- 目标接口：`GET /api/tasks/{id}/result`

## 复核

### 提交人工复核申请
- Mock 方法：`api.requestManualReview(taskId, note?)`
- 目标接口：`POST /api/tasks/{id}/manual-review`

### 复核任务列表/详情
- Mock 方法：`api.getReviewTasks()` / `api.getReviewDetail(reviewId)`
- 目标接口：`GET /api/reviews` / `GET /api/reviews/{id}`

### 提交复核结论
- Mock 方法：`api.submitReviewDecision(reviewId, payload)`
- 目标接口：`POST /api/reviews/{id}/decision`
- 决策枚举保持一致：
  - `通过发布`
  - `退回优化`
  - `暂缓发布`

## 报告

### 生成报告
- Mock 方法：`api.generateReport(taskId)`
- 目标接口：`POST /api/tasks/{id}/report`

### 报告列表/详情
- Mock 方法：`api.getReportList()` / `api.getReportDetail(reportId)`
- 目标接口：`GET /api/reports` / `GET /api/reports/{id}`

### 导出报告
- Mock 方法：`api.downloadReport(reportId, format)`
- 目标接口：`POST /api/reports/export`
- `format`：`pdf | docx | json`

## 日志

### 日志查询
- Mock 方法：`api.getLogs()`
- 目标接口：`GET /api/logs`
- 字段对齐：
  - `id/logId`
  - `operator`
  - `role`
  - `action`
  - `target/targetId`
  - `result`
  - `ip`
  - `note`
  - `createdAt`

## 决策口径（统一）

- 风险等级：`低风险 | 中风险 | 高风险 | 严重风险`
- 发布决策：`可发布 | 优化后发布 | 人工复核 | 暂缓发布`
- 当前规则：
  - `低风险` -> `可发布`
  - `中风险` -> `优化后发布`
  - `高风险` -> `人工复核`
  - `严重风险` -> `暂缓发布`
