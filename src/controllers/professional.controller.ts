import type { Request, Response } from "express";
import { ProfessionalRequestDTO } from "../dto/professional.dto.ts";
import { DocumentIdentityConflictError } from "../exceptions/errors/document-identity-conflict.error.ts";
import { IProfessionalInterface } from "../services/interfaces/professional.interface.ts";

export class ProfessionalController {
  constructor(readonly professionalService: IProfessionalInterface) {}

  createProfessional = async (req: Request, res: Response): Promise<void> => {
    const request: ProfessionalRequestDTO = req.body;
    try {
      const result = await this.professionalService.createProfessional(request);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof DocumentIdentityConflictError) {
        res.status(409).json({ message: error.message });
        return;
      }
      throw error;
    }
  };

  listActiveProfessionals = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.professionalService.listActiveProfessionals();
    res.status(200).json(result);
  };
}