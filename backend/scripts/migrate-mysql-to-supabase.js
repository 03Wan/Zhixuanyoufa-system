const mysql = require('mysql2/promise');
const { Client } = require('pg');

function parseJson(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function ensureSchema(pg) {
  const sql = `
DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('ADMIN','USER','ENTERPRISE_ADMIN','OPERATOR','DESIGNER','REVIEWER','MANAGER','SYSTEM_ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TaskStatus" AS ENUM ('DRAFT','PENDING_DETECTION','DETECTING','COMPLETED','REPORTED','REVIEW_REQUIRED','HOLD'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "RiskLevel" AS ENUM ('LOW','MEDIUM','HIGH'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "DecisionType" AS ENUM ('APPROVE','OPTIMIZE_AND_REVIEW','REJECT','HOLD'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "RuleType" AS ENUM ('PLATFORM','MARKET_CULTURE','SENSITIVE_WORD','CATEGORY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ReviewStatus" AS ENUM ('PENDING','APPROVED','RETURNED','HOLD'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "companyName" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE IF NOT EXISTS "MaterialTask" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "sku" TEXT,
  "productName" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "market" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE IF NOT EXISTS "MaterialContent" (
  "id" TEXT PRIMARY KEY,
  "taskId" TEXT NOT NULL UNIQUE REFERENCES "MaterialTask"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "title" TEXT,
  "sellingPoints" JSONB,
  "detailText" TEXT,
  "adText" TEXT,
  "imageUrls" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE IF NOT EXISTS "DetectionResult" (
  "id" TEXT PRIMARY KEY,
  "taskId" TEXT NOT NULL UNIQUE REFERENCES "MaterialTask"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "totalScore" INTEGER NOT NULL,
  "completenessScore" INTEGER NOT NULL,
  "complianceScore" INTEGER NOT NULL,
  "localizationScore" INTEGER NOT NULL,
  "riskLevel" "RiskLevel" NOT NULL,
  "decision" "DecisionType" NOT NULL,
  "issues" JSONB,
  "suggestions" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE IF NOT EXISTS "Rule" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" "RuleType" NOT NULL,
  "platform" TEXT,
  "market" TEXT,
  "category" TEXT,
  "riskLevel" "RiskLevel" NOT NULL,
  "keywords" JSONB NOT NULL,
  "suggestion" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT PRIMARY KEY,
  "taskId" TEXT NOT NULL UNIQUE REFERENCES "MaterialTask"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "reportNo" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE IF NOT EXISTS "OperationLog" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "detail" JSONB,
  "result" TEXT,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "ReviewTask" (
  "id" TEXT PRIMARY KEY,
  "taskId" TEXT NOT NULL UNIQUE REFERENCES "MaterialTask"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  "systemDecision" "DecisionType",
  "finalDecision" "DecisionType",
  "reason" TEXT,
  "comment" TEXT,
  "history" JSONB,
  "createdBy" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "reviewerId" TEXT REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);`;
  await pg.query(sql);
}

async function main() {
  const mysqlConn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || 'zhixuanyoufa',
    charset: 'utf8mb4',
  });

  const pgConn = new Client({
    connectionString: process.env.SUPABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pgConn.connect();

  try {
    await ensureSchema(pgConn);

    const [users] = await mysqlConn.query('SELECT * FROM `user`');
    const [rules] = await mysqlConn.query('SELECT * FROM `rule`');
    const [tasks] = await mysqlConn.query('SELECT * FROM `materialtask`');
    const [contents] = await mysqlConn.query('SELECT * FROM `materialcontent`');
    const [results] = await mysqlConn.query('SELECT * FROM `detectionresult`');
    const [reports] = await mysqlConn.query('SELECT * FROM `report`');
    const [logs] = await mysqlConn.query('SELECT * FROM `operationlog`');
    const [reviews] = await mysqlConn.query('SELECT * FROM `reviewtask`');

    await pgConn.query('BEGIN');
    await pgConn.query('TRUNCATE TABLE "ReviewTask","Report","DetectionResult","MaterialContent","MaterialTask","OperationLog","Rule","User" CASCADE');

    for (const r of users) {
      await pgConn.query(
        'INSERT INTO "User" ("id","username","email","passwordHash","companyName","role","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [r.id, r.username, r.email, r.passwordHash, r.companyName, r.role, r.createdAt, r.updatedAt]
      );
    }
    for (const r of rules) {
      await pgConn.query(
        'INSERT INTO "Rule" ("id","name","type","platform","market","category","riskLevel","keywords","suggestion","enabled","version","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
        [r.id, r.name, r.type, r.platform, r.market, r.category, r.riskLevel, JSON.stringify(parseJson(r.keywords)), r.suggestion, !!r.enabled, r.version, r.createdAt, r.updatedAt]
      );
    }
    for (const r of tasks) {
      await pgConn.query(
        'INSERT INTO "MaterialTask" ("id","userId","sku","productName","category","platform","market","purpose","status","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
        [r.id, r.userId, r.sku, r.productName, r.category, r.platform, r.market, r.purpose, r.status, r.createdAt, r.updatedAt]
      );
    }
    for (const r of contents) {
      await pgConn.query(
        'INSERT INTO "MaterialContent" ("id","taskId","title","sellingPoints","detailText","adText","imageUrls","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [r.id, r.taskId, r.title, JSON.stringify(parseJson(r.sellingPoints)), r.detailText, r.adText, JSON.stringify(parseJson(r.imageUrls)), r.createdAt, r.updatedAt]
      );
    }
    for (const r of results) {
      await pgConn.query(
        'INSERT INTO "DetectionResult" ("id","taskId","totalScore","completenessScore","complianceScore","localizationScore","riskLevel","decision","issues","suggestions","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
        [r.id, r.taskId, r.totalScore, r.completenessScore, r.complianceScore, r.localizationScore, r.riskLevel, r.decision, JSON.stringify(parseJson(r.issues)), JSON.stringify(parseJson(r.suggestions)), r.createdAt, r.updatedAt]
      );
    }
    for (const r of reports) {
      await pgConn.query(
        'INSERT INTO "Report" ("id","taskId","reportNo","title","summary","content","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [r.id, r.taskId, r.reportNo, r.title, r.summary, JSON.stringify(parseJson(r.content)), r.createdAt, r.updatedAt]
      );
    }
    for (const r of logs) {
      await pgConn.query(
        'INSERT INTO "OperationLog" ("id","userId","action","targetType","targetId","detail","result","ip","createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [r.id, r.userId, r.action, r.targetType, r.targetId, JSON.stringify(parseJson(r.detail)), r.result, r.ip, r.createdAt]
      );
    }
    for (const r of reviews) {
      await pgConn.query(
        'INSERT INTO "ReviewTask" ("id","taskId","status","systemDecision","finalDecision","reason","comment","history","createdBy","reviewerId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
        [r.id, r.taskId, r.status, r.systemDecision, r.finalDecision, r.reason, r.comment, JSON.stringify(parseJson(r.history)), r.createdBy, r.reviewerId, r.createdAt, r.updatedAt]
      );
    }
    await pgConn.query('COMMIT');

    const source = {
      users: users.length, rules: rules.length, tasks: tasks.length, contents: contents.length,
      results: results.length, reports: reports.length, logs: logs.length, reviews: reviews.length,
    };
    const targetRes = await pgConn.query(`
      SELECT
        (SELECT COUNT(*) FROM "User")::int users,
        (SELECT COUNT(*) FROM "Rule")::int rules,
        (SELECT COUNT(*) FROM "MaterialTask")::int tasks,
        (SELECT COUNT(*) FROM "MaterialContent")::int contents,
        (SELECT COUNT(*) FROM "DetectionResult")::int results,
        (SELECT COUNT(*) FROM "Report")::int reports,
        (SELECT COUNT(*) FROM "OperationLog")::int logs,
        (SELECT COUNT(*) FROM "ReviewTask")::int reviews
    `);
    console.log('MySQL counts:', source);
    console.log('Supabase counts:', targetRes.rows[0]);
    console.log('MySQL -> Supabase 迁移完成');
  } catch (e) {
    try { await pgConn.query('ROLLBACK'); } catch {}
    throw e;
  } finally {
    await mysqlConn.end();
    await pgConn.end();
  }
}

main().catch((e) => {
  console.error('迁移失败:', e);
  process.exit(1);
});
