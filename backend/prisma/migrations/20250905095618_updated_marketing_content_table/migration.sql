/*
  Warnings:

  - You are about to drop the column `marketerContent` on the `MarketingContent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MarketingContent" DROP COLUMN "marketerContent",
ADD COLUMN     "content" TEXT;
