import { PatientResponseDTO } from "../../dto/patient.dto.ts";
import { CreatePatientData } from "../../services/interfaces/patient.interface.ts";
import { IPatientRepository } from "../../services/interfaces/patient.interface.ts";
import prisma from "../index.ts";

export class PatientPrismaRepository implements IPatientRepository {
    async listActivePatients(): Promise<PatientResponseDTO[]> {
        const patients = await prisma.patient.findMany({
            where: { user: { isActive: true } },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                documentNumber: true,
                phone: true,
                city: true,
                address: true,
                user: { select: { email: true } },
            },
        });

        return patients.map((patient) => ({
            id: patient.id,
            name: `${patient.firstName} ${patient.lastName}`.trim(),
            documentNumber: patient.documentNumber,
            email: patient.user.email,
            phone: patient.phone,
            city: patient.city,
            address: patient.address,
        }));
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
                phone: patient.phone,
                city: patient.city,
                address: patient.address,
                user: {
                    create: {
                        email: patient.email,
                        authCredential: {
                            create: {
                                passwordHash: patient.passwordHash,
                            },
                        },
                    },
                },
            },
            include: { user: true },
        });
        return {
            id: newPatient.id,
            name: `${newPatient.firstName} ${newPatient.lastName}`.trim(),
            documentNumber: newPatient.documentNumber,
            email: newPatient.user.email,
            phone: newPatient.phone,
            city: newPatient.city,
            address: newPatient.address,
        };
    }
}