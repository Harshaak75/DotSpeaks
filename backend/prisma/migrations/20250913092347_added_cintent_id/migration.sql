/*
  Warnings:

  - Added the required column `contentId` to the `MarketingContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MarketingContent" ADD COLUMN     "contentId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "MarketingContent" ADD CONSTRAINT "MarketingContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
