import { Router } from "express";
import { container } from "../../config/container.ts";
import { PatientController } from "../../controllers/patient.controller.ts";

const router = Router();

router.post('/', async (req, res) => {
    const controller = container.resolve<PatientController>("patientController");
    return controller.createUser(req, res);
});

export default router;