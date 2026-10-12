import { z } from "zod";

const isoDateTime = z.iso.datetime({ message: "La fecha debe ser una fecha ISO válida" });

export const createHistorySchema = z.object({
  patientId: z.uuid("El paciente debe ser un UUID válido"),
  consultationDate: isoDateTime,
  symptoms: z.string().trim().max(5000).optional(),
  diagnosis: z.string().trim().min(1, "El diagnóstico es obligatorio").max(10000),
  treatment: z.string().trim().min(1, "El tratamiento es obligatorio").max(10000),
  bloodPressure: z.string().trim().min(1).max(30).optional(),
  heartRate: z.number().int().positive().max(300).optional(),
  temperature: z.number().positive().max(100).optional(),
  weight: z.number().positive().max(1000).optional(),
  medications: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    dose: z.string().trim().min(1).max(200),
    frequency: z.string().trim().min(1).max(200),
  })).max(50).optional(),
  exams: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    performedAt: isoDateTime,
    status: z.enum(["PENDING", "COMPLETED"]).default("COMPLETED"),
    result: z.string().trim().max(10000).optional(),
  })).max(50).optional(),
  notes: z.string().trim().max(10000).optional(),
}).strict();

export type CreateHistoryDTO = z.infer<typeof createHistorySchema>;

export interface HistoryAttachmentDTO {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface HistoryResponseDTO {
  id: string;
  patientId: string;
  professionalId: string;
  consultationDate: string;
  symptoms: string | null;
  diagnosis: string;
  treatment: string;
  bloodPressure: string | null;
  heartRate: number | null;
  temperature: number | null;
  weight: number | null;
  notes: string | null;
  medications: Array<{ id: string; name: string; dose: string; frequency: string }>;
  exams: Array<{ id: string; name: string; performedAt: string; status: "PENDING" | "COMPLETED"; result: string | null }>;
  attachments: HistoryAttachmentDTO[];
  createdAt: string;
}