import type { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { env } from "../config/env.ts";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authorization = req.get("authorization");
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

  if (!token) {
    res.status(401).json({ message: "Token de autenticación requerido" });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.jwtSecret));
    if (!payload.sub) {
      res.status(401).json({ message: "Token de autenticación inválido" });
      return;
    }
    req.auth = { userId: payload.sub };
    next();
  } catch {
    res.status(401).json({ message: "Token de autenticación inválido" });
  }
};