/*
  Warnings:

  - You are about to drop the column `contact` on the `TelecommunicatorLeads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TelecommunicatorLeads" DROP COLUMN "contact",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "dynamicData" JSONB,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "uploadedLeadsId" UUID,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "UploadedLeads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fileName" TEXT NOT NULL,
    "uploadedBy" UUID,
    "quarter" TEXT NOT NULL,
    "totalLeads" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedLeads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TelecommunicatorLeads" ADD CONSTRAINT "TelecommunicatorLeads_uploadedLeadsId_fkey" FOREIGN KEY ("uploadedLeadsId") REFERENCES "UploadedLeads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
