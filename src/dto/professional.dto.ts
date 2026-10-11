import { DocumentType, Specialty } from "@prisma/client";
import { z } from "zod";

export const createProfessionalSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  documentType: z.enum(DocumentType, { error: "Tipo de documento inválido" }),
  documentNumber: z.string().trim().min(5, "El número de documento es inválido"),
  phone: z.string().trim().min(7, "El teléfono es inválido"),
  email: z.email("El correo es inválido"),
  specialty: z.enum(Specialty, { error: "Especialidad inválida" }),
  medicalLicense: z.string().trim().min(1, "La tarjeta profesional es obligatoria"),
  institution: z.string().trim().min(1, "La institución es obligatoria"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type ProfessionalRequestDTO = z.infer<typeof createProfessionalSchema>;

export interface ProfessionalResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  email: string;
  specialty: Specialty;
  medicalLicense: string;
  institution: string;
  userStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}