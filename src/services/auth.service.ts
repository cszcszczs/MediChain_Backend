import { verify } from "argon2";
import { SignJWT } from "jose";
import { env } from "../config/env.ts";
import { LoginRequestDTO, LoginResponseDTO } from "../dto/auth.dto.ts";
import { IAuthRepository } from "./interfaces/auth.interface.ts";

export class AuthService {
  constructor(readonly authRepository: IAuthRepository) {}

  async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO | null> {
    const user = await this.authRepository.findUserLoginDataByEmail(credentials.email);

    if (!user?.isActive || !user.authCredential) {
      return null;
    }

    let passwordMatches = false;
    try {
      passwordMatches = await verify(user.authCredential.passwordHash, credentials.password);
    } catch {
      return null;
    }

    if (!passwordMatches) {
      return null;
    }

    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(env.jwtSecret));

    return {
      accessToken,
      tokenType: "Bearer",
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}