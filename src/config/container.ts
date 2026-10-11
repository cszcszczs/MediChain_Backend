import { asClass, createContainer, InjectionMode } from "awilix";
import { PatientService } from "../services/patient.service.ts";
import { PatientController } from "../controllers/patient.controller.ts";
import { PatientPrismaRepository } from "../db/repositories/patient-prisma.repository.ts";
import { AuthService } from "../services/auth.service.ts";
import { AuthController } from "../controllers/auth.controller.ts";
import { AuthPrismaRepository } from "../db/repositories/auth-prisma.repository.ts";
import { ProfessionalService } from "../services/professional.service.ts";
import { ProfessionalController } from "../controllers/professional.controller.ts";
import { ProfessionalPrismaRepository } from "../db/repositories/professional-prisma.repository.ts";

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  patientService: asClass(PatientService).scoped(),
  patientController: asClass(PatientController).scoped(),
  patientRepository: asClass(PatientPrismaRepository).scoped(),
  authService: asClass(AuthService).scoped(),
  authController: asClass(AuthController).scoped(),
  authRepository: asClass(AuthPrismaRepository).scoped(),
  professionalService: asClass(ProfessionalService).scoped(),
  professionalController: asClass(ProfessionalController).scoped(),
  professionalRepository: asClass(ProfessionalPrismaRepository).scoped(),
})
