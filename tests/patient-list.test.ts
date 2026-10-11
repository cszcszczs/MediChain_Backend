import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";
import { SignJWT } from "jose";

const jwtSecret = "patient-list-test-secret-with-at-least-32-bytes";
process.env.JWT_SECRET = jwtSecret;

const { createServer } = await import("../src/server.ts");

describe("GET /v1/patient", () => {
  const server = createServer().listen(0, "127.0.0.1");
  let baseUrl: string;

  before(async () => {
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}/v1/patient`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("rejects requests without a bearer token", async () => {
    const response = await fetch(baseUrl);

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      message: "Token de autenticación requerido",
    });
  });

  it("rejects invalid bearer tokens", async () => {
    const response = await fetch(baseUrl, {
      headers: { authorization: "Bearer not-a-valid-token" },
    });

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      message: "Token de autenticación inválido",
    });
  });

  it("rejects malformed bearer headers", async () => {
    const response = await fetch(baseUrl, {
      headers: { authorization: "Bearer not-a-valid-token trailing-content" },
    });

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      message: "Token de autenticación requerido",
    });
  });

  it("returns the public active-patient list for a valid token", async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("test-user")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(jwtSecret));
    const response = await fetch(baseUrl, {
      headers: { authorization: `Bearer ${token}` },
    });
    const patients = await response.json() as Array<Record<string, unknown>>;

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(patients));
    for (const patient of patients) {
      assert.equal(typeof patient.id, "string");
      assert.equal(typeof patient.name, "string");
      assert.equal(typeof patient.documentNumber, "string");
      assert.equal(typeof patient.email, "string");
      assert.equal("password" in patient, false);
      assert.equal("passwordHash" in patient, false);
    }
  });
});
