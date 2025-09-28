-- CreateTable
CREATE TABLE "MeetingEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "googleEventId" TEXT NOT NULL,
    "title" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "meetingLink" TEXT,
    "cancelUrl" TEXT,
    "rescheduleUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingEvent_googleEventId_key" ON "MeetingEvent"("googleEventId");
