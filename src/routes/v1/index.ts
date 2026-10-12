import { Router } from "express";
import authRoutes from "./auth.route.ts";
import patientRoutes from "./patient.route.ts";
import professionalRoutes from "./professional.route.ts";
import historyRoutes from "./history.route.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/patient", patientRoutes);
router.use("/professional", professionalRoutes);
router.use("/history", historyRoutes);

export default router;