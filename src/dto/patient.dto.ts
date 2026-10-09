import { DocumentType, Gender } from "@prisma/client";

export interface PatientRequestDTO {
  firstName: string,
  lastName: string,
  documentType: DocumentType,
  documentNumber: string,
  birthDate: string,
  gender: Gender,
  email: string,
  phone: string,
  city: string,
  address: string,
  password: string
}

export interface PatientResponseDTO {
  id: string,
  name: string,
  documentNumber: string,
  email: string,
  phone: string,
  city: string,
  address: string
}
