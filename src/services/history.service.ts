import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import type { CreateHistoryDTO, HistoryResponseDTO } from "../dto/history.dto.ts";
import type { IHistoryRepository, IHistoryStorage, HistoryAttachmentInput } from "./interfaces/history.interface.ts";

const allowedTypes = new Map([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export class HistoryError extends Error {
  constructor(readonly statusCode: number, message: string) {
    super(message);
    this.name = "HistoryError";
  }
}

export class HistoryService {
  constructor(
    readonly historyRepository: IHistoryRepository,
    readonly historyStorage: IHistoryStorage,
  ) {}

  async createHistory(
    userId: string,
    data: CreateHistoryDTO,
    files: Express.Multer.File[],
  ): Promise<HistoryResponseDTO> {
    const professionalId = await this.historyRepository.findActiveProfessionalId(userId);
    if (!professionalId) {
      throw new HistoryError(403, "Se requiere un profesional activo para crear historiales");
    }

    if (!(await this.historyRepository.isPatientActive(data.patientId))) {
      throw new HistoryError(404, "Paciente no encontrado o inactivo");
    }

    const id = randomUUID();
    const attachments: HistoryAttachmentInput[] = [];
    const uploadedPaths: string[] = [];

    try {
      for (const file of files) {
        const detectedType = await fileTypeFromBuffer(file.buffer);
        const extension = detectedType && allowedTypes.get(detectedType.mime);
        if (!detectedType || !extension || file.mimetype !== detectedType.mime) {
          throw new HistoryError(400, "Solo se permiten archivos PDF, JPEG o PNG válidos");
        }

        const objectPath = `${data.patientId}/${id}/${randomUUID()}.${extension}`;
        await this.historyStorage.upload(objectPath, file);
        uploadedPaths.push(objectPath);
        attachments.push({
          bucket: this.historyStorage.bucket,
          objectPath,
          originalName: file.originalname,
          mimeType: detectedType.mime,
          sizeBytes: file.size,
        });
      }

      return await this.historyRepository.createHistory({
        id,
        professionalId,
        data,
        attachments,
      });
    } catch (error) {
      if (uploadedPaths.length > 0) {
        try {
          await this.historyStorage.remove(uploadedPaths);
        } catch {
          throw new HistoryError(500, "No fue posible completar ni limpiar los archivos adjuntos");
        }
      }
      throw error;
    }
  }
}