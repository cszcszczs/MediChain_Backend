import { DocumentType, Gender } from "@prisma/client";
import { z } from "zod";

export const createPatientSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  documentType: z.enum(DocumentType, { error: "Tipo de documento inválido" }),
  documentNumber: z.string().trim().min(5, "El número de documento es inválido"),
  birthDate: z.iso.date("La fecha de nacimiento debe ser YYYY-MM-DD")
    .or(z.iso.datetime("La fecha de nacimiento es inválida")),
  gender: z.enum(Gender, { error: "Género inválido" }),
  email: z.email("El correo es inválido"),
  phone: z.string().trim().min(7, "El teléfono es inválido"),
  city: z.string().trim().min(1, "La ciudad es obligatoria"),
  address: z.string().trim().min(1, "La dirección es obligatoria"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type PatientRequestDTO = z.infer<typeof createPatientSchema>;

export interface PatientResponseDTO {
  id: string;
  name: string;
  documentNumber: string;
  email: string;
  phone: string;
  city: string;
  address: string;
}
