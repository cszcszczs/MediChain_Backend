import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { hash } from "argon2";
import { jwtVerify } from "jose";
import type { UserLoginData, IAuthRepository } from "../src/services/interfaces/auth.interface.ts";
import type { LoginRequestDTO } from "../src/dto/auth.dto.ts";

const jwtSecret = "test-only-secret-with-at-least-32-bytes";
process.env.JWT_SECRET = jwtSecret;

const { AuthService } = await import("../src/services/auth.service.ts");

const credentials: LoginRequestDTO = {
  email: "ana@example.com",
  password: "secure-password",
};

describe("AuthService.login", () => {
  let passwordHash: string;

  before(async () => {
    passwordHash = await hash(credentials.password);
  });

  const createService = (user: UserLoginData | null) => {
    const repository = {
      findUserLoginDataByEmail: async () => user,
    } as IAuthRepository;

    return new AuthService(repository);
  };

  const createUser = (overrides: Partial<UserLoginData> = {}): UserLoginData => ({
    id: "user-123",
    email: credentials.email,
    isActive: true,
    authCredential: { passwordHash },
    ...overrides,
  });

  it("returns a signed bearer token and basic user data", async () => {
    const result = await createService(createUser()).login(credentials);

    assert.ok(result);
    assert.equal(result.tokenType, "Bearer");
    assert.equal(result.user.id, "user-123");
    assert.equal(result.user.email, credentials.email);
    assert.equal("passwordHash" in result.user, false);

    const { payload } = await jwtVerify(
      result.accessToken,
      new TextEncoder().encode(jwtSecret),
    );
    assert.equal(payload.sub, "user-123");
    assert.ok(payload.exp && payload.exp > Math.floor(Date.now() / 1000));
  });

  it("rejects an incorrect password", async () => {
    const result = await createService(createUser()).login({
      ...credentials,
      password: "wrong-password",
    });

    assert.equal(result, null);
  });

  it("rejects a user that does not exist", async () => {
    const result = await createService(null).login(credentials);

    assert.equal(result, null);
  });

  it("rejects a user without an authentication credential", async () => {
    const result = await createService(
      createUser({ authCredential: null }),
    ).login(credentials);

    assert.equal(result, null);
  });

  it("rejects an inactive user", async () => {
    const result = await createService(
      createUser({ isActive: false }),
    ).login(credentials);

    assert.equal(result, null);
  });
});