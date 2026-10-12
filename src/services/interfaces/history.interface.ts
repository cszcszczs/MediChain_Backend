import type { CreateHistoryDTO, HistoryResponseDTO } from "../../dto/history.dto.ts";

export interface HistoryAttachmentInput {
  bucket: string;
  objectPath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface IHistoryRepository {
  findActiveProfessionalId(userId: string): Promise<string | null>;
  isPatientActive(patientId: string): Promise<boolean>;
  createHistory(input: {
    id: string;
    professionalId: string;
    data: CreateHistoryDTO;
    attachments: HistoryAttachmentInput[];
  }): Promise<HistoryResponseDTO>;
}

export interface IHistoryStorage {
  readonly bucket: string;
  upload(objectPath: string, file: Express.Multer.File): Promise<void>;
  remove(objectPaths: string[]): Promise<void>;
}