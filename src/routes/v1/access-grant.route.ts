import { Router } from "express";
import { z } from "zod";
import { container } from "../../config/container.ts";
import { AccessGrantController } from "../../controllers/access-grant.controller.ts";
import { createAccessGrantSchema, listAccessGrantsSchema } from "../../dto/access-grant.dto.ts";
import { authenticate } from "../../middlewares/authenticate.ts";
import { validate } from "../../middlewares/validate.ts";

const router = Router();
const grantIdSchema = z.uuid();

const validateListQuery = (req: Parameters<typeof authenticate>[0], res: Parameters<typeof authenticate>[1], next: Parameters<typeof authenticate>[2]) => {
  const parsed = listAccessGrantsSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      message: "Parámetros inválidos",
      errors: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
    return;
  }
  res.locals.filters = parsed.data;
  next();
};

const validateGrantId = (req: Parameters<typeof authenticate>[0], res: Parameters<typeof authenticate>[1], next: Parameters<typeof authenticate>[2]) => {
  const parsed = grantIdSchema.safeParse(req.params.id);
  if (!parsed.success) {
    res.status(400).json({ message: "Identificador de autorización inválido" });
    return;
  }
  next();
};

router.post("/", authenticate, validate(createAccessGrantSchema), async (req, res) => {
  const controller = container.resolve<AccessGrantController>("accessGrantController");
  return controller.create(req, res);
});

router.get("/", authenticate, validateListQuery, async (req, res) => {
  const controller = container.resolve<AccessGrantController>("accessGrantController");
  return controller.list(req, res);
});

router.patch("/:id/accept", authenticate, validateGrantId, async (req, res) => {
  const controller = container.resolve<AccessGrantController>("accessGrantController");
  return controller.accept(req, res);
});

router.patch("/:id/revoke", authenticate, validateGrantId, async (req, res) => {
  const controller = container.resolve<AccessGrantController>("accessGrantController");
  return controller.revoke(req, res);
});

export default router;