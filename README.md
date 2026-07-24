# 智选优发

智选优发是一套面向跨境电商企业团队的商品素材发布前检测、风险评估、复核协作与报告归档系统。

## 项目概览

- 前端：Vue 3、TypeScript、Vite、Vue Router、ECharts
- 后端：NestJS、Prisma、PostgreSQL、JWT/Passport
- 数据：Supabase PostgreSQL 与 Supabase Storage
- 部署：Vercel、GitHub Actions

系统覆盖素材录入、图片上传、规则检测、风险评分、人工复核、报告导出、企业账号申请、成员权限、企业与客户管理、操作审计等流程。生产环境默认连接真实 API 与数据库，不启用本地假数据降级。

## 运行要求

后端生产环境必须显式配置以下变量：

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `CONFIG_ENCRYPTION_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` 或 `SUPABASE_SECRET_KEY`
- `SUPABASE_STORAGE_BUCKET`

## 常用命令

```bash
cd backend
npm ci
npm run prisma:generate
npm run lint
npm test
npm run build

cd ../frontend+
npm ci
npm run build
```

生产包禁用词扫描：

```bash
node scripts/scan_forbidden_terms.mjs
```

## 发布前检查

- 执行数据库备份与密钥轮换
- 执行 Prisma 迁移并完成真实读写验证
- 确认 `/api/health/live` 与 `/api/health/ready` 状态
- 确认前端生产包禁用词扫描通过
- 确认依赖审计、后端自动化校验、前后端构建全部通过
