import type {
  AccessGrantResponseDTO,
  CreateAccessGrantDTO,
  ListAccessGrantsDTO,
} from "../dto/access-grant.dto.ts";
import type { IAccessGrantRepository } from "./interfaces/access-grant.interface.ts";

export class AccessGrantError extends Error {
  constructor(readonly statusCode: number, message: string) {
    super(message);
    this.name = "AccessGrantError";
  }
}

export class AccessGrantService {
  constructor(readonly accessGrantRepository: IAccessGrantRepository) {}

  async createGrant(
    grantedByUserId: string,
    input: CreateAccessGrantDTO,
  ): Promise<AccessGrantResponseDTO> {
    const created = await this.accessGrantRepository.createGrant({ ...input, grantedByUserId });
    if (!created) throw new AccessGrantError(404, "El paciente o profesional no existe o está inactivo");
    return created;
  }

  async listGrants(filters: ListAccessGrantsDTO): Promise<AccessGrantResponseDTO[]> {
    await this.accessGrantRepository.expireDueGrants(new Date());
    return this.accessGrantRepository.listGrants(filters);
  }

  async acceptGrant(id: string, userId: string): Promise<AccessGrantResponseDTO> {
    const now = new Date();
    await this.accessGrantRepository.expireDueGrants(now);
    const grant = await this.accessGrantRepository.findTransitionData(id);
    if (!grant) throw new AccessGrantError(404, "Autorización no encontrada");
    if (grant.patientUserId !== userId) {
      throw new AccessGrantError(403, "Solo el paciente destinatario puede aceptar esta autorización");
    }
    if (grant.status !== "PENDING") {
      throw new AccessGrantError(409, "Solo se pueden aceptar autorizaciones pendientes");
    }
    if (grant.expiresAt && grant.expiresAt <= now) {
      throw new AccessGrantError(409, "La autorización venció y fue revocada");
    }

    const accepted = await this.accessGrantRepository.acceptGrant(id, now);
    if (!accepted) throw new AccessGrantError(409, "La autorización ya fue modificada");
    return accepted;
  }

  async revokeGrant(id: string, userId: string): Promise<AccessGrantResponseDTO> {
    const now = new Date();
    await this.accessGrantRepository.expireDueGrants(now);
    const existing = await this.accessGrantRepository.findTransitionData(id);
    if (!existing) throw new AccessGrantError(404, "Autorización no encontrada");
    if (existing.patientUserId !== userId) {
      throw new AccessGrantError(403, "Solo el paciente destinatario puede revocar esta autorización");
    }
    if (existing.status === "REVOKED") {
      const revoked = await this.accessGrantRepository.findGrantById(id);
      if (revoked) return revoked;
      throw new AccessGrantError(404, "Autorización no encontrada");
    }

    const revoked = await this.accessGrantRepository.revokeGrant(id, now);
    if (!revoked) throw new AccessGrantError(409, "La autorización ya fue modificada");
    return revoked;
  }
}