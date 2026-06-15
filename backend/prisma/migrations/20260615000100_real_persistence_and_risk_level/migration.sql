-- Add critical risk level for persisted detection results.
ALTER TYPE "RiskLevel" ADD VALUE IF NOT EXISTS 'CRITICAL';

-- Persist server-side model configuration.
CREATE TABLE IF NOT EXISTS "ModelConfig" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'OPENAI_COMPATIBLE',
    "apiUrl" TEXT,
    "apiKeyCiphertext" TEXT,
    "modelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ModelConfig_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ModelConfig_ownerUserId_key" UNIQUE ("ownerUserId")
);

CREATE TABLE IF NOT EXISTS "CommercialApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "companyName" TEXT,
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommercialApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CommercialApplication_userId_createdAt_idx"
ON "CommercialApplication"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "CommercialApplication_status_createdAt_idx"
ON "CommercialApplication"("status", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ModelConfig_ownerUserId_fkey'
  ) THEN
    ALTER TABLE "ModelConfig"
      ADD CONSTRAINT "ModelConfig_ownerUserId_fkey"
      FOREIGN KEY ("ownerUserId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'CommercialApplication_userId_fkey'
  ) THEN
    ALTER TABLE "CommercialApplication"
      ADD CONSTRAINT "CommercialApplication_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
