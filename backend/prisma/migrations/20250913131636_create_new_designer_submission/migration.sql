-- CreateTable
CREATE TABLE "DesignerSubmission" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "designerId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignerSubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DesignerSubmission" ADD CONSTRAINT "DesignerSubmission_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignerSubmission" ADD CONSTRAINT "DesignerSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MarketingContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
