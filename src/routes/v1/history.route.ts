import { Router } from "express";
import { container } from "../../config/container.ts";
import { HistoryController } from "../../controllers/history.controller.ts";
import { createHistorySchema } from "../../dto/history.dto.ts";
import { authenticate } from "../../middlewares/authenticate.ts";
import { parseHistoryPayload, receiveHistoryAttachments } from "../../middlewares/history-upload.ts";
import { validate } from "../../middlewares/validate.ts";

const router = Router();

router.post(
  "/",
  authenticate,
  receiveHistoryAttachments,
  parseHistoryPayload,
  validate(createHistorySchema),
  async (req, res) => {
    const controller = container.resolve<HistoryController>("historyController");
    return controller.createHistory(req, res);
  },
);

export default router;