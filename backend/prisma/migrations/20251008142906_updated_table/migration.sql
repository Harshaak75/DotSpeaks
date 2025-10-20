-- DropForeignKey
ALTER TABLE "YearlyTarget" DROP CONSTRAINT "YearlyTarget_ceoId_fkey";

-- AddForeignKey
ALTER TABLE "YearlyTarget" ADD CONSTRAINT "YearlyTarget_ceoId_fkey" FOREIGN KEY ("ceoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
