import { PatientRequestDTO, PatientResponseDTO } from "../dto/patient.dto.ts";
import { IPatientInterface } from "./interfaces/patient.interface.ts";

export class PatientService {
  constructor(readonly patientRepository: IPatientInterface){}

  async createPatient(patient: PatientRequestDTO): Promise<PatientResponseDTO> {
    return await this.patientRepository.createPatient(patient);
  }
}
