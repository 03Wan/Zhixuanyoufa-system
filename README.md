# 智选优发

跨境电商商品素材发布前检测、评估与决策系统。

## 线上地址

- 前端: [https://paperhelper.fun](https://paperhelper.fun)
- API: [https://api.paperhelper.fun/api](https://api.paperhelper.fun/api)

## 项目结构

```text
.
├─ frontend+/   Vue 3 + Vite 前端
├─ backend/     NestJS + Prisma 后端
├─ docs/        补充文档
└─ .github/     CI/CD 配置
```

## 核心能力

- 素材检测: 标题、卖点、详情、广告语、图片
- 风险评估: 输出评分、风险等级、发布建议
- 人工复核: 高风险任务进入复核流转
- 报告归档: 检测结果、日志、报告留痕
- 用户体系: 用户、企业、客户、角色权限

## 技术栈

- 前端: Vue 3、TypeScript、Vite
- 后端: NestJS、Prisma、PostgreSQL
- 部署: Vercel
- 数据库: Supabase PostgreSQL

## 本地启动

### 后端

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run start:dev
```

默认地址:

```text
http://localhost:3001/api
```

### 前端

```powershell
cd frontend+
npm install
Copy-Item .env.example .env
npm run dev
```

默认地址:

```text
http://localhost:5174
```

## 前端环境变量

生产环境:

```env
VITE_API_BASE_URL=https://api.paperhelper.fun/api
VITE_USE_MOCK=false
```

本地联调:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_MOCK=false
```

## 部署说明

- `main` 分支推送后会触发 Vercel 生产部署
- 前后端是两个独立的 Vercel 项目
- 生产前端必须请求 `https://api.paperhelper.fun/api`

## 备注

- `localhost` 只能指向当前电脑，不能作为线上 API 地址
- 如果页面样式或接口看起来没更新，先强刷浏览器缓存
