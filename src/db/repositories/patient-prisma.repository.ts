import { PatientResponseDTO } from "../../dto/patient.dto.ts";
import { CreatePatientData, PatientLoginData } from "../../services/interfaces/patient.interface.ts";
import { IPatientRepository } from "../../services/interfaces/patient.interface.ts";
import prisma from "../index.ts";

export class PatientPrismaRepository implements IPatientRepository {
    async findPatientLoginDataByEmail(email: string): Promise<PatientLoginData | null> {
        return prisma.patient.findUnique({
            where: { email },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                documentNumber: true,
                email: true,
                phone: true,
                city: true,
                address: true,
                isActive: true,
                authCredential: {
                    select: { passwordHash: true },
                },
            },
        });
    }

    async createPatient(patient: CreatePatientData): Promise<PatientResponseDTO> {
        const newPatient = await prisma.patient.create({
            data: {
                firstName: patient.firstName,
                lastName: patient.lastName,
                documentType: patient.documentType,
                documentNumber: patient.documentNumber,
                birthDate: new Date(patient.birthDate),
                gender: patient.gender,
                email: patient.email,
                phone: patient.phone,
                city: patient.city,
                address: patient.address,
                authCredential: {
                    create: {
                        passwordHash: patient.passwordHash,
                    },
                },
            }
        });
        return {
            id: newPatient.id,
            name: `${newPatient.firstName} ${newPatient.lastName}`.trim(),
            documentNumber: newPatient.documentNumber,
            email: newPatient.email,
            phone: newPatient.phone,
            city: newPatient.city,
            address: newPatient.address,
        };
    }
}