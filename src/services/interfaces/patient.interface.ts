import { PatientRequestDTO, PatientResponseDTO } from "../../dto/patient.dto.ts";

export type CreatePatientData = Omit<PatientRequestDTO, "password"> & {
  passwordHash: string;
};

export interface IPatientInterface {
  createPatient(patient: PatientRequestDTO): Promise<PatientResponseDTO>;
}

export interface IPatientRepository {
  createPatient(patient: CreatePatientData): Promise<PatientResponseDTO>;
}
