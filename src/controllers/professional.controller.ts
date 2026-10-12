import type { Request, Response } from "express";
import { ProfessionalRequestDTO } from "../dto/professional.dto.ts";
import { IProfessionalInterface } from "../services/interfaces/professional.interface.ts";

export class ProfessionalController {
  constructor(readonly professionalService: IProfessionalInterface) {}

  createProfessional = async (req: Request, res: Response): Promise<void> => {
    const request: ProfessionalRequestDTO = req.body;
    const result = await this.professionalService.createProfessional(request);
    res.status(201).json(result);
  };

  listActiveProfessionals = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.professionalService.listActiveProfessionals();
    res.status(200).json(result);
  };
}