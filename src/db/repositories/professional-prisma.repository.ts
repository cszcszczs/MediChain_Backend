import {
  ProfessionalResponseDTO,
} from "../../dto/professional.dto.ts";
import {
  CreateProfessionalData,
  IProfessionalRepository,
} from "../../services/interfaces/professional.interface.ts";
import prisma from "../index.ts";

export class ProfessionalPrismaRepository implements IProfessionalRepository {
  async createProfessional(
    professional: CreateProfessionalData,
  ): Promise<ProfessionalResponseDTO> {
    const createdProfessional = await prisma.professional.create({
      data: {
        firstName: professional.firstName,
        lastName: professional.lastName,
        documentType: professional.documentType,
        documentNumber: professional.documentNumber,
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
  }
}