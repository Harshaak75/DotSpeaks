/*
  Warnings:

  - A unique constraint covering the columns `[taskId]` on the table `DesignerSubmission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('UPLOADED', 'NOT_UPLOADED');

-- AlterTable
ALTER TABLE "MarketingContent" ADD COLUMN     "fileStatus" "FileStatus" NOT NULL DEFAULT 'NOT_UPLOADED';

-- CreateIndex
CREATE UNIQUE INDEX "DesignerSubmission_taskId_key" ON "DesignerSubmission"("taskId");
