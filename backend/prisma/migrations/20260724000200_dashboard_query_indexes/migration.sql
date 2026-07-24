-- Keep dashboard aggregates fast as task and review history grows.
CREATE INDEX IF NOT EXISTS "MaterialTask_userId_createdAt_idx" ON "MaterialTask"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "MaterialTask_companyId_createdAt_idx" ON "MaterialTask"("companyId", "createdAt");
CREATE INDEX IF NOT EXISTS "DetectionResult_riskLevel_idx" ON "DetectionResult"("riskLevel");
CREATE INDEX IF NOT EXISTS "ReviewTask_status_idx" ON "ReviewTask"("status");
