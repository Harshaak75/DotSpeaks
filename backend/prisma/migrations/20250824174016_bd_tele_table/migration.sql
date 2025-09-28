-- CreateTable
CREATE TABLE "bd_tele_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bd_user_id" UUID NOT NULL,
    "tele_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bd_tele_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bd_tele_assignments_bd_user_id_tele_user_id_key" ON "bd_tele_assignments"("bd_user_id", "tele_user_id");

-- AddForeignKey
ALTER TABLE "bd_tele_assignments" ADD CONSTRAINT "bd_tele_assignments_bd_user_id_fkey" FOREIGN KEY ("bd_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bd_tele_assignments" ADD CONSTRAINT "bd_tele_assignments_tele_user_id_fkey" FOREIGN KEY ("tele_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
