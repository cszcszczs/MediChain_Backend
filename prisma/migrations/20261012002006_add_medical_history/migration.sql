-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "medical_histories" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "consultation_date" TIMESTAMP(3) NOT NULL,
    "symptoms" TEXT,
    "diagnosis" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "blood_pressure" TEXT,
    "heart_rate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "medical_history_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_results" (
    "id" TEXT NOT NULL,
    "medical_history_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'COMPLETED',
    "result" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_attachments" (
    "id" TEXT NOT NULL,
    "medical_history_id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "object_path" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medical_histories_patient_id_consultation_date_idx" ON "medical_histories"("patient_id", "consultation_date");

-- CreateIndex
CREATE INDEX "medical_histories_professional_id_consultation_date_idx" ON "medical_histories"("professional_id", "consultation_date");

-- CreateIndex
CREATE INDEX "medications_medical_history_id_idx" ON "medications"("medical_history_id");

-- CreateIndex
CREATE INDEX "exam_results_medical_history_id_idx" ON "exam_results"("medical_history_id");

-- CreateIndex
CREATE UNIQUE INDEX "history_attachments_object_path_key" ON "history_attachments"("object_path");

-- CreateIndex
CREATE INDEX "history_attachments_medical_history_id_idx" ON "history_attachments"("medical_history_id");

-- AddForeignKey
ALTER TABLE "medical_histories" ADD CONSTRAINT "medical_histories_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_histories" ADD CONSTRAINT "medical_histories_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_medical_history_id_fkey" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_medical_history_id_fkey" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_attachments" ADD CONSTRAINT "history_attachments_medical_history_id_fkey" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
