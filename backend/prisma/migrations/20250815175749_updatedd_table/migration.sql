/*
  Warnings:

  - You are about to drop the column `telecommunicatorAssignId` on the `TelecommunicatorLeads` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TelecommunicatorAssign" DROP CONSTRAINT "TelecommunicatorAssign_business_developer_id_fkey";

-- DropForeignKey
ALTER TABLE "TelecommunicatorLeads" DROP CONSTRAINT "TelecommunicatorLeads_telecommunicatorAssignId_fkey";

-- AlterTable
ALTER TABLE "TelecommunicatorLeads" DROP COLUMN "telecommunicatorAssignId";

-- AddForeignKey
ALTER TABLE "TelecommunicatorAssign" ADD CONSTRAINT "TelecommunicatorAssign_business_developer_id_fkey" FOREIGN KEY ("business_developer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
