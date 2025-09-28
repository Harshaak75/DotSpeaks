/*
  Warnings:

  - You are about to drop the column `marketerTitle` on the `MarketingContent` table. All the data in the column will be lost.
  - Added the required column `campaignTitle` to the `MarketingContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MarketingContent" DROP COLUMN "marketerTitle",
ADD COLUMN     "campaignTitle" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;
