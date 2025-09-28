-- AlterTable
ALTER TABLE "TelecommunicatorLeads" ADD COLUMN     "assignedToId" UUID;

-- AddForeignKey
ALTER TABLE "TelecommunicatorLeads" ADD CONSTRAINT "TelecommunicatorLeads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
