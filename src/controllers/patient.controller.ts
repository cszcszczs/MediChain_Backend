import { PatientRequestDTO } from "../dto/patient.dto.ts";
import { DocumentIdentityConflictError } from "../exceptions/errors/document-identity-conflict.error.ts";
import { IPatientInterface } from "../services/interfaces/patient.interface.ts";
import { Request, Response } from "express"

export class PatientController {
  constructor(readonly patientService: IPatientInterface) {}
 
  createUser = async (req: Request, res: Response): Promise<void> => {
    const request: PatientRequestDTO = req.body;
    try {
      const result = await this.patientService.createPatient(request);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof DocumentIdentityConflictError) {
        res.status(409).json({ message: error.message });
        return;
      }
      throw error;
    }
  }

  listActivePatients = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.patientService.listActivePatients();
    res.status(200).json(result);
  }

}
