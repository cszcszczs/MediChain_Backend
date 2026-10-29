import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { SignJWT } from "jose";
import { createAccessGrantSchema, listAccessGrantsSchema } from "../src/dto/access-grant.dto.ts";
import { AccessGrantError, AccessGrantService } from "../src/services/access-grant.service.ts";
import type {
  AccessGrantTransitionData,
  IAccessGrantRepository,
} from "../src/services/interfaces/access-grant.interface.ts";
import type { AccessGrantResponseDTO } from "../src/dto/access-grant.dto.ts";

const jwtSecret = "access-grant-test-secret-with-at-least-32-bytes";
process.env.JWT_SECRET = jwtSecret;

const grantResponse: AccessGrantResponseDTO = {
  id: "99653d94-ccea-49c1-a221-43c7d2279248",
  professional: { id: "professional-1", name: "Dr. Maria Gonzalez", specialty: "GENERAL_MEDICINE" },
  patient: { id: "b7a45dc6-5232-4a7f-a8d8-46d58c2092a0", name: "Juan Perez" },
  actions: ["READ", "CREATE"],
  status: "PENDING",
  grantedAt: "2026-10-12T10:00:00.000Z",
  acceptedAt: null,
  expiresAt: "2027-01-01T00:00:00.000Z",
  revokedAt: null,
  revocationReason: null,
};

const createRepository = (overrides: {
  transition?: AccessGrantTransitionData | null;
  createResult?: AccessGrantResponseDTO | null;
  acceptResult?: AccessGrantResponseDTO | null;
  revokeResult?: AccessGrantResponseDTO | null;
  existingResult?: AccessGrantResponseDTO | null;
} = {}) => {
  const calls = {
    created: [] as unknown[],
    accepted: 0,
    revoked: 0,
    expired: 0,
    listed: [] as { userId: string; filters: unknown }[],
  };
  const repository: IAccessGrantRepository = {
    createGrant: async (input) => {
      calls.created.push(input);
      return overrides.createResult === undefined ? grantResponse : overrides.createResult;
    },
    listGrants: async (userId, filters) => {
      calls.listed.push({ userId, filters });
      return [grantResponse];
    },
    findGrantById: async () => overrides.existingResult === undefined ? grantResponse : overrides.existingResult,
    expireDueGrants: async () => { calls.expired += 1; },
    findTransitionData: async () => overrides.transition === undefined
      ? { id: grantResponse.id, patientUserId: "patient-user", status: "PENDING", expiresAt: null }
      : overrides.transition,
    acceptGrant: async () => {
      calls.accepted += 1;
      return overrides.acceptResult === undefined ? { ...grantResponse, status: "ACTIVE", acceptedAt: new Date().toISOString() } : overrides.acceptResult;
    },
    revokeGrant: async () => {
      calls.revoked += 1;
      return overrides.revokeResult === undefined
        ? { ...grantResponse, status: "REVOKED", revokedAt: new Date().toISOString(), revocationReason: "MANUAL" }
        : overrides.revokeResult;
    },
  };
  return { repository, calls, service: new AccessGrantService(repository) };
};

describe("access grant DTOs", () => {
  it("requires a valid action and accepts only the three UI statuses", () => {
    const valid = {
      professionalId: "professional-1",
      patientId: grantResponse.patient.id,
      actions: ["READ"],
    };
    assert.equal(createAccessGrantSchema.safeParse(valid).success, true);
    assert.equal(createAccessGrantSchema.safeParse({ ...valid, actions: [] }).success, false);
    assert.equal(listAccessGrantsSchema.safeParse({ status: "EXPIRED" }).success, false);
    assert.equal(listAccessGrantsSchema.safeParse({ status: "PENDING", search: "Maria" }).success, true);
  });
});

describe("AccessGrantService", () => {
  it("derives the grantor from the caller and creates a pending grant", async () => {
    const { service, calls } = createRepository();
    const input = createAccessGrantSchema.parse({
      professionalId: "professional-1",
      patientId: grantResponse.patient.id,
      actions: ["READ", "CREATE"],
    });

    const result = await service.createGrant("admin-user-id", input);

    assert.equal(result.status, "PENDING");
    assert.equal((calls.created[0] as { grantedByUserId: string }).grantedByUserId, "admin-user-id");
  });

  it("rejects creation if the professional or patient is unavailable", async () => {
    const { service } = createRepository({ createResult: null });
    await assert.rejects(
      service.createGrant("admin-user-id", createAccessGrantSchema.parse({
        professionalId: "professional-1",
        patientId: grantResponse.patient.id,
        actions: ["READ"],
      })),
      (error: unknown) => error instanceof AccessGrantError && error.statusCode === 404,
    );
  });

  it("allows only the assigned patient to accept a pending grant", async () => {
    const { service, calls } = createRepository();
    await assert.rejects(
      service.acceptGrant(grantResponse.id, "professional-user"),
      (error: unknown) => error instanceof AccessGrantError && error.statusCode === 403,
    );
    const accepted = await service.acceptGrant(grantResponse.id, "patient-user");
    assert.equal(accepted.status, "ACTIVE");
    assert.equal(calls.accepted, 1);
  });

  it("rejects accepting a non-pending grant and expires due grants before transitions", async () => {
    const activeGrant = createRepository({
      transition: { id: grantResponse.id, patientUserId: "patient-user", status: "ACTIVE", expiresAt: null },
    });
    await assert.rejects(
      activeGrant.service.acceptGrant(grantResponse.id, "patient-user"),
      (error: unknown) => error instanceof AccessGrantError && error.statusCode === 409,
    );
    assert.equal(activeGrant.calls.expired, 1);

    const list = createRepository();
    await list.service.listGrants("patient-user", { status: "PENDING" });
    assert.equal(list.calls.expired, 1);
    assert.deepEqual(list.calls.listed, [{ userId: "patient-user", filters: { status: "PENDING" } }]);
  });

  it("keeps revocation idempotent and does not overwrite its original record", async () => {
    const { service, calls } = createRepository({
      transition: { id: grantResponse.id, patientUserId: "patient-user", status: "REVOKED", expiresAt: null },
    });
    const result = await service.revokeGrant(grantResponse.id, "patient-user");
    assert.equal(result.id, grantResponse.id);
    assert.equal(calls.revoked, 0);
  });

  it("only allows the assigned patient to revoke a grant", async () => {
    const { service, calls } = createRepository();
    await assert.rejects(
      service.revokeGrant(grantResponse.id, "professional-user"),
      (error: unknown) => error instanceof AccessGrantError && error.statusCode === 403,
    );
    const result = await service.revokeGrant(grantResponse.id, "patient-user");
    assert.equal(result.status, "REVOKED");
    assert.equal(calls.revoked, 1);
  });
});

describe("access grant routes", () => {
  let server: Server;
  let endpoint: string;

  before(async () => {
    const { createServer } = await import("../src/server.ts");
    server = createServer().listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    endpoint = `http://127.0.0.1:${address.port}/v1/access-grants`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("requires a valid bearer token on create, list, accept, and revoke routes", async () => {
    const requests = [
      fetch(endpoint, { method: "POST" }),
      fetch(endpoint),
      fetch(`${endpoint}/${grantResponse.id}/accept`, { method: "PATCH" }),
      fetch(`${endpoint}/${grantResponse.id}/revoke`, { method: "PATCH" }),
    ];
    const responses = await Promise.all(requests);
    assert.deepEqual(responses.map((response) => response.status), [401, 401, 401, 401]);
  });

  it("validates grant body and list filters before repository access", async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin-user")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(jwtSecret));
    const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
    const invalidCreate = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify({}) });
    const invalidFilter = await fetch(`${endpoint}?status=EXPIRED`, { headers: { authorization: headers.authorization } });

    assert.equal(invalidCreate.status, 400);
    assert.equal(invalidFilter.status, 400);
  });

  it("lists access grants from the local database with a valid token", async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin-user")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(jwtSecret));
    const response = await fetch(endpoint, {
      headers: { authorization: `Bearer ${token}` },
    });
    const grants = await response.json() as Array<Record<string, unknown>>;

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(grants));
    for (const grant of grants) {
      assert.ok(["PENDING", "ACTIVE", "REVOKED"].includes(String(grant.status)));
      assert.ok(Array.isArray(grant.actions));
      assert.equal("grantedByUserId" in grant, false);
    }
  });
});