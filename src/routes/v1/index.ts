import { Router } from "express";
import patientRoutes from "./patient.route.ts";

const router = Router();

router.use("/patient", patientRoutes);

export default router;