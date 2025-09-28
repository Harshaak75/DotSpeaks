-- AlterTable
ALTER TABLE "MeetingEvent" ADD COLUMN     "userId" UUID;

-- AddForeignKey
ALTER TABLE "MeetingEvent" ADD CONSTRAINT "MeetingEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
