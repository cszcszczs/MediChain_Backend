import type { AccessGrantStatus } from "@prisma/client";
import type {
  AccessGrantResponseDTO,
  CreateAccessGrantDTO,
  ListAccessGrantsDTO,
} from "../../dto/access-grant.dto.ts";

export interface AccessGrantTransitionData {
  id: string;
  patientUserId: string;
  status: AccessGrantStatus;
  expiresAt: Date | null;
}

export interface IAccessGrantRepository {
  createGrant(input: CreateAccessGrantDTO & { grantedByUserId: string }): Promise<AccessGrantResponseDTO | null>;
  listGrants(filters: ListAccessGrantsDTO): Promise<AccessGrantResponseDTO[]>;
  findGrantById(id: string): Promise<AccessGrantResponseDTO | null>;
  expireDueGrants(now: Date): Promise<void>;
  findTransitionData(id: string): Promise<AccessGrantTransitionData | null>;
  acceptGrant(id: string, acceptedAt: Date): Promise<AccessGrantResponseDTO | null>;
  revokeGrant(id: string, revokedAt: Date): Promise<AccessGrantResponseDTO | null>;
}