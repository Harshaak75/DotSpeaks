-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ClientOnboardingData" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "yearOfEstablishment" TEXT,
    "about" TEXT,
    "websiteUrl" TEXT,
    "industry" TEXT,
    "keyProducts" TEXT,
    "primaryContactPerson" TEXT,
    "positionTitle" TEXT,
    "contactNumber" TEXT,
    "marketingGoals" JSONB,
    "currentMarketingActivities" JSONB,
    "socialMediaAccounts" JSONB,
    "timeline" TEXT,
    "targetAudience" TEXT,
    "currentChallenges" TEXT,
    "competitors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientOnboardingData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientOnboardingData_clientId_key" ON "ClientOnboardingData"("clientId");

-- AddForeignKey
ALTER TABLE "ClientOnboardingData" ADD CONSTRAINT "ClientOnboardingData_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
