import { PatientRequestDTO, PatientResponseDTO } from "../dto/patient.dto.ts";
import { IPatientInterface } from "./interfaces/patient.interface.ts";

export class PatientService implements IPatientInterface {
  constructor(){}

  async createPatient(patient: PatientRequestDTO): Promise<PatientResponseDTO> {
    const response: PatientResponseDTO =  {
      id: "1",
      name: "Ejemplo",
      documentNumber: "392832932",
      email: "ejemplo@gmail.com",
      phone: "31334230",
      city: "Medellin",
      address: "carrera 90 # 20"
    }
    return response
  }
}
