import { asClass, createContainer, InjectionMode } from "awilix";
import { PatientService } from "../services/patient.service.ts";
import { PatientController } from "../controllers/patient.controller.ts";
import { PatientPrismaRepository } from "../db/repositories/patient-prisma.repository.ts";

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  patientService: asClass(PatientService).scoped(),
  patientController: asClass(PatientController).scoped(),
  patientRepository: asClass(PatientPrismaRepository).scoped(),
})
