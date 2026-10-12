import type { Request, Response } from "express";
import type { CreateAccessGrantDTO, ListAccessGrantsDTO } from "../dto/access-grant.dto.ts";
import { AccessGrantError } from "../services/access-grant.service.ts";
import type { AccessGrantService } from "../services/access-grant.service.ts";

export class AccessGrantController {
  constructor(readonly accessGrantService: AccessGrantService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth?.userId) {
      res.status(401).json({ message: "Token de autenticación requerido" });
      return;
    }
    try {
      const result = await this.accessGrantService.createGrant(
        req.auth.userId,
        req.body as CreateAccessGrantDTO,
      );
      res.status(201).json(result);
    } catch (error) {
      this.respondError(error, res);
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.accessGrantService.listGrants(res.locals.filters as ListAccessGrantsDTO);
      res.status(200).json(result);
    } catch (error) {
      this.respondError(error, res);
    }
  };

  accept = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth?.userId) {
      res.status(401).json({ message: "Token de autenticación requerido" });
      return;
    }
    try {
      const grantId = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;
      const result = await this.accessGrantService.acceptGrant(grantId, req.auth.userId);
      res.status(200).json(result);
    } catch (error) {
      this.respondError(error, res);
    }
  };

  revoke = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth?.userId) {
      res.status(401).json({ message: "Token de autenticación requerido" });
      return;
    }
    try {
      const grantId = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;
      const result = await this.accessGrantService.revokeGrant(grantId, req.auth.userId);
      res.status(200).json(result);
    } catch (error) {
      this.respondError(error, res);
    }
  };

  private respondError(error: unknown, res: Response): void {
    if (error instanceof AccessGrantError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "No fue posible procesar la autorización" });
  }
}