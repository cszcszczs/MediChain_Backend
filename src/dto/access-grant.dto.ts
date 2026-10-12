import { AccessGrantStatus, PermissionAction } from "@prisma/client";
import { z } from "zod";

export const createAccessGrantSchema = z.object({
  professionalId: z.string().trim().min(1, "El profesional es obligatorio"),
  patientId: z.uuid("El paciente debe ser un UUID válido"),
  actions: z.array(z.enum(PermissionAction)).min(1, "Selecciona al menos una acción").max(5),
  expiresAt: z.iso.datetime().optional(),
}).strict().superRefine((data, context) => {
  if (data.expiresAt && new Date(data.expiresAt) <= new Date()) {
    context.addIssue({ code: "custom", path: ["expiresAt"], message: "El vencimiento debe ser una fecha futura" });
  }
});

export const listAccessGrantsSchema = z.object({
  status: z.enum(AccessGrantStatus).optional(),
  search: z.string().trim().max(100).optional(),
}).strict();

export type CreateAccessGrantDTO = z.infer<typeof createAccessGrantSchema>;
export type ListAccessGrantsDTO = z.infer<typeof listAccessGrantsSchema>;

export interface AccessGrantResponseDTO {
  id: string;
  professional: {
    id: string;
    name: string;
    specialty: string;
  };
  patient: {
    id: string;
    name: string;
  };
  actions: PermissionAction[];
  status: AccessGrantStatus;
  grantedAt: string;
  acceptedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  revocationReason: "MANUAL" | "EXPIRED" | null;
}