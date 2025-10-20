-- CreateTable
CREATE TABLE "CmoQuarterTargets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cmoId" UUID NOT NULL,
    "versions" INTEGER NOT NULL,
    "CurrentQuarter" TEXT NOT NULL,
    "projectedRevenue" INTEGER NOT NULL,

    CONSTRAINT "CmoQuarterTargets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CmoQuarterTargets" ADD CONSTRAINT "CmoQuarterTargets_cmoId_fkey" FOREIGN KEY ("cmoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
