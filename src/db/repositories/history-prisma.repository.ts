import type { Prisma } from "@prisma/client";
import type { CreateHistoryDTO, HistoryResponseDTO } from "../../dto/history.dto.ts";
import type { IHistoryRepository, HistoryAttachmentInput } from "../../services/interfaces/history.interface.ts";
import prisma from "../index.ts";

export class HistoryPrismaRepository implements IHistoryRepository {
  async findActiveProfessionalId(userId: string): Promise<string | null> {
    const professional = await prisma.professional.findFirst({
      where: { userId, userStatus: "ACTIVE", user: { isActive: true } },
      select: { id: true },
    });
    return professional?.id ?? null;
  }

  async isPatientActive(patientId: string): Promise<boolean> {
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, user: { isActive: true } },
      select: { id: true },
    });
    return patient !== null;
  }

  async createHistory(input: {
    id: string;
    professionalId: string;
    data: CreateHistoryDTO;
    attachments: HistoryAttachmentInput[];
  }): Promise<HistoryResponseDTO> {
    const { data } = input;
    const includedRelations = {
      medications: true,
      exams: true,
      attachments: true,
    } satisfies Prisma.MedicalHistoryInclude;
    const created = await prisma.medicalHistory.create({
      data: {
        id: input.id,
        patientId: data.patientId,
        professionalId: input.professionalId,
        consultationDate: new Date(data.consultationDate),
        symptoms: data.symptoms ?? null,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        bloodPressure: data.bloodPressure ?? null,
        heartRate: data.heartRate ?? null,
        temperature: data.temperature ?? null,
        weight: data.weight ?? null,
        notes: data.notes ?? null,
        medications: { create: data.medications ?? [] },
        exams: {
          create: (data.exams ?? []).map((exam) => ({
            name: exam.name,
            performedAt: new Date(exam.performedAt),
            status: exam.status,
            result: exam.result ?? null,
          })),
        },
        attachments: { create: input.attachments },
      },
      include: includedRelations,
    });

    return {
      id: created.id,
      patientId: created.patientId,
      professionalId: created.professionalId,
      consultationDate: created.consultationDate.toISOString(),
      symptoms: created.symptoms,
      diagnosis: created.diagnosis,
      treatment: created.treatment,
      bloodPressure: created.bloodPressure,
      heartRate: created.heartRate,
      temperature: created.temperature,
      weight: created.weight,
      notes: created.notes,
      medications: created.medications.map(({ id, name, dose, frequency }) => ({ id, name, dose, frequency })),
      exams: created.exams.map(({ id, name, performedAt, status, result }) => ({
        id,
        name,
        performedAt: performedAt.toISOString(),
        status,
        result,
      })),
      attachments: created.attachments.map(({ id, originalName, mimeType, sizeBytes, createdAt }) => ({
        id,
        originalName,
        mimeType,
        sizeBytes,
        createdAt: createdAt.toISOString(),
      })),
      createdAt: created.createdAt.toISOString(),
    };
  }
}