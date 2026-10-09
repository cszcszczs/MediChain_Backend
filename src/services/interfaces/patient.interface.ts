import { PatientRequestDTO, PatientResponseDTO } from "../../dto/patient.dto.ts";

export interface IPatientInterface {
  createPatient(patient: PatientRequestDTO): Promise<PatientResponseDTO>;
}
