-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_user_id_fkey";

-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "profilesId" UUID;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_profilesId_fkey" FOREIGN KEY ("profilesId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
