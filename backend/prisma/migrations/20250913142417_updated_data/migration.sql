-- DropForeignKey
ALTER TABLE "DesignerSubmission" DROP CONSTRAINT "DesignerSubmission_designerId_fkey";

-- AddForeignKey
ALTER TABLE "DesignerSubmission" ADD CONSTRAINT "DesignerSubmission_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
