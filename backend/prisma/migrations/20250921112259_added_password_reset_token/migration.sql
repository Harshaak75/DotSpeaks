/*
  Warnings:

  - A unique constraint covering the columns `[passwordResetToken]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - Made the column `password` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ALTER COLUMN "password" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clients_passwordResetToken_key" ON "clients"("passwordResetToken");
