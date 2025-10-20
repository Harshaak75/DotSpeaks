-- CreateTable
CREATE TABLE "CmoTarget" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cmoId" UUID NOT NULL,
    "targetQuarter" TEXT NOT NULL,
    "quarterlyRevenue" INTEGER NOT NULL,
    "monthlyUnits" INTEGER NOT NULL,
    "totalTargetLeads" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmoTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetPackage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cmoTargetId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "achieved" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TargetPackage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TargetPackage" ADD CONSTRAINT "TargetPackage_cmoTargetId_fkey" FOREIGN KEY ("cmoTargetId") REFERENCES "CmoTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
