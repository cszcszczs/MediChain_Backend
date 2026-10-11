CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

INSERT INTO "users" ("id", "email", "is_active", "created_at", "updated_at")
SELECT "id", "email", "is_active", "created_at", "updated_at"
FROM "patients";

ALTER TABLE "patients" ADD COLUMN "user_id" TEXT;
UPDATE "patients" SET "user_id" = "id";
ALTER TABLE "patients" ALTER COLUMN "user_id" SET NOT NULL;

ALTER TABLE "auth_credentials" ADD COLUMN "user_id" TEXT;
UPDATE "auth_credentials" SET "user_id" = "patient_id";
ALTER TABLE "auth_credentials" ALTER COLUMN "user_id" SET NOT NULL;

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "patients_user_id_key" ON "patients"("user_id");
CREATE UNIQUE INDEX "auth_credentials_user_id_key" ON "auth_credentials"("user_id");

ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "auth_credentials" ADD CONSTRAINT "auth_credentials_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_credentials" DROP CONSTRAINT "auth_credentials_patient_id_fkey";
DROP INDEX "patients_email_key";
DROP INDEX "auth_credentials_patient_id_key";
ALTER TABLE "patients" DROP COLUMN "email";
ALTER TABLE "patients" DROP COLUMN "is_active";
ALTER TABLE "auth_credentials" DROP COLUMN "patient_id";