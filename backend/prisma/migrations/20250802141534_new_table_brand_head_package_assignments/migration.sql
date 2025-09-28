-- CreateTable
CREATE TABLE "BrandHeadPackageAssignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "PackageName" TEXT,

    CONSTRAINT "BrandHeadPackageAssignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandHeadPackageAssignments_profile_id_key" ON "BrandHeadPackageAssignments"("profile_id");

-- AddForeignKey
ALTER TABLE "BrandHeadPackageAssignments" ADD CONSTRAINT "BrandHeadPackageAssignments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
