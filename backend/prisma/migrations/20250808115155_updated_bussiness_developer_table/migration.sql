-- AlterTable
ALTER TABLE "BussinessDeveloper" ADD COLUMN     "assignedToId" UUID;

-- AddForeignKey
ALTER TABLE "BussinessDeveloper" ADD CONSTRAINT "BussinessDeveloper_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
