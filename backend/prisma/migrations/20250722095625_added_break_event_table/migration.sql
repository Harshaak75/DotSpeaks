-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "total_break_minutes" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "break_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attendance_id" UUID,
    "break_start" TIME(6),
    "break_end" TIME(6),

    CONSTRAINT "break_events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "break_events" ADD CONSTRAINT "break_events_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendance"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
