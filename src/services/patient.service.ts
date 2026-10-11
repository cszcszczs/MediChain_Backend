import { hash, verify } from "argon2";
import { SignJWT } from "jose";
import { LoginPatientRequestDTO, LoginPatientResponseDTO, PatientRequestDTO, PatientResponseDTO } from "../dto/patient.dto.ts";
import { env } from "../config/env.ts";
import { IPatientRepository } from "./interfaces/patient.interface.ts";

export class PatientService {
  constructor(readonly patientRepository: IPatientRepository){}

  async createPatient(patient: PatientRequestDTO): Promise<PatientResponseDTO> {
    const { password, ...patientData } = patient;
    const passwordHash = await hash(password);

    return this.patientRepository.createPatient({ ...patientData, passwordHash });
  }

  async loginPatient(credentials: LoginPatientRequestDTO): Promise<LoginPatientResponseDTO | null> {
    const patient = await this.patientRepository.findPatientLoginDataByEmail(credentials.email);

    if (!patient?.isActive || !patient.authCredential) {
      return null;
    }

    let passwordMatches = false;
    try {
      passwordMatches = await verify(patient.authCredential.passwordHash, credentials.password);
    } catch {
      return null;
    }

    if (!passwordMatches) {
      return null;
    }

    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(patient.id)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(env.jwtSecret));

    return {
      accessToken,
      tokenType: "Bearer",
      patient: {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`.trim(),
        documentNumber: patient.documentNumber,
        email: patient.email,
        phone: patient.phone,
        city: patient.city,
        address: patient.address,
      },
    };
  }
}
