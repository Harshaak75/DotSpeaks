/*
  Warnings:

  - You are about to drop the column `content` on the `MarketingContent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MarketingContent" DROP COLUMN "content",
ADD COLUMN     "branding" TEXT,
ADD COLUMN     "cta" TEXT,
ADD COLUMN     "designerTitle" TEXT,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "marketerContent" TEXT,
ADD COLUMN     "marketerTitle" TEXT,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "objective" TEXT,
ADD COLUMN     "visual" TEXT;
