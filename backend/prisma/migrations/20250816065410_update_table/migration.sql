/*
  Warnings:

  - You are about to drop the `TelecommunicatorAssign` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TelecommunicatorAssign" DROP CONSTRAINT "TelecommunicatorAssign_business_developer_id_fkey";

-- DropForeignKey
ALTER TABLE "TelecommunicatorAssign" DROP CONSTRAINT "TelecommunicatorAssign_tele_id_fkey";

-- AlterTable
ALTER TABLE "BussinessDeveloper" ADD COLUMN     "forwardedByTelecommunicatorId" UUID;

-- DropTable
DROP TABLE "TelecommunicatorAssign";

-- AddForeignKey
ALTER TABLE "BussinessDeveloper" ADD CONSTRAINT "BussinessDeveloper_forwardedByTelecommunicatorId_fkey" FOREIGN KEY ("forwardedByTelecommunicatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
