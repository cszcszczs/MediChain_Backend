import { isPrismaUniqueConstraintError } from "./prisma-unique-constraint.error.ts";

export class MedicalLicenseConflictError extends Error {
  constructor() {
    super("La licencia médica ya está registrada");
    this.name = "MedicalLicenseConflictError";
  }
}

export const isMedicalLicenseUniqueConstraintError = (error: unknown): boolean =>
  isPrismaUniqueConstraintError(error, "medicalLicense");
