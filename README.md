# 智选优发：跨境电商商品素材智能评估与发布决策系统

智选优发是一套面向跨境电商卖家、品牌出海企业、代运营机构和企业审核团队的商品素材发布前评估系统。系统在商品正式上架、广告投放或进入目标市场前，对标题、卖点、详情文案、广告语、商品图片及市场信息进行统一检测，输出素材质量评分、风险等级、优化建议、发布决策、人工复核结果和审核报告。

系统采用前后端分离架构，生产数据通过 NestJS、Prisma 和 Supabase PostgreSQL 持久化。前端默认连接正式 API，内置 mock 仅作为开发、演示和服务异常时的兜底能力，不作为生产数据来源。

## 生产环境

| 服务 | 地址或平台 |
|---|---|
| Web 前端 | [https://www.paperhelper.fun](https://www.paperhelper.fun) |
| 后端 API | [https://api.paperhelper.fun](https://api.paperhelper.fun) |
| API 前缀 | `https://api.paperhelper.fun/api` |
| 数据库 | Supabase PostgreSQL |
| 应用部署 | Vercel |
| DNS/CDN | Cloudflare |
| 源码与 CI/CD | GitHub + GitHub Actions |

生产前端必须请求 `https://api.paperhelper.fun/api`。不得将以下地址构建到生产包中：

```text
http://localhost:3001
http://127.0.0.1:3001
部署人员或其他用户电脑上的局域网地址
```

`localhost` 永远指向当前访问者自己的电脑。若生产包请求本地端口，其他用户登录时必然出现网络异常。

## 核心业务流程

```text
注册或登录
→ 用户与企业身份识别
→ 套餐和检测额度校验
→ 创建商品素材任务
→ 填写商品、平台、市场和发布目的
→ 录入标题、卖点、详情、广告语和图片
→ 规则引擎或模型执行检测
→ 生成完整性、合规性和本土化评分
→ 识别风险问题并输出优化建议
→ 给出可发布、优化后发布、人工复核或暂缓发布决策
→ 高风险任务自动进入人工复核
→ 生成、查看、下载和归档审核报告
→ 写入额度使用记录与操作日志
```

## 业务能力

### 用户与权限

- 用户注册、登录、退出和密码处理
- JWT 身份鉴权
- 当前用户资料查询与修改
- 用户创建、角色调整和删除
- 企业级数据范围隔离
- 前端路由权限和后端接口权限双重控制
- 系统管理员、企业管理员、运营、设计、复核、管理和客户查看角色

### 企业与客户

- 企业组织创建、查询、修改和删除
- 企业成员加入和角色配置
- 客户档案创建、检索和维护
- 企业、客户、任务之间的业务关联
- 企业套餐与服务状态管理

### 素材检测任务

- 创建、查询、修改、删除检测任务
- 商品 SKU、名称、品类、平台、市场和发布目的管理
- 标题、卖点、详情、广告语和图片素材管理
- 文件上传与任务文件列表
- 任务状态流转
- 检测前额度检查
- 手工发起人工复核
- 批量创建和运行检测任务
- 素材版本快照与历史版本查询

### 智能检测与决策

- 素材完整性检测
- 平台合规与敏感表达检测
- 目标市场本土化检测
- 图片缺失、数量和命名风险检测
- 多维评分和总分计算
- 风险等级判定
- 发布决策生成
- 问题定位和优化建议
- OpenAI Compatible 模型接入
- 模型不可用时使用后端规则引擎

### 人工复核

- 高风险与严重风险任务自动进入复核队列
- 复核人员领取和处理任务
- 通过发布、退回优化和暂缓发布决策
- 复核意见、原因和历史记录
- 复核结果同步到任务和报告

### 报告与审计

- 根据检测任务生成审核报告
- 报告列表、详情和删除
- 报告下载、打印和导出
- 自定义报告模板
- 系统操作日志
- 检测、用户、报告和管理操作追踪

### 套餐与商业能力

- 套餐列表和能力配置
- 当前订阅查询
- 套餐选择和升级
- 检测额度校验、扣减和使用记录
- API 开放能力目录与调用记录
- 商业合作申请和处理
- 数据分析看板

## 检测引擎

检测模块采用“模型能力 + 确定性规则”的混合架构。

### 检测顺序

1. 读取当前用户保存的模型配置。
2. 若模型已启用且连接参数有效，调用 OpenAI Compatible 接口。
3. 校验模型响应是否包含有效评分、风险、决策、问题和建议。
4. 模型未配置、连接失败、超时或响应无效时，使用后端规则引擎。
5. 在数据库事务中保存检测结果并更新任务状态。
6. 高风险或严重风险任务自动创建人工复核记录。
7. 检测成功后扣减套餐额度并记录使用明细。
8. 写入检测操作日志。

### 检测输入

- 商品名称
- 商品品类
- 目标平台
- 目标市场
- 发布目的
- 商品标题
- 商品卖点
- 详情文案
- 广告语
- 商品图片 URL

### 检测输出

- 总分
- 完整性评分
- 合规性评分
- 本土化评分
- 风险等级
- 发布决策
- 风险问题列表
- 命中内容和问题位置
- 优化建议
- 推荐改写内容

### 风险与决策

| 风险等级 | 典型处理 |
|---|---|
| 低风险 | 可发布 |
| 中风险 | 优化后发布 |
| 高风险 | 转人工复核 |
| 严重风险 | 暂缓发布 |

当前规则引擎总分由完整性、合规性和本土化维度加权计算。风险规则、目标市场规则和图片文件名规则位于后端 `detection` 模块，可在不修改 Controller 的情况下扩展。

## 技术架构

### 前端

- Vue 3
- TypeScript
- Vite
- Vue Router
- ECharts
- lucide-vue-next
- Liquid Glass 组件
- 响应式桌面优先界面

### 后端

- NestJS
- TypeScript
- Prisma ORM
- Passport
- JWT
- bcryptjs
- RESTful API
- class-validator / class-transformer

### 数据与基础设施

- Supabase PostgreSQL
- Supabase Transaction Pooler
- Prisma migration
- Vercel Functions
- Vercel 前后端独立项目
- Cloudflare DNS 与 TLS
- GitHub Actions 自动部署

### 生产请求链路

```text
浏览器
→ https://www.paperhelper.fun
→ Vue 前端
→ https://api.paperhelper.fun/api
→ NestJS Vercel Function
→ Prisma Client
→ Supabase Transaction Pooler
→ PostgreSQL
```

生产后端使用 Node.js 20。Prisma Client 同时包含本地开发需要的原生引擎和 Vercel Linux 运行时需要的 `rhel-openssl-3.0.x` 引擎。

## 项目目录

```text
.
├─ frontend+/
│  ├─ public/                 静态资源
│  ├─ src/
│  │  ├─ components/         通用界面组件
│  │  ├─ composables/        Vue 组合式能力
│  │  ├─ layouts/            应用整体布局
│  │  ├─ lib/                API、权限、对话框和审计辅助
│  │  ├─ router/             路由与登录/角色守卫
│  │  ├─ stores/             登录状态
│  │  ├─ styles/             全局主题
│  │  └─ views/              业务页面
│  ├─ package.json
│  ├─ vite.config.ts
│  └─ vercel.json
├─ backend/
│  ├─ api/                    Vercel Function 入口
│  ├─ prisma/
│  │  ├─ migrations/         PostgreSQL 迁移
│  │  ├─ schema.prisma       数据模型
│  │  └─ seed.ts             初始化数据
│  ├─ scripts/               数据修复与迁移工具
│  ├─ src/
│  │  ├─ auth/               注册、登录和 JWT
│  │  ├─ users/              用户管理
│  │  ├─ companies/          企业组织
│  │  ├─ customers/          客户档案
│  │  ├─ tasks/              检测任务
│  │  ├─ materials/          素材内容
│  │  ├─ detection/          检测与决策引擎
│  │  ├─ reviews/            人工复核
│  │  ├─ reports/            报告
│  │  ├─ rules/              规则库
│  │  ├─ subscription/       套餐与额度
│  │  ├─ dashboard/          数据看板
│  │  ├─ files/              文件上传
│  │  ├─ model-config/       模型配置
│  │  └─ health/             应用与数据库健康检查
│  ├─ package.json
│  └─ vercel.json
├─ docs/                      部署和接口文档
├─ scripts/                   仓库级辅助脚本
├─ .github/workflows/         GitHub Actions
├─ 一键启动.bat
└─ 一键停止.bat
```

## 本地开发

### 前置条件

- Node.js 20
- npm
- 可访问 Supabase
- 有效的 PostgreSQL 连接串
- Windows、macOS 或 Linux 开发环境

### 安装后端

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run start:dev
```

后端默认地址：

```text
http://localhost:3001
http://localhost:3001/api
```

### 安装前端

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

前端 `.env.example` 默认连接正式 API：

```env
VITE_API_BASE_URL=https://api.paperhelper.fun/api
VITE_USE_MOCK=false
```

需要联调本机后端时，将 `frontend+/.env` 改为：

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_MOCK=false
```

修改环境变量后必须重启 Vite。

### 一键启动

Windows 可运行仓库根目录的：

- `一键启动.bat`
- `一键停止.bat`

启动脚本会检查端口、安装依赖、生成 Prisma Client，并启动前端 `5174` 和后端 `3001`。首次启动前仍需确认 `backend/.env` 中的 Supabase 配置有效。

## 环境变量

### 前端

| 变量 | 必填 | 敏感 | 说明 |
|---|---:|---:|---|
| `VITE_API_BASE_URL` | 是 | 否 | 后端 API 前缀。生产必须为 `https://api.paperhelper.fun/api` |
| `VITE_USE_MOCK` | 否 | 否 | `true` 时完全使用 mock；生产应为 `false` |

Vite 环境变量会进入浏览器构建产物。不得在 `VITE_*` 变量中放数据库密码、JWT Secret 或模型 API Key。

### 后端

| 变量 | 必填 | 敏感 | 说明 |
|---|---:|---:|---|
| `DATABASE_URL` | 是 | 是 | Supabase 6543 Transaction Pooler 连接串 |
| `DIRECT_URL` | 是 | 是 | Supabase 5432 直连串，供 migration 使用 |
| `JWT_SECRET` | 是 | 是 | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | 否 | 否 | Token 有效期，默认可使用 `1d` |
| `CONFIG_ENCRYPTION_KEY` | 是 | 是 | 模型配置等敏感字段的加密密钥 |
| `PORT` | 本地必填 | 否 | 本地后端端口，默认 `3001` |
| `MODEL_PROVIDER` | 否 | 否 | 模型协议，默认 `OPENAI_COMPATIBLE` |
| `MODEL_API_URL` | 否 | 是 | 系统级模型 API 地址 |
| `MODEL_API_KEY` | 否 | 是 | 系统级模型密钥 |
| `MODEL_NAME` | 否 | 否 | 模型名称 |
| `CORS_ALLOWED_ORIGINS` | 否 | 否 | 额外允许来源，多个值使用英文逗号分隔 |

后端示例：

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"
JWT_SECRET="replace-with-a-long-random-value"
JWT_EXPIRES_IN="1d"
CONFIG_ENCRYPTION_KEY="replace-with-a-long-random-value"
PORT=3001
MODEL_PROVIDER="OPENAI_COMPATIBLE"
MODEL_API_URL=""
MODEL_API_KEY=""
MODEL_NAME="gpt-4.1-mini"
CORS_ALLOWED_ORIGINS=""
```

生产变量应配置在 Vercel 后端项目的 Production 环境。Preview 和 Development 环境应使用独立配置，避免预览部署误写生产数据库。

### Supabase 连接要求

- `DATABASE_URL` 使用 Transaction Pooler 的 `6543` 端口。
- 查询参数包含 `pgbouncer=true`。
- Serverless 环境建议使用 `connection_limit=1`。
- `DIRECT_URL` 使用 `5432` 直连端口，用于 Prisma migration。
- 密码中的 `@`、`#`、`%`、`:`、`/` 等字符必须 URL 编码。
- 不要在日志、README、Issue 或截图中公开完整连接串。

## 数据库初始化与迁移

### 首次初始化

```powershell
cd backend
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

### 开发迁移

开发环境修改 `schema.prisma` 后可使用：

```powershell
npx prisma migrate dev --name describe_your_change
```

生成的 migration 必须纳入版本控制并经过评审。

### 生产迁移

生产只使用：

```powershell
npx prisma migrate deploy
```

生产迁移要求：

1. 执行前备份数据库。
2. 评审 SQL 和数据兼容性。
3. 先在独立环境验证。
4. 执行 migration。
5. 检查 Prisma Client、健康接口和核心业务。
6. 观察 Vercel 与 Supabase 日志。

禁止在生产执行：

```text
prisma migrate reset
prisma db push --force-reset
```

## 鉴权与权限

### JWT 流程

```text
用户提交邮箱和密码
→ 后端从 Supabase 查询用户
→ bcrypt 校验密码哈希
→ JwtService 签发 access token
→ 前端保存 token 和用户摘要
→ 请求携带 Authorization: Bearer <token>
→ JwtStrategy 校验签名和有效期
→ JwtStrategy 再次查询真实用户
→ RolesGuard 校验接口角色
→ Service 按用户或企业范围查询数据
```

### 角色

| 角色代码 | 中文名称 | 主要职责 |
|---|---|---|
| `SYSTEM_ADMIN` | 系统管理员 | 平台级管理、全部业务和系统配置 |
| `ENTERPRISE_ADMIN` | 企业管理员 | 企业用户、任务、规则、客户和报告管理 |
| `OPERATOR` | 运营人员 | 创建任务、检测、客户、批量任务和报告 |
| `DESIGNER` | 设计人员 | 创建和修改素材、查看检测结果 |
| `REVIEWER` | 复核人员 | 处理人工复核、查看结果和报告 |
| `MANAGER` | 管理人员 | 数据看板、企业、客户、报告和审计 |
| `CUSTOMER_VIEWER` | 客户查看员 | 查看授权范围内的报告和数据 |

### 前端权限矩阵

| 功能 | 系统管理员 | 企业管理员 | 运营 | 设计 | 复核 | 管理 | 客户查看 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 首页 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 数据看板 | ✓ |  |  |  |  | ✓ | ✓ |
| 创建与维护任务 | ✓ | ✓ | ✓ | ✓ |  |  |  |
| 检测结果 | ✓ | ✓ | ✓ | ✓ | ✓ |  |  |
| 人工复核 | ✓ |  |  |  | ✓ |  |  |
| 报告中心 | ✓ | ✓ | ✓ |  | ✓ | ✓ | ✓ |
| 规则库 | ✓ | ✓ |  |  |  |  |  |
| 用户管理 | ✓ | ✓ |  |  |  |  |  |
| 企业组织 | ✓ | ✓ |  |  |  | ✓ |  |
| 客户档案 | ✓ | ✓ | ✓ |  |  | ✓ |  |
| 批量检测 | ✓ | ✓ | ✓ |  |  | ✓ |  |
| 操作日志 | ✓ | ✓ |  |  |  | ✓ |  |
| 报告模板 | ✓ | ✓ |  |  |  |  |  |

后端 Controller 和 Service 仍是最终授权边界。前端隐藏菜单不能替代后端权限校验。

## API 规范

### 统一成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

业务错误使用对应 HTTP 状态码，并返回可展示的 `message`。数据库初始化错误由统一 Prisma 异常过滤器处理。

### 主要接口组

| 路径 | 能力 |
|---|---|
| `/api/auth` | 注册、登录、找回和重置密码 |
| `/api/users` | 当前用户与用户管理 |
| `/api/tasks` | 任务、状态、检测、结果和人工复核 |
| `/api/tasks/:taskId/materials` | 任务素材 |
| `/api/tasks/:taskId/material-versions` | 素材版本 |
| `/api/files` | 文件上传和查询 |
| `/api/reviews` | 人工复核 |
| `/api/reports` | 报告生成、查询、导出和下载 |
| `/api/rules` | 规则与规则版本 |
| `/api/dashboard` | 数据看板 |
| `/api/plans` | 套餐 |
| `/api/subscription` | 当前订阅、额度和升级 |
| `/api/companies` | 企业组织与成员 |
| `/api/customers` | 客户档案 |
| `/api/batch-tasks` | 批量检测 |
| `/api/model-config` | 模型配置与连接测试 |
| `/api/report-templates` | 报告模板 |
| `/api/logs` | 操作日志 |
| `/api/api-open` | API 能力目录和调用记录 |
| `/api/commercial` | 商业合作申请 |
| `/api/health` | 应用与数据库健康检查 |

### 健康检查

```bash
curl https://api.paperhelper.fun/api/health
curl https://api.paperhelper.fun/api/health/database
```

数据库健康检查会执行真实 `SELECT 1`，仅返回脱敏的主机、端口、数据库、连接类型、延迟和错误摘要。

### 登录示例

```bash
curl -X POST https://api.paperhelper.fun/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}'
```

### 鉴权接口示例

```bash
curl https://api.paperhelper.fun/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

公开文档不保存演示账号、密码或生产凭据。用户可通过注册、管理员后台或受控初始化脚本创建。

## 真实接口与 mock 策略

前端 API 入口位于 `frontend+/src/lib/api.ts`。

### `VITE_USE_MOCK=false`

- 默认请求真实 API。
- 成功结果来自 Supabase 持久化数据。
- 服务不可达、超时或符合兜底条件时，部分功能可返回内置 mock 数据。
- mock 结果不会写入 Supabase。

### `VITE_USE_MOCK=true`

- 不请求真实业务接口。
- 使用浏览器内存中的 mock 数据。
- 刷新页面后部分 mock 状态可能重置。
- 仅用于界面开发、隔离测试和灾备展示。

生产排查时必须确认：

1. Vercel 前端环境中的 `VITE_USE_MOCK` 为 `false`。
2. 浏览器 Network 请求目标为 `https://api.paperhelper.fun/api`。
3. 数据操作后 Supabase 对应表发生变化。
4. 页面结果不是 mock token 或浏览器内存数据。

## Vercel 部署

### 前端项目

| 配置 | 值 |
|---|---|
| 根目录 | `frontend+` |
| 安装命令 | `npm install` |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| 正式域名 | `www.paperhelper.fun` |

生产环境变量：

```env
VITE_API_BASE_URL=https://api.paperhelper.fun/api
VITE_USE_MOCK=false
```

### 后端项目

| 配置 | 值 |
|---|---|
| 根目录 | `backend` |
| 安装命令 | `npm install` |
| 构建命令 | `npm run vercel-build` |
| Function 入口 | `backend/api/index.ts` |
| Node.js | 20 |
| 正式域名 | `api.paperhelper.fun` |

后端 Vercel 环境必须配置数据库、JWT 和加密变量。Prisma schema 已声明：

```prisma
binaryTargets = ["native", "rhel-openssl-3.0.x"]
```

这可避免 Vercel 运行时因缺少 RHEL Query Engine 而导致所有数据库请求失败。

### GitHub Actions

仓库包含：

- `.github/workflows/vercel-frontend.yml`
- `.github/workflows/vercel-backend.yml`

行为：

- Pull Request 部署 Preview。
- 推送 `main` 部署 Production。
- 前后端部署到独立 Vercel 项目。
- GitHub 仓库需要配置 `VERCEL_TOKEN` Secret。

后端工作流仅在 `backend/**` 或后端工作流自身变化时触发。前端工作流当前在推送 `main` 或创建 Pull Request 时触发。

## Cloudflare、DNS 与 CORS

### 域名

- `www.paperhelper.fun` 指向前端 Vercel 项目。
- `api.paperhelper.fun` 指向后端 Vercel 项目。
- Cloudflare SSL/TLS 推荐使用 `Full (strict)`，最低使用 `Full`。
- DNS 记录以 Vercel Domain 页面给出的目标为准。

### CORS

后端内置允许：

- `https://www.paperhelper.fun`
- `https://paperhelper.fun`
- 本地 `5173`、`5174`
- 配置在 `CORS_ALLOWED_ORIGINS` 中的来源
- Vercel Preview 域名

生产预检应返回：

```text
HTTP 204
Access-Control-Allow-Origin: https://www.paperhelper.fun
Access-Control-Allow-Credentials: true
```

若其他用户电脑登录失败，首先确认请求目标不是该用户电脑上的 `localhost:3001`。

## 生产验收

部署后至少完成以下检查：

### 基础设施

- `www.paperhelper.fun` DNS 和 TLS 正常。
- `api.paperhelper.fun` DNS 和 TLS 正常。
- Vercel Function 可启动。
- `/api/health` 返回 `status: ok`。
- `/api/health/database` 返回 `status: ok`。
- Prisma Client 能加载 `rhel-openssl-3.0.x` 引擎。
- Supabase 查询成功且延迟在可接受范围内。

### 登录与权限

- 新用户可以注册。
- 已有用户可以登录。
- 登录返回有效 JWT。
- JWT 可访问 `/api/users/me`。
- 不同角色只能访问授权页面和接口。
- 退出或 Token 失效后不能访问受保护资源。

### 核心业务

- 创建任务后 Supabase 出现任务记录。
- 素材内容与任务正确关联。
- 文件上传后可查询文件记录。
- 检测结果写入数据库。
- 高风险任务生成复核记录。
- 检测成功后额度扣减。
- 使用记录和操作日志可查询。
- 报告可生成、查看和下载。
- 数据看板返回真实聚合数据。

## 故障排查

### 登录显示“网络异常”

1. 打开浏览器开发者工具 Network。
2. 确认请求 URL 为 `https://api.paperhelper.fun/api/auth/login`。
3. 若请求指向 `localhost:3001`，修正 `VITE_API_BASE_URL` 后重新构建。
4. 请求 `/api/health` 检查 Function。
5. 请求 `/api/health/database` 检查 Supabase。
6. 检查 Cloudflare DNS、TLS 和 Vercel Domain 状态。
7. 检查 OPTIONS 预检和 `Access-Control-Allow-Origin`。

### 页面显示 `Unauthorized`

1. 清除浏览器中的旧 Token 和用户缓存。
2. 重新登录。
3. 检查生产 `JWT_SECRET` 是否被修改。
4. 检查用户是否存在于 Supabase。
5. 检查 Token 是否过期。
6. 检查用户角色是否允许访问当前路由。
7. 使用返回的 Token 请求 `/api/users/me`。

### 显示数据库不可用

1. 检查 Supabase 项目状态。
2. 检查 `DATABASE_URL` 和 `DIRECT_URL` 是否属于正确项目。
3. 检查 Pooler 主机、项目引用和端口。
4. 检查密码特殊字符是否 URL 编码。
5. 检查 Vercel Production 环境变量。
6. 调用 `/api/health/database` 查看脱敏错误。
7. 检查 Prisma Client 是否包含 `rhel-openssl-3.0.x`。
8. 检查 Supabase 网络限制和连接数。

### 构建后仍运行旧前端代码

1. 检查 `frontend+/src` 是否出现生成的 `.js` 或 `.d.ts`。
2. 确认构建命令为 `vue-tsc --noEmit && vite build`。
3. 删除 `frontend+/.vite` 和 `frontend+/dist`。
4. 重新执行 `npm run build`。
5. 重新部署前端并强制刷新浏览器缓存。

TypeScript 和 Vue 源码目录中不应保存编译后的同名 `.js` 文件。Vite 解析同名模块时可能加载旧 `.js`，造成修改 `.ts` 后页面行为不更新。

### API 超时

1. 检查 Supabase Pooler 状态和连接限制。
2. 确认 `connection_limit=1`。
3. 检查模型调用是否超过后端超时时间。
4. 检查 Vercel Function 日志。
5. 检查请求是否包含超大素材或文件。
6. 检查第三方模型 API 的网络和限流状态。

### 模型检测失败

1. 在模型配置页执行连接测试。
2. 检查 API URL、API Key 和模型名称。
3. 确认接口兼容 OpenAI Chat Completions。
4. 检查返回内容是否为有效 JSON。
5. 模型不可用时确认规则引擎仍能生成检测结果。

## 安全规范

- 不提交 `.env`、数据库密码、JWT Secret、模型 API Key 或加密密钥。
- 不在 README、Issue、日志和截图中公开完整数据库连接串。
- 正式环境必须修改所有初始化密码。
- 正式环境应禁用不需要的演示账号。
- `JWT_SECRET` 和 `CONFIG_ENCRYPTION_KEY` 使用高强度随机值。
- Vercel Preview 与 Production 使用独立环境变量。
- 所有管理接口必须同时经过 JWT 和角色授权。
- Service 层查询必须执行企业或用户数据范围限制。
- 日志不得记录密码、完整 Token、API Key 和完整数据库 URL。
- 数据库迁移前必须备份。
- 定期轮换数据库密码、JWT Secret、Vercel Token 和模型密钥。
- 发现密钥进入 Git 历史后，应立即吊销并重新生成，仅删除文件不足以消除风险。

## 内部账号与运维信息

公开 README 不保存演示邮箱和密码。内部账号、Vercel 项目映射、验收记录和联系人保存在本地：

```text
docs/operations.local.md
```

该文件已被 `.gitignore` 排除。正式交付时应使用受控密码管理工具保存敏感信息，而不是依赖本地 Markdown。

## 发布流程

```text
代码检查
→ 前后端构建
→ 数据库迁移评审
→ 核心自动或手工测试
→ 提交 Git
→ GitHub Actions 部署
→ 检查 Vercel 构建结果
→ 应用与数据库健康检查
→ 登录和 JWT 检查
→ 核心业务链路回归
→ 观察 Vercel 与 Supabase 日志
```

建议每次发布记录：

- Git commit
- 前端部署 ID
- 后端部署 ID
- migration 名称
- 执行人
- 验收结果
- 已知风险
- 回滚目标

## 回滚原则

- 前端和后端可以分别回滚到上一稳定 Vercel Deployment。
- 回滚后重新验证 API、JWT、CORS 和数据库连接。
- 数据库 migration 回滚必须单独评估，不能简单依赖应用回滚。
- 不使用 `prisma migrate reset` 处理生产故障。
- 已执行的破坏性数据变更应通过备份恢复或经过评审的补偿 migration 处理。
- 回滚期间应暂停可能继续写入不兼容数据的业务入口。

## 构建与质量检查

### 前端

```powershell
cd frontend+
npm run build
```

构建执行：

```text
vue-tsc --noEmit
vite build
```

类型检查不会再向 `src` 生成 `.js` 和 `.d.ts`。

### 后端

```powershell
cd backend
npm run prisma:generate
npm run build
```

### 提交前检查

```powershell
git status
git diff --check
```

确认：

- 没有提交 `.env`。
- 没有生成的前端源码副本。
- 没有 `dist`、`.vite`、日志或 `.vercel` 元数据。
- Prisma migration 与 schema 一致。
- README 中没有真实密码、Token 或连接串。

## 相关文档

- `docs/deployment-vercel-supabase.md`：Vercel、Cloudflare 和 Supabase 部署说明
- `docs/mock-api-mapping.md`：前端 mock 与接口映射
- `docs/vercel-deploy-history.md`：历史部署记录
- `backend/prisma/schema.prisma`：数据库模型
- `backend/.env.example`：后端变量模板
- `frontend+/.env.example`：前端变量模板

