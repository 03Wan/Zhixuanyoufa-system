# 智选优发

智选优发是一套面向跨境电商场景的商品素材发布前检测与决策系统。  
系统用于在商品正式上架、投放广告或进入目标市场前，对标题、卖点、详情文案、广告语和图片素材进行统一检测，输出风险等级、优化建议、发布建议和审核留痕。

## 项目简介

项目采用前后端分离架构：

- 前端：Vue 3 + Vite
- 后端：NestJS + Prisma
- 数据库：Supabase PostgreSQL
- 部署：Vercel

当前系统覆盖素材检测、风险评估、人工复核、报告归档、用户权限、企业与客户管理等核心流程，适合作为演示版、MVP 版和持续迭代的业务底座。

## 核心功能

### 1. 素材检测

- 检测标题、卖点、详情、广告语、图片等素材内容
- 支持按平台、市场、商品类型进行评估
- 输出完整性、合规性、本地化等维度结果

### 2. 风险评估与发布建议

- 输出风险等级、问题定位和优化建议
- 根据检测结果给出发布建议
- 支持模型能力与规则引擎结合

### 3. 人工复核

- 高风险任务进入人工复核流程
- 支持复核意见记录与流转
- 复核结果可同步回任务与报告

### 4. 报告与日志

- 生成检测报告
- 支持历史查看、归档和导出
- 记录关键操作日志，便于追踪审计

### 5. 用户与组织管理

- 用户注册、登录、角色权限控制
- 企业组织管理
- 客户档案管理
- 套餐、额度和使用记录管理

## 技术栈

### 前端

- Vue 3
- TypeScript
- Vite
- Vue Router
- ECharts

### 后端

- NestJS
- Prisma ORM
- PostgreSQL
- JWT / Passport

### 基础设施

- Supabase PostgreSQL
- Vercel
- GitHub Actions

## 项目结构

```text
.
├─ frontend+/   前端项目
├─ backend/     后端项目
├─ docs/        补充文档
└─ .github/     CI/CD 配置
```

## 线上地址

- 前端：https://paperhelper.fun
- API：https://api.paperhelper.fun/api

## 本地启动

### 启动后端

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run start:dev
```

后端默认地址：

```text
http://localhost:3001/api
```

### 启动前端

```powershell
cd frontend+
npm install
Copy-Item .env.example .env
npm run dev
```

前端默认地址：

```text
http://localhost:5174
```

## 前端环境变量

生产环境：

```env
VITE_API_BASE_URL=https://api.paperhelper.fun/api
VITE_USE_MOCK=false
```

本地联调：

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_MOCK=false
```

## 部署说明

- `main` 分支推送后会触发 Vercel 生产部署
- 前后端为两个独立的 Vercel 项目
- 生产前端必须使用 `https://api.paperhelper.fun/api`

## 说明

- `localhost` 只能指向当前设备，不能作为线上 API 地址
- 如页面内容或样式未更新，先强刷浏览器缓存
