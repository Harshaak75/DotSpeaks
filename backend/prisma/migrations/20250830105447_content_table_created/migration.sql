-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('pending_review', 'approved', 'rework_requested');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PDF', 'Word');

-- CreateTable
CREATE TABLE "Content" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID,
    "contentWriterId" UUID,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'pending_review',
    "documentUrl" TEXT,
    "documentType" "DocumentType",
    "reworkComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_contentWriterId_fkey" FOREIGN KEY ("contentWriterId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
