/*
  Warnings:

  - A unique constraint covering the columns `[sourceLeadId]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "sourceLeadId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "clients_sourceLeadId_key" ON "clients"("sourceLeadId");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_sourceLeadId_fkey" FOREIGN KEY ("sourceLeadId") REFERENCES "TelecommunicatorLeads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
