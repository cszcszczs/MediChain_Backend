import { IAuthRepository, UserLoginData } from "../../services/interfaces/auth.interface.ts";
import prisma from "../index.ts";

export class AuthPrismaRepository implements IAuthRepository {
  async findUserLoginDataByEmail(email: string): Promise<UserLoginData | null> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isActive: true,
        authCredential: {
          select: { passwordHash: true },
        },
      },
    });
  }
}