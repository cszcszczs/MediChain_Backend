import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";
import { SignJWT } from "jose";

const jwtSecret = "patient-registration-test-secret-at-least-32-bytes";
process.env.JWT_SECRET = jwtSecret;

describe("POST /v1/patient", () => {
  let server: Awaited<ReturnType<typeof import("node:http").createServer>>;
  let endpoint: string;

  before(async () => {
    const { createServer } = await import("../src/server.ts");
    server = createServer().listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    endpoint = `http://127.0.0.1:${address.port}/v1/patient`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("rejects registration without a bearer token", async () => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 401);
  });

  it("reaches request validation when the bearer token is valid", async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("admin-user")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(jwtSecret));
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    const body = await response.json() as { message: string; errors: unknown[] };

    assert.equal(response.status, 400);
    assert.equal(body.message, "Datos inválidos");
    assert.ok(body.errors.length > 0);
  });
});