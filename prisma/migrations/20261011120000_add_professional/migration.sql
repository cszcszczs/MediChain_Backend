CREATE TYPE "Specialty" AS ENUM (
    'GENERAL_MEDICINE',
    'PEDIATRICS',
    'CARDIOLOGY',
    'GENERAL_SURGERY',
    'GYNECOLOGY',
    'DERMATOLOGY',
    'NEUROLOGY',
    'PSYCHIATRY',
    'ORTHOPEDICS',
    'OPHTHALMOLOGY'
);

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

CREATE TABLE "professionals" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "document_number" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "specialty" "Specialty" NOT NULL,
    "medical_license" TEXT NOT NULL,
    "institution" TEXT,
    "user_status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "professionals_document_number_key" ON "professionals"("document_number");
CREATE UNIQUE INDEX "professionals_email_key" ON "professionals"("email");
CREATE UNIQUE INDEX "professionals_medical_license_key" ON "professionals"("medical_license");
CREATE UNIQUE INDEX "professionals_user_id_key" ON "professionals"("user_id");

ALTER TABLE "professionals" ADD CONSTRAINT "professionals_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;