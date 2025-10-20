-- CreateTable
CREATE TABLE "YearlyTarget" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "year" INTEGER NOT NULL,
    "totalRevenueTarget" BIGINT NOT NULL,
    "ceoId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YearlyTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuarterlyProjection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "quarterName" TEXT NOT NULL,
    "projectedRevenue" BIGINT NOT NULL,
    "projectedExpenses" BIGINT NOT NULL,
    "projectedSavings" BIGINT NOT NULL,
    "yearlyTargetId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuarterlyProjection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuarterlyProjection_yearlyTargetId_quarterName_key" ON "QuarterlyProjection"("yearlyTargetId", "quarterName");

-- AddForeignKey
ALTER TABLE "YearlyTarget" ADD CONSTRAINT "YearlyTarget_ceoId_fkey" FOREIGN KEY ("ceoId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterlyProjection" ADD CONSTRAINT "QuarterlyProjection_yearlyTargetId_fkey" FOREIGN KEY ("yearlyTargetId") REFERENCES "YearlyTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
