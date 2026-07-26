CREATE TABLE "PublicationOutcome" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "publishedAt" TIMESTAMP(3),
  "listingId" TEXT,
  "firstPass" BOOLEAN,
  "rejectionReason" TEXT,
  "note" TEXT,
  "recordedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PublicationOutcome_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PublicationOutcome_taskId_key" ON "PublicationOutcome"("taskId");
ALTER TABLE "PublicationOutcome" ADD CONSTRAINT "PublicationOutcome_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MaterialTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
