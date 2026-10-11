import {
  LoginPatientRequestDTO,
  LoginPatientResponseDTO,
  PatientRequestDTO,
  PatientResponseDTO,
} from "../../dto/patient.dto.ts";

export type CreatePatientData = Omit<PatientRequestDTO, "password"> & {
  passwordHash: string;
};

export interface PatientLoginData {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  isActive: boolean;
  authCredential: { passwordHash: string } | null;
}

export interface IPatientInterface {
  createPatient(patient: PatientRequestDTO): Promise<PatientResponseDTO>;
  loginPatient(credentials: LoginPatientRequestDTO): Promise<LoginPatientResponseDTO | null>;
}

export interface IPatientRepository {
  createPatient(patient: CreatePatientData): Promise<PatientResponseDTO>;
  findPatientLoginDataByEmail(email: string): Promise<PatientLoginData | null>;
}
