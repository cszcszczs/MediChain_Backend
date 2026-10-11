import type { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { env } from "../config/env.ts";

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
    await jwtVerify(token, new TextEncoder().encode(env.jwtSecret));
    next();
  } catch {
    res.status(401).json({ message: "Token de autenticación inválido" });
  }
};