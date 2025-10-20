/*
  Warnings:

  - You are about to drop the `CmoQuarterTargets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CmoQuarterTargets" DROP CONSTRAINT "CmoQuarterTargets_cmoId_fkey";

-- DropTable
DROP TABLE "CmoQuarterTargets";

-- CreateTable
CREATE TABLE "BroadcastLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BroadcastLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BroadcastLog_type_version_key" ON "BroadcastLog"("type", "version");
