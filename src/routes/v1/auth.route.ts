import { Router } from "express";
import { container } from "../../config/container.ts";
import { AuthController } from "../../controllers/auth.controller.ts";
import { loginSchema } from "../../dto/auth.dto.ts";
import { validate } from "../../middlewares/validate.ts";

const router = Router();

router.post("/login", validate(loginSchema), async (req, res) => {
  const controller = container.resolve<AuthController>("authController");
  return controller.login(req, res);
});

export default router;