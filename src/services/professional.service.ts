import { hash } from "argon2";
import {
  ProfessionalRequestDTO,
  ProfessionalResponseDTO,
} from "../dto/professional.dto.ts";
import { IProfessionalRepository } from "./interfaces/professional.interface.ts";

export class ProfessionalService {
  constructor(readonly professionalRepository: IProfessionalRepository) {}

  async createProfessional(
    professional: ProfessionalRequestDTO,
  ): Promise<ProfessionalResponseDTO> {
    const { password, ...professionalData } = professional;
    const passwordHash = await hash(password);

    return this.professionalRepository.createProfessional({
      ...professionalData,
      passwordHash,
    });
  }

  async listActiveProfessionals(): Promise<ProfessionalResponseDTO[]> {
    return this.professionalRepository.listActiveProfessionals();
  }
}