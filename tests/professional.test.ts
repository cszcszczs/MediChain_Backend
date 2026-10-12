import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";
import { verify } from "argon2";
import { SignJWT } from "jose";
import { createProfessionalSchema } from "../src/dto/professional.dto.ts";
import type {
  CreateProfessionalData,
  IProfessionalRepository,
} from "../src/services/interfaces/professional.interface.ts";
import type { ProfessionalResponseDTO } from "../src/dto/professional.dto.ts";
import { ProfessionalService } from "../src/services/professional.service.ts";

const validRequest = {
  firstName: "Lucia",
  lastName: "Gomez",
  documentType: "CEDULA",
  documentNumber: "1234567890",
  phone: "3001234567",
  email: "lucia.gomez@example.com",
  specialty: "CARDIOLOGY",
  medicalLicense: "RM-98765",
  institution: "Clinica Central",
  password: "secure-password",
};

describe("createProfessionalSchema", () => {
  it("accepts valid professional data and rejects invalid enums", () => {
    assert.equal(createProfessionalSchema.safeParse(validRequest).success, true);
    const { institution: _institution, ...withoutInstitution } = validRequest;
    assert.equal(createProfessionalSchema.safeParse(withoutInstitution).success, false);
    assert.equal(
      createProfessionalSchema.safeParse({ ...validRequest, specialty: "DENTISTRY" }).success,
      false,
    );
  });
});

describe("ProfessionalService.createProfessional", () => {
  it("hashes the password and returns only public professional data", async () => {
    let persisted: CreateProfessionalData | undefined;
    const publicProfessional: ProfessionalResponseDTO = {
      id: "professional-123",
      firstName: validRequest.firstName,
      lastName: validRequest.lastName,
      documentType: "CEDULA",
      documentNumber: validRequest.documentNumber,
      phone: validRequest.phone,
      email: validRequest.email,
      specialty: "CARDIOLOGY",
      medicalLicense: validRequest.medicalLicense,
      institution: validRequest.institution,
      userStatus: "ACTIVE",
    };
    const repository = {
      createProfessional: async (data: CreateProfessionalData) => {
        persisted = data;
        return publicProfessional;
      },
    } as IProfessionalRepository;
    const service = new ProfessionalService(repository);

    const result = await service.createProfessional(
      createProfessionalSchema.parse(validRequest),
    );

    assert.ok(persisted);
    assert.notEqual(persisted.passwordHash, validRequest.password);
    assert.equal(await verify(persisted.passwordHash, validRequest.password), true);
    assert.equal("password" in persisted, false);
    assert.equal("passwordHash" in result, false);
    assert.deepEqual(result, publicProfessional);
  });
});

describe("ProfessionalService.listActiveProfessionals", () => {
  it("delegates to the repository and returns public professional profiles", async () => {
    const expected: ProfessionalResponseDTO[] = [];
    const repository = {
      listActiveProfessionals: async () => expected,
    } as IProfessionalRepository;
    const service = new ProfessionalService(repository);

    assert.equal(await service.listActiveProfessionals(), expected);
  });
});

describe("GET /v1/professional", () => {
  const jwtSecret = "test-only-secret-with-at-least-32-bytes";
  let server: Awaited<ReturnType<typeof import("node:http").createServer>>;
  let endpoint: string;

  before(async () => {
    process.env.JWT_SECRET = jwtSecret;
    const { createServer } = await import("../src/server.ts");
    server = createServer().listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    endpoint = `http://127.0.0.1:${address.port}/v1/professional`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("rejects requests without a valid bearer token", async () => {
    const response = await fetch(endpoint);
    assert.equal(response.status, 401);
  });

  it("returns active public professional profiles for a valid token", async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("test-user")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(jwtSecret));
    const response = await fetch(endpoint, {
      headers: { authorization: `Bearer ${token}` },
    });
    const professionals = await response.json() as Array<Record<string, unknown>>;

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(professionals));
    for (const professional of professionals) {
      assert.equal(professional.userStatus, "ACTIVE");
      assert.equal("password" in professional, false);
      assert.equal("passwordHash" in professional, false);
    }
  });
});

describe("POST /v1/professional", () => {
  let server: Awaited<ReturnType<typeof import("node:http").createServer>>;

  before(async () => {
    process.env.JWT_SECRET = "test-only-secret-with-at-least-32-bytes";
    const { createServer } = await import("../src/server.ts");
    server = createServer().listen(0, "127.0.0.1");
    await once(server, "listening");
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it("returns the standard validation error for invalid input", async () => {
    const address = server.address();
    assert.ok(address && typeof address !== "string");

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/professional`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await response.json() as { message: string; errors: unknown[] };

    assert.equal(response.status, 400);
    assert.equal(body.message, "Datos inválidos");
    assert.ok(body.errors.length > 0);
  });
});