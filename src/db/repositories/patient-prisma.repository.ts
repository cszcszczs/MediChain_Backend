import { PatientResponseDTO } from "../../dto/patient.dto.ts";
import { CreatePatientData } from "../../services/interfaces/patient.interface.ts";
import { IPatientRepository } from "../../services/interfaces/patient.interface.ts";
import prisma from "../index.ts";

export class PatientPrismaRepository implements IPatientRepository {
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