-- DropForeignKey
ALTER TABLE "TelecommunicatorAssign" DROP CONSTRAINT "TelecommunicatorAssign_tele_id_fkey";

-- AlterTable
ALTER TABLE "TelecommunicatorLeads" ADD COLUMN     "telecommunicatorAssignId" UUID;

-- AddForeignKey
ALTER TABLE "TelecommunicatorLeads" ADD CONSTRAINT "TelecommunicatorLeads_telecommunicatorAssignId_fkey" FOREIGN KEY ("telecommunicatorAssignId") REFERENCES "TelecommunicatorAssign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelecommunicatorAssign" ADD CONSTRAINT "TelecommunicatorAssign_tele_id_fkey" FOREIGN KEY ("tele_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
