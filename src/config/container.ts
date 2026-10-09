import { asClass, createContainer, InjectionMode } from "awilix";
import { PatientService } from "../services/patient.service.ts";
import { PatientController } from "../controllers/patient.controller.ts";

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  patientService: asClass(PatientService).scoped(),
  patientController: asClass(PatientController).scoped(),
  //transacionService: asClass(TransacionService).scoped()
})
