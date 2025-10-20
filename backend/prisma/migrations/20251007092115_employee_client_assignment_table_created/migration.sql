-- CreateTable
CREATE TABLE "RoleAssignmentThreshold" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" TEXT NOT NULL,
    "max_clients" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleAssignmentThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeClientAssignment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profileId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeClientAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleAssignmentThreshold_role_key" ON "RoleAssignmentThreshold"("role");

-- CreateIndex
CREATE INDEX "EmployeeClientAssignment_profileId_idx" ON "EmployeeClientAssignment"("profileId");

-- CreateIndex
CREATE INDEX "EmployeeClientAssignment_clientId_idx" ON "EmployeeClientAssignment"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeClientAssignment_profileId_clientId_key" ON "EmployeeClientAssignment"("profileId", "clientId");

-- AddForeignKey
ALTER TABLE "EmployeeClientAssignment" ADD CONSTRAINT "EmployeeClientAssignment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeClientAssignment" ADD CONSTRAINT "EmployeeClientAssignment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
