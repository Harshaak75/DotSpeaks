-- CreateTable
CREATE TABLE "TelecommunicatorAssign" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tele_id" UUID NOT NULL,
    "business_developer_id" UUID NOT NULL,

    CONSTRAINT "TelecommunicatorAssign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelecommunicatorAssign_tele_id_key" ON "TelecommunicatorAssign"("tele_id");

-- AddForeignKey
ALTER TABLE "TelecommunicatorAssign" ADD CONSTRAINT "TelecommunicatorAssign_business_developer_id_fkey" FOREIGN KEY ("business_developer_id") REFERENCES "BussinessDeveloper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelecommunicatorAssign" ADD CONSTRAINT "TelecommunicatorAssign_tele_id_fkey" FOREIGN KEY ("tele_id") REFERENCES "TelecommunicatorLeads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
