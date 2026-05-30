-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'ENTERPRISE_ADMIN', 'OPERATOR', 'DESIGNER', 'REVIEWER', 'MANAGER', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'PENDING_DETECTION', 'DETECTING', 'COMPLETED', 'REPORTED', 'REVIEW_REQUIRED', 'HOLD');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('APPROVE', 'OPTIMIZE_AND_REVIEW', 'REJECT', 'HOLD');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('PLATFORM', 'MARKET_CULTURE', 'SENSITIVE_WORD', 'CATEGORY');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'RETURNED', 'HOLD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "companyName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sku" TEXT,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialContent" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT,
    "sellingPoints" JSONB,
    "detailText" TEXT,
    "adText" TEXT,
    "imageUrls" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetectionResult" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "completenessScore" INTEGER NOT NULL,
    "complianceScore" INTEGER NOT NULL,
    "localizationScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "decision" "DecisionType" NOT NULL,
    "issues" JSONB,
    "suggestions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DetectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "reportNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "detail" JSONB,
    "result" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewTask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "systemDecision" "DecisionType",
    "finalDecision" "DecisionType",
    "reason" TEXT,
    "comment" TEXT,
    "history" JSONB,
    "createdBy" TEXT NOT NULL,
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialContent_taskId_key" ON "MaterialContent"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "DetectionResult_taskId_key" ON "DetectionResult"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_taskId_key" ON "Report"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reportNo_key" ON "Report"("reportNo");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewTask_taskId_key" ON "ReviewTask"("taskId");

-- AddForeignKey
ALTER TABLE "MaterialTask" ADD CONSTRAINT "MaterialTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialContent" ADD CONSTRAINT "MaterialContent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MaterialTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectionResult" ADD CONSTRAINT "DetectionResult_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MaterialTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MaterialTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationLog" ADD CONSTRAINT "OperationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewTask" ADD CONSTRAINT "ReviewTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MaterialTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewTask" ADD CONSTRAINT "ReviewTask_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewTask" ADD CONSTRAINT "ReviewTask_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
