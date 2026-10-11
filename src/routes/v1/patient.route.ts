import { Router } from "express";
import { container } from "../../config/container.ts";
import { PatientController } from "../../controllers/patient.controller.ts";
import { createPatientSchema, loginPatientSchema } from "../../dto/patient.dto.ts";
import { validate } from "../../middlewares/validate.ts";

const router = Router();

router.post("/login", validate(loginPatientSchema), async (req, res) => {
    const controller = container.resolve<PatientController>("patientController");
    return controller.login(req, res);
});

router.post("/", validate(createPatientSchema), async (req, res) => {
    const controller = container.resolve<PatientController>("patientController");
    return controller.createUser(req, res);
});

export default router;