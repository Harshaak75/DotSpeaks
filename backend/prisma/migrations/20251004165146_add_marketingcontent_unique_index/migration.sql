/*
  Warnings:

  - A unique constraint covering the columns `[contentId,date,platform,postType]` on the table `MarketingContent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'YOUTUBE', 'TWITTER');

-- CreateIndex
CREATE UNIQUE INDEX "MarketingContent_contentId_date_platform_postType_key" ON "MarketingContent"("contentId", "date", "platform", "postType");
