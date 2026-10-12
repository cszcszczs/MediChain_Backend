import type { Prisma } from "@prisma/client";
import type {
  AccessGrantResponseDTO,
  CreateAccessGrantDTO,
  ListAccessGrantsDTO,
} from "../../dto/access-grant.dto.ts";
import type {
  AccessGrantTransitionData,
  IAccessGrantRepository,
} from "../../services/interfaces/access-grant.interface.ts";
import prisma from "../index.ts";

const grantRelations = {
  professional: { select: { id: true, firstName: true, lastName: true, specialty: true } },
  patient: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.AccessGrantInclude;

type GrantWithRelations = Prisma.AccessGrantGetPayload<{ include: typeof grantRelations }>;

const toResponse = (grant: GrantWithRelations): AccessGrantResponseDTO => ({
  id: grant.id,
  professional: {
    id: grant.professional.id,
    name: `${grant.professional.firstName} ${grant.professional.lastName}`.trim(),
    specialty: grant.professional.specialty,
  },
  patient: {
    id: grant.patient.id,
    name: `${grant.patient.firstName} ${grant.patient.lastName}`.trim(),
  },
  actions: grant.actions,
  status: grant.status,
  grantedAt: grant.grantedAt.toISOString(),
  acceptedAt: grant.acceptedAt?.toISOString() ?? null,
  expiresAt: grant.expiresAt?.toISOString() ?? null,
  revokedAt: grant.revokedAt?.toISOString() ?? null,
  revocationReason: grant.revocationReason,
});

export class AccessGrantPrismaRepository implements IAccessGrantRepository {
  async createGrant(
    input: CreateAccessGrantDTO & { grantedByUserId: string },
  ): Promise<AccessGrantResponseDTO | null> {
    const [professional, patient] = await Promise.all([
      prisma.professional.findFirst({
        where: { id: input.professionalId, userStatus: "ACTIVE", user: { isActive: true } },
        select: { id: true },
      }),
      prisma.patient.findFirst({
        where: { id: input.patientId, user: { isActive: true } },
        select: { id: true },
      }),
    ]);
    if (!professional || !patient) return null;

    const grant = await prisma.accessGrant.create({
      data: {
        professionalId: professional.id,
        patientId: patient.id,
        grantedByUserId: input.grantedByUserId,
        actions: input.actions,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
      include: grantRelations,
    });
    return toResponse(grant);
  }

  async listGrants(filters: ListAccessGrantsDTO): Promise<AccessGrantResponseDTO[]> {
    const search = filters.search?.trim();
    const grants = await prisma.accessGrant.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(search ? {
          OR: [
            { professional: { firstName: { contains: search, mode: "insensitive" } } },
            { professional: { lastName: { contains: search, mode: "insensitive" } } },
            { patient: { firstName: { contains: search, mode: "insensitive" } } },
            { patient: { lastName: { contains: search, mode: "insensitive" } } },
          ],
        } : {}),
      },
      include: grantRelations,
      orderBy: [{ grantedAt: "desc" }, { id: "asc" }],
    });
    return grants.map(toResponse);
  }

  async findGrantById(id: string): Promise<AccessGrantResponseDTO | null> {
    const grant = await prisma.accessGrant.findUnique({ where: { id }, include: grantRelations });
    return grant ? toResponse(grant) : null;
  }

  async expireDueGrants(now: Date): Promise<void> {
    await prisma.accessGrant.updateMany({
      where: { status: { not: "REVOKED" }, expiresAt: { lte: now } },
      data: {
        status: "REVOKED",
        revokedAt: now,
        revocationReason: "EXPIRED",
      },
    });
  }

  async findTransitionData(id: string): Promise<AccessGrantTransitionData | null> {
    const grant = await prisma.accessGrant.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        patient: { select: { userId: true } },
      },
    });
    if (!grant) return null;
    return {
      id: grant.id,
      status: grant.status,
      expiresAt: grant.expiresAt,
      patientUserId: grant.patient.userId,
    };
  }

  async acceptGrant(id: string, acceptedAt: Date): Promise<AccessGrantResponseDTO | null> {
    const updated = await prisma.accessGrant.updateMany({
      where: { id, status: "PENDING", OR: [{ expiresAt: null }, { expiresAt: { gt: acceptedAt } }] },
      data: { status: "ACTIVE", acceptedAt },
    });
    if (updated.count === 0) return null;
    const grant = await prisma.accessGrant.findUnique({ where: { id }, include: grantRelations });
    return grant ? toResponse(grant) : null;
  }

  async revokeGrant(id: string, revokedAt: Date): Promise<AccessGrantResponseDTO | null> {
    const updated = await prisma.accessGrant.updateMany({
      where: { id, status: { not: "REVOKED" } },
      data: { status: "REVOKED", revokedAt, revocationReason: "MANUAL" },
    });
    if (updated.count === 0) return null;
    const grant = await prisma.accessGrant.findUnique({ where: { id }, include: grantRelations });
    return grant ? toResponse(grant) : null;
  }
}