import { Router } from "express";
import authRoutes from "./auth.route.ts";
import patientRoutes from "./patient.route.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/patient", patientRoutes);

export default router;