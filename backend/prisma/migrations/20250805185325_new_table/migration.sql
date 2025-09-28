-- CreateTable
CREATE TABLE "TelecommunicatorLeads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company" TEXT,
    "contact" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',

    CONSTRAINT "TelecommunicatorLeads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BussinessDeveloper" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "leadId" UUID NOT NULL,

    CONSTRAINT "BussinessDeveloper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BussinessDeveloper_leadId_key" ON "BussinessDeveloper"("leadId");

-- AddForeignKey
ALTER TABLE "BussinessDeveloper" ADD CONSTRAINT "BussinessDeveloper_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "TelecommunicatorLeads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
