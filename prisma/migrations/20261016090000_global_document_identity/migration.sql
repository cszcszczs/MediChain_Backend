DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "patients" AS patient
        JOIN "professionals" AS professional
          ON patient."document_type" = professional."document_type"
         AND patient."document_number" = professional."document_number"
    ) THEN
        RAISE EXCEPTION 'Cannot enforce global document uniqueness: matching patient and professional documents already exist';
    END IF;
END $$;

CREATE TABLE "document_identities" (
    "id" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "document_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_identities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_identities_type_number_key"
    ON "document_identities"("document_type", "document_number");

INSERT INTO "document_identities" ("id", "document_type", "document_number")
SELECT gen_random_uuid()::text, documents."document_type", documents."document_number"
FROM (
    SELECT "document_type", "document_number" FROM "patients"
    UNION
    SELECT "document_type", "document_number" FROM "professionals"
) AS documents;

ALTER TABLE "patients" ADD COLUMN "document_identity_id" TEXT;
ALTER TABLE "professionals" ADD COLUMN "document_identity_id" TEXT;

UPDATE "patients" AS patient
SET "document_identity_id" = identity."id"
FROM "document_identities" AS identity
WHERE patient."document_type" = identity."document_type"
  AND patient."document_number" = identity."document_number";

UPDATE "professionals" AS professional
SET "document_identity_id" = identity."id"
FROM "document_identities" AS identity
WHERE professional."document_type" = identity."document_type"
  AND professional."document_number" = identity."document_number";

ALTER TABLE "patients" ALTER COLUMN "document_identity_id" SET NOT NULL;
ALTER TABLE "professionals" ALTER COLUMN "document_identity_id" SET NOT NULL;

DROP INDEX "patients_document_number_key";
DROP INDEX "professionals_document_number_key";

CREATE UNIQUE INDEX "patients_document_identity_id_key" ON "patients"("document_identity_id");
CREATE UNIQUE INDEX "patients_document_type_document_number_key"
    ON "patients"("document_type", "document_number");
CREATE UNIQUE INDEX "professionals_document_identity_id_key" ON "professionals"("document_identity_id");
CREATE UNIQUE INDEX "professionals_document_type_document_number_key"
    ON "professionals"("document_type", "document_number");

ALTER TABLE "patients" ADD CONSTRAINT "patients_document_identity_id_fkey"
    FOREIGN KEY ("document_identity_id") REFERENCES "document_identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_document_identity_id_fkey"
    FOREIGN KEY ("document_identity_id") REFERENCES "document_identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;