import type { Request, Response } from "express";
import type { CreateHistoryDTO } from "../dto/history.dto.ts";
import { HistoryError } from "../services/history.service.ts";
import type { HistoryService } from "../services/history.service.ts";

export class HistoryController {
  constructor(readonly historyService: HistoryService) {}

  createHistory = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth?.userId) {
      res.status(401).json({ message: "Token de autenticación requerido" });
      return;
    }

    try {
      const files = (req.files ?? []) as Express.Multer.File[];
      const result = await this.historyService.createHistory(
        req.auth.userId,
        req.body as CreateHistoryDTO,
        files,
      );
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof HistoryError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "No fue posible crear el historial clínico" });
    }
  };
}