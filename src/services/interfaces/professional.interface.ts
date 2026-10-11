import {
  ProfessionalRequestDTO,
  ProfessionalResponseDTO,
} from "../../dto/professional.dto.ts";

export type CreateProfessionalData = Omit<ProfessionalRequestDTO, "password"> & {
  passwordHash: string;
};

export interface IProfessionalInterface {
  createProfessional(professional: ProfessionalRequestDTO): Promise<ProfessionalResponseDTO>;
}

export interface IProfessionalRepository {
  createProfessional(professional: CreateProfessionalData): Promise<ProfessionalResponseDTO>;
}