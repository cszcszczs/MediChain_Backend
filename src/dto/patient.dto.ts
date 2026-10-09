enum DocumentType {
  CEDULA,
  TARJETA_IDENTIDAD,
  PASAPORTE,
  CEDULA_EXTRANJERIA
}

enum Gender {
  MASCULINO,
  FEMENINO,
  OTRO
}

export interface PatientRequestDTO {
  firstName: string,
  lastName: string,
  documentType: DocumentType,
  documentNumber: string,
  birthDate: string,
  gender: Gender,
  email: string,
  phonr: string,
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
