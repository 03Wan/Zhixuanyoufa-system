ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "FileAsset" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "CommercialApplication" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "CommercialApplication" ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE "CommercialApplication" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "CommercialApplication" ADD COLUMN IF NOT EXISTS "phone" TEXT;

UPDATE "Company" SET "serviceStatus" = 'OPENING' WHERE "serviceStatus" = '试点中';
UPDATE "Customer" SET "serviceStatus" = 'OPENING' WHERE "serviceStatus" = '试点中';

ALTER TABLE "Company" ALTER COLUMN "serviceStatus" SET DEFAULT 'OPENING';
ALTER TABLE "Customer" ALTER COLUMN "serviceStatus" SET DEFAULT 'OPENING';

UPDATE "User" u
SET "companyId" = c."id"
FROM "Company" c
WHERE u."companyId" IS NULL
  AND u."companyName" IS NOT NULL
  AND c."name" = u."companyName";

UPDATE "MaterialTask" t
SET "companyId" = u."companyId"
FROM "User" u
WHERE t."companyId" IS NULL
  AND t."userId" = u."id"
  AND u."companyId" IS NOT NULL;

UPDATE "Customer" c
SET "companyId" = u."companyId"
FROM "User" u
WHERE c."companyId" IS NULL
  AND c."ownerUserId" = u."id"
  AND u."companyId" IS NOT NULL;

UPDATE "FileAsset" f
SET "companyId" = COALESCE(t."companyId", u."companyId")
FROM "User" u
LEFT JOIN "MaterialTask" t ON t."id" = f."taskId"
WHERE f."companyId" IS NULL
  AND f."userId" = u."id";

UPDATE "Subscription" s
SET "companyId" = c."id"
FROM "Company" c
WHERE s."companyId" IS NULL
  AND c."name" = s."companyName";

CREATE INDEX IF NOT EXISTS "User_companyId_idx" ON "User"("companyId");
CREATE INDEX IF NOT EXISTS "Subscription_companyId_idx" ON "Subscription"("companyId");
CREATE INDEX IF NOT EXISTS "FileAsset_companyId_idx" ON "FileAsset"("companyId");
CREATE INDEX IF NOT EXISTS "CommercialApplication_email_createdAt_idx" ON "CommercialApplication"("email", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'User_companyId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Subscription_companyId_fkey'
  ) THEN
    ALTER TABLE "Subscription"
      ADD CONSTRAINT "Subscription_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'FileAsset_companyId_fkey'
  ) THEN
    ALTER TABLE "FileAsset"
      ADD CONSTRAINT "FileAsset_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
