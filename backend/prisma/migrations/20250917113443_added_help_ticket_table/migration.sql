-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'RESOLVED');

-- AlterEnum
ALTER TYPE "ContentStatus" ADD VALUE 'Help_requested';

-- CreateTable
CREATE TABLE "HelpTicket" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "response" TEXT,
    "taskId" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "resolverId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "HelpTicket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "MarketingContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_resolverId_fkey" FOREIGN KEY ("resolverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
