# 智选优发（比赛展示版 MVP）

商品素材评估与发布决策辅助系统。

## 目录结构

- `frontend+`：前端（Vue 3 + TypeScript + Vite）
- `backend`：后端（NestJS + Prisma + MySQL）

## 快速启动

### 1. 前端

```bash
cd frontend+
npm install
npm run dev
```

默认访问：[http://localhost:5173](http://localhost:5173)

### 2. 后端

```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```

默认接口前缀（示例）：`http://localhost:3001/api`

## 环境变量

### 前端 `.env`

复制 `frontend+/.env.example` 为 `frontend+/.env`：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 后端 `.env`

复制 `backend/.env.example` 为 `backend/.env`：

```env
DATABASE_URL="mysql://root:password@localhost:3306/zhixuan_youfa"
JWT_SECRET="please_change_this_secret"
PORT=3000
```

## 当前演示模式（重要）

- 前端已内置 mock 回退逻辑：当后端不可达时，会自动使用本地 mock 数据。
- mock 与接口封装集中在：
  - `frontend+/src/lib/api.ts`
  - `frontend+/src/lib/mock/demo-data.ts`
  - `frontend+/src/lib/mock/dashboard.ts`
  - `frontend+/src/lib/audit-log.ts`

## 鉴权与权限

- token / 用户信息存储：`frontend+/src/lib/api.ts`
- 路由守卫：`frontend+/src/router/index.ts`
- 角色权限配置：`frontend+/src/lib/permissions.ts`
- 未登录访问业务页会跳转 `/login`
- 无权限访问会跳转 `/403`

## 演示测试账号（mock 登录）

可用任意邮箱+密码登录，系统会按邮箱关键字分配角色：

- `enterprise_admin@example.com` → 企业管理员
- `operator@example.com` → 运营人员
- `designer@example.com` → 设计人员
- `reviewer@example.com` → 复核人员
- `manager@example.com` → 管理人员
- `sysadmin@example.com` → 系统管理员

## 一键脚本

仓库根目录提供：

- `一键启动.bat`
- `一键停止.bat`

### 给他人直接演示（推荐）

1. 安装 Node.js 18+（建议 20 LTS）。
2. 确保电脑可用端口：`3001`（后端）和 `5174`（前端）。
3. 双击 `一键启动.bat`。

脚本会自动执行：
- 检查 npm 环境
- 自动创建缺失的 `.env`（从 `.env.example` 复制）
- 安装前后端依赖
- 生成 Prisma Client
- 启动前后端服务并自动打开演示页面

如启动异常，请查看根目录日志文件：`startup.log`。
结束服务可双击 `一键停止.bat`。

## 已实现核心业务闭环

登录注册 → 创建任务 → 录入素材 → 启动检测 → 查看检测结果 → 生成人工复核任务（高风险）→ 生成报告 → 报告查看/下载/打印 → 规则库维护 → 操作日志追踪

## GitHub 自动部署到 Vercel

仓库已内置 2 条 GitHub Actions 工作流：

- `.github/workflows/vercel-frontend.yml`
- `.github/workflows/vercel-backend.yml`

触发策略：

- 对 `frontend+/**` 的 PR：自动部署 `system` 预览环境
- 对 `frontend+/**` 合并到 `main`：自动部署 `system` 生产环境
- 对 `backend/**` 的 PR：自动部署 `system-api` 预览环境
- 对 `backend/**` 合并到 `main`：自动部署 `system-api` 生产环境

在 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 中新增：

- `VERCEL_TOKEN`：Vercel 访问令牌

说明：

- `VERCEL_ORG_ID` 和 `VERCEL_PROJECT_ID` 已写入 workflow（对应当前 `system` / `system-api`）。
- 这是“先提交 GitHub，再自动部署”的 CI/CD 路径，不依赖本机 `vercel` CLI 登录状态。

