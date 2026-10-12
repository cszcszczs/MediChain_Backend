import multer from "multer";
import type { NextFunction, Request, Response } from "express";

const maxFileSize = 10 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize, files: 5, fields: 1, parts: 6 },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
      return;
    }
    callback(null, true);
  },
}).array("attachments", 5);

export const receiveHistoryAttachments = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ message: "Cada archivo debe pesar como máximo 10 MB" });
      return;
    }
    res.status(400).json({ message: "Archivos adjuntos inválidos o exceden los límites permitidos" });
  });
};

export const parseHistoryPayload = (req: Request, res: Response, next: NextFunction): void => {
  const payload = req.body?.data;
  if (typeof payload !== "string") {
    res.status(400).json({ message: "El campo data debe contener el JSON del historial" });
    return;
  }

  try {
    const parsed: unknown = JSON.parse(payload);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      res.status(400).json({ message: "El campo data debe ser un objeto JSON" });
      return;
    }
    req.body = parsed;
    next();
  } catch {
    res.status(400).json({ message: "El campo data contiene JSON inválido" });
  }
};