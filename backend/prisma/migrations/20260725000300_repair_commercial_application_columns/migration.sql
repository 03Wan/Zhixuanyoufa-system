-- Older production databases may have recorded the tenant-hardening migration
-- before all CommercialApplication columns were created.  Keep this repair
-- idempotent so it is safe for both existing and fresh Supabase projects.
ALTER TABLE "CommercialApplication" ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE "CommercialApplication" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "CommercialApplication" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "CommercialApplication" ALTER COLUMN "userId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "CommercialApplication_email_createdAt_idx"
  ON "CommercialApplication"("email", "createdAt");
