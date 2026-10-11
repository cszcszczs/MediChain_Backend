import { Router } from "express";
import { container } from "../../config/container.ts";
import { ProfessionalController } from "../../controllers/professional.controller.ts";
import { createProfessionalSchema } from "../../dto/professional.dto.ts";
import { validate } from "../../middlewares/validate.ts";

const router = Router();

router.post("/", validate(createProfessionalSchema), async (req, res) => {
  const controller = container.resolve<ProfessionalController>("professionalController");
  return controller.createProfessional(req, res);
});

export default router;