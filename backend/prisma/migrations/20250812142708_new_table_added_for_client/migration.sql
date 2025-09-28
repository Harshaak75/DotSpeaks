/*
  Warnings:

  - You are about to drop the column `PackageName` on the `BrandHeadPackageAssignments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BrandHeadPackageAssignments" DROP COLUMN "PackageName",
ADD COLUMN     "packageId" UUID;

-- CreateTable
CREATE TABLE "Package" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAssignment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "BH_profile_id" UUID NOT NULL,
    "clinetId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");

-- AddForeignKey
ALTER TABLE "BrandHeadPackageAssignments" ADD CONSTRAINT "BrandHeadPackageAssignments_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAssignment" ADD CONSTRAINT "ClientAssignment_BH_profile_id_fkey" FOREIGN KEY ("BH_profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAssignment" ADD CONSTRAINT "ClientAssignment_clinetId_fkey" FOREIGN KEY ("clinetId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
