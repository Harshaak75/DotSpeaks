-- AlterTable
ALTER TABLE "TelecommunicatorLeads" ADD COLUMN     "packageId" UUID;

-- AlterTable
ALTER TABLE "UploadedLeads" ADD COLUMN     "packageId" UUID;

-- AddForeignKey
ALTER TABLE "UploadedLeads" ADD CONSTRAINT "UploadedLeads_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelecommunicatorLeads" ADD CONSTRAINT "TelecommunicatorLeads_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
