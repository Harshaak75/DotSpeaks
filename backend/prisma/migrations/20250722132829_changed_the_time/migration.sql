/*
  Warnings:

  - You are about to drop the column `date` on the `attendance` table. All the data in the column will be lost.
  - The `logout_time` column on the `attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `login_time` to the `attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_profilesId_fkey";

-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "date",
DROP COLUMN "login_time",
ADD COLUMN     "login_time" TIMESTAMPTZ(6) NOT NULL,
DROP COLUMN "logout_time",
ADD COLUMN     "logout_time" TIMESTAMPTZ(6);
