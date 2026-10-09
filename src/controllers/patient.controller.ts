import { IPatientInterface } from "../services/interfaces/patient.interface.ts";
import { Request, Response } from "express"

export class PatientController {
  constructor(readonly patientService: IPatientInterface) {}
 
  createUser = async (req: Request, res: Response) => {

  }
}
