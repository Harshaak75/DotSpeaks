-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiryDate" TIMESTAMP(3);
