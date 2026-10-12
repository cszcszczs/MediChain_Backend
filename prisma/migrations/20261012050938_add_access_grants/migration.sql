-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('READ', 'UPDATE', 'CREATE', 'DELETE', 'AUTHORIZE_ACCESS');

-- CreateEnum
CREATE TYPE "AccessGrantStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "AccessGrantRevocationReason" AS ENUM ('MANUAL', 'EXPIRED');

-- CreateTable
CREATE TABLE "access_grants" (
    "id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "granted_by_user_id" TEXT NOT NULL,
    "actions" "PermissionAction"[],
    "status" "AccessGrantStatus" NOT NULL DEFAULT 'PENDING',
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "revocation_reason" "AccessGrantRevocationReason",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "access_grants_professional_id_patient_id_created_at_idx" ON "access_grants"("professional_id", "patient_id", "created_at");

-- CreateIndex
CREATE INDEX "access_grants_status_expires_at_idx" ON "access_grants"("status", "expires_at");

-- CreateIndex
CREATE INDEX "access_grants_granted_by_user_id_created_at_idx" ON "access_grants"("granted_by_user_id", "created_at");

-- AddForeignKey
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_granted_by_user_id_fkey" FOREIGN KEY ("granted_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
