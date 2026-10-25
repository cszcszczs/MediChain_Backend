import {
  ProfessionalResponseDTO,
} from "../../dto/professional.dto.ts";
import { DocumentIdentityConflictError, isDocumentIdentityUniqueConstraintError } from "../../exceptions/errors/document-identity-conflict.error.ts";
import { EmailConflictError, isEmailUniqueConstraintError } from "../../exceptions/errors/email-conflict.error.ts";
import { MedicalLicenseConflictError, isMedicalLicenseUniqueConstraintError } from "../../exceptions/errors/medical-license-conflict.error.ts";
import {
  CreateProfessionalData,
  IProfessionalRepository,
} from "../../services/interfaces/professional.interface.ts";
import prisma from "../index.ts";

export class ProfessionalPrismaRepository implements IProfessionalRepository {
  async listActiveProfessionals(): Promise<ProfessionalResponseDTO[]> {
    const professionals = await prisma.professional.findMany({
      where: {
        userStatus: "ACTIVE",
        user: { isActive: true },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        documentType: true,
        documentNumber: true,
        phone: true,
        email: true,
        specialty: true,
        medicalLicense: true,
        institution: true,
        userStatus: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    });

    return professionals.map((professional) => ({
      id: professional.id,
      firstName: professional.firstName,
      lastName: professional.lastName,
      documentType: professional.documentType,
      documentNumber: professional.documentNumber,
      phone: professional.phone,
      email: professional.email,
      specialty: professional.specialty,
      medicalLicense: professional.medicalLicense,
      institution: professional.institution,
      userStatus: professional.userStatus,
    }));
  }

  async createProfessional(
    professional: CreateProfessionalData,
  ): Promise<ProfessionalResponseDTO> {
    try {
      const existingDocument = await prisma.documentIdentity.findUnique({
        where: {
          documentType_documentNumber: {
            documentType: professional.documentType,
            documentNumber: professional.documentNumber,
          },
        },
        select: { id: true },
      });
      if (existingDocument) throw new DocumentIdentityConflictError();

      const createdProfessional = await prisma.professional.create({
        data: {
          firstName: professional.firstName,
          lastName: professional.lastName,
          documentType: professional.documentType,
          documentNumber: professional.documentNumber,
          documentIdentity: {
            create: {
              documentType: professional.documentType,
              documentNumber: professional.documentNumber,
            },
          },
          phone: professional.phone,
          email: professional.email,
          specialty: professional.specialty,
          medicalLicense: professional.medicalLicense,
          institution: professional.institution,
          user: {
            create: {
              email: professional.email,
              authCredential: {
                create: {
                  passwordHash: professional.passwordHash,
                },
              },
            },
          },
        },
      });

      return {
        id: createdProfessional.id,
        firstName: createdProfessional.firstName,
        lastName: createdProfessional.lastName,
        documentType: createdProfessional.documentType,
        documentNumber: createdProfessional.documentNumber,
        phone: createdProfessional.phone,
        email: createdProfessional.email,
        specialty: createdProfessional.specialty,
        medicalLicense: createdProfessional.medicalLicense,
        institution: createdProfessional.institution,
        userStatus: createdProfessional.userStatus,
      };
    } catch (error) {
      if (isDocumentIdentityUniqueConstraintError(error)) {
        throw new DocumentIdentityConflictError();
      }
      if (isEmailUniqueConstraintError(error)) {
        throw new EmailConflictError();
      }
      if (isMedicalLicenseUniqueConstraintError(error)) {
        throw new MedicalLicenseConflictError();
      }
      throw error;
    }
  }
}