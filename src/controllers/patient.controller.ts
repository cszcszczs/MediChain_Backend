import { LoginPatientRequestDTO, PatientRequestDTO } from "../dto/patient.dto.ts";
import { IPatientInterface } from "../services/interfaces/patient.interface.ts";
import { Request, Response } from "express"

export class PatientController {
  constructor(readonly patientService: IPatientInterface) {}
 
  createUser = async (req: Request, res: Response): Promise<void> => {
    const request: PatientRequestDTO = req.body;
    const result = await this.patientService.createPatient(request);
    res.status(201).json(result);
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const credentials: LoginPatientRequestDTO = req.body;
    const result = await this.patientService.loginPatient(credentials);

    if (!result) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    res.status(200).json(result);
  }
}
