import { hash } from "argon2";
import { PatientRequestDTO, PatientResponseDTO } from "../dto/patient.dto.ts";
import { IPatientRepository } from "./interfaces/patient.interface.ts";

export class PatientService {
  constructor(readonly patientRepository: IPatientRepository){}

  async createPatient(patient: PatientRequestDTO): Promise<PatientResponseDTO> {
    const { password, ...patientData } = patient;
    const passwordHash = await hash(password);

    return this.patientRepository.createPatient({ ...patientData, passwordHash });
  }
}
