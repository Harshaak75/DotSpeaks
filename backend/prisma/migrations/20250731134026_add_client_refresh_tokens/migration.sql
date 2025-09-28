-- CreateTable
CREATE TABLE "ClientRefreshToken" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientRefreshToken_clientId_key" ON "ClientRefreshToken"("clientId");

-- AddForeignKey
ALTER TABLE "ClientRefreshToken" ADD CONSTRAINT "ClientRefreshToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
