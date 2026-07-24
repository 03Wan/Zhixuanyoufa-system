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

### 部署与交付

前端采用 Vercel 托管，生产站点为 [paperhelper.fun](https://www.paperhelper.fun)。项目按前后端分离交付：

- 前端部署目录：`frontend+`
- 后端服务目录：`backend`
- 生产配置通过托管平台的环境变量管理，不提交凭据、Token 或连接字符串

发布前建议完成前端构建、后端测试、数据库迁移验证与关键业务路径验收。

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

### Deployment and delivery

The frontend is hosted on Vercel and available at [paperhelper.fun](https://www.paperhelper.fun). The repository follows a separated frontend/backend delivery model:

- Frontend deployment root: `frontend+`
- Backend service root: `backend`
- Production credentials, tokens, and connection strings are managed through hosting-provider environment variables and are never committed to the repository.

Before a production release, validate the frontend build, backend tests, database migrations, and the primary user journeys.

---

## License

This project is released under the [MIT License](LICENSE).
