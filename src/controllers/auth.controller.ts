import { Request, Response } from "express";
import { LoginRequestDTO } from "../dto/auth.dto.ts";
import { IAuthService } from "../services/interfaces/auth.interface.ts";

export class AuthController {
  constructor(readonly authService: IAuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const credentials: LoginRequestDTO = req.body;
    const result = await this.authService.login(credentials);

    if (!result) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    res.status(200).json(result);
  };
}