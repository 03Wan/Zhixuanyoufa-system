# 智选优发 · ZhiXuanYouFa

> 跨境商品发布前的智能决策伙伴  
> Intelligent pre-publish readiness for cross-border commerce teams.

[中文](#中文) · [English](#english) · [License](#license)

![智选优发商品素材场景](frontend+/public/assets/kettle-product.png)

---

## 中文

### 产品简介

智选优发面向跨境电商运营、品牌、设计与合规团队，帮助团队在商品发布前统一整理素材、匹配目标平台与市场要求，并将发布准备过程沉淀为可协作、可追溯的工作流。

它不是又一个内容生成工具，而是为“发布之前该准备什么、由谁确认、如何协作”提供清晰的工作界面。

### 核心能力

- 发布前准备：围绕目标平台、市场与商品类目组织发布任务。
- 素材集中管理：统一承接商品文案、图片与详情页内容。
- 团队协作：支持运营、设计、品牌与合规角色在同一任务中协同。
- 规则体系：将平台规则、市场要求和类目限制纳入统一管理。
- 过程可追溯：为发布准备、复核与处理记录保留清晰依据。

### 公共站体验

公共页面统一采用“未来审校中枢”视觉语言：深海军蓝底色、电光青规则网络、动态扫描与分层数据面板共同呈现发布决策过程。

- 首页通过规则网络和审校结果面板说明“审校什么、如何判断、下一步做什么”。
- 产品能力、适用平台、解决方案、套餐价格与关于项目页面共享导航、页脚、卡片和状态组件。
- 内容随滚动渐进呈现；系统开启“减少动态效果”时自动切换为稳定的静态展示。
- 移动端减少高成本视觉效果，并保留完整文案、导航、登录和申请试点入口。

### 适用场景

| 场景 | 价值 |
| --- | --- |
| 新品上架 | 在首发前集中完成素材与发布准备。 |
| 多平台发布 | 按不同平台和市场组织对应的发布要求。 |
| 团队复核 | 减少跨角色沟通成本，统一处理结论。 |
| 品牌规范管理 | 让素材准备与品牌、市场表达保持一致。 |

### 技术概览

- 前端：Vue 3、TypeScript、Vite、Vue Router、ECharts
- 服务端：NestJS、Prisma、PostgreSQL、JWT/Passport
- 数据服务：Supabase PostgreSQL 与 Storage

### 本地运行

需要 Node.js 18+、npm，以及可用的 PostgreSQL/Supabase 配置。

Windows 用户可在项目根目录运行 `一键启动.bat`。脚本会安装依赖、生成 Prisma Client，并启动：

- 公共首页：<http://localhost:5073/home-public>
- 前端开发服务：<http://localhost:5073>
- 后端 API：<http://localhost:3000>

首次运行前，请根据 `frontend+/.env.example` 与 `backend/.env.example` 配置本地环境变量。也可以手动启动：

```powershell
cd backend
npm install
npm run prisma:generate
npm run start:dev

cd ../frontend+
npm install
npm run dev -- --host 0.0.0.0 --port 5073
```

### 构建与验证

```powershell
cd frontend+
npm run build

cd ../backend
npm run build
npm test
```

### 部署与交付

前端采用 Vercel 托管，生产站点为 [myboverse.com](https://www.myboverse.com)。项目按前后端分离交付：

- 前端部署目录：`frontend+`
- 后端服务目录：`backend`
- 生产配置通过托管平台的环境变量管理，不提交凭据、Token 或连接字符串

发布前建议完成前端构建、后端测试、数据库迁移验证与关键业务路径验收。

详细配置与上线检查见 [Vercel + Cloudflare + Supabase 部署说明](docs/deployment-vercel-supabase.md)，产品与技术细节见 [技术与功能说明书](docs/智选优发技术与功能说明书.md)。

---

## English

### Overview

ZhiXuanYouFa is a pre-publish readiness platform for cross-border commerce teams. It gives operations, brand, design, and compliance teams a shared workspace for preparing product materials, aligning release requirements, and retaining a clear decision trail before a listing goes live.

It is not another generic content-generation tool. It is a focused operational layer for deciding what needs to be prepared, who needs to review it, and how a team moves a listing toward release.

### Key capabilities

- Pre-publish preparation organized by marketplace, market, and product category.
- Centralized handling of product copy, images, and detail-page content.
- Shared workflows for operations, design, brand, and compliance roles.
- Unified management of platform policies, market requirements, and category constraints.
- Traceable preparation and review records for each publishing workflow.

### Public-site experience

The complete public site now uses a unified “future review command center” system: a deep navy canvas, electric-cyan rule network, scanning states, and layered decision panels explain how a listing moves toward release.

- Shared navigation, footer, cards, and status components across all public routes.
- Progressive scroll reveals with a stable `prefers-reduced-motion` fallback.
- Mobile-friendly effects that preserve complete content and all primary actions.

### Primary use cases

| Use case | Outcome |
| --- | --- |
| New product launches | Prepare core listing materials before first release. |
| Multi-marketplace publishing | Keep requirements aligned across marketplaces and markets. |
| Cross-functional review | Reduce handoff friction and retain clear decisions. |
| Brand governance | Keep publishing preparation consistent with brand standards. |

### Technology

- Frontend: Vue 3, TypeScript, Vite, Vue Router, ECharts
- Backend: NestJS, Prisma, PostgreSQL, JWT/Passport
- Data services: Supabase PostgreSQL and Storage

### Local development

Requirements: Node.js 18+, npm, and a configured PostgreSQL/Supabase environment. On Windows, run `一键启动.bat` from the repository root, or start each service manually:

```powershell
cd backend
npm install
npm run prisma:generate
npm run start:dev

cd ../frontend+
npm install
npm run dev -- --host 0.0.0.0 --port 5073
```

The public home page is available at <http://localhost:5073/home-public>; the API runs at <http://localhost:3000>.

### Build and verification

```powershell
cd frontend+
npm run build

cd ../backend
npm run build
npm test
```

### Deployment and delivery

The frontend is hosted on Vercel and available at [myboverse.com](https://www.myboverse.com). The repository follows a separated frontend/backend delivery model:

- Frontend deployment root: `frontend+`
- Backend service root: `backend`
- Production credentials, tokens, and connection strings are managed through hosting-provider environment variables and are never committed to the repository.

Before a production release, validate the frontend build, backend tests, database migrations, and the primary user journeys.

See the [deployment guide](docs/deployment-vercel-supabase.md) for Vercel, Cloudflare, and Supabase configuration.

---

## License

This project is released under the [GNU Affero General Public License v3.0 only](LICENSE) (`AGPL-3.0-only`).

AGPLv3 is a strong copyleft license designed for network-interactive software. If you modify and operate this software for users over a network, review the license obligations for providing the corresponding source code.
