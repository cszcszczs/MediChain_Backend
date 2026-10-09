import { PatientRequestDTO } from "../dto/patient.dto.ts";
import { IPatientInterface } from "../services/interfaces/patient.interface.ts";
import { Request, Response } from "express"

export class PatientController {
  constructor(readonly patientService: IPatientInterface) {}
 
  createUser = async (req: Request, res: Response): Promise<void> => {
    const request: PatientRequestDTO = req.body;
    const result = await this.patientService.createPatient(request);
    res.status(201).json(result);
  }
}
