import { isPrismaUniqueConstraintError } from "./prisma-unique-constraint.error.ts";

export class EmailConflictError extends Error {
  constructor() {
    super("El correo ya está registrado");
    this.name = "EmailConflictError";
  }
}

export const isEmailUniqueConstraintError = (error: unknown): boolean =>
  isPrismaUniqueConstraintError(error, "email");
