import { IAuthRepository, UserLoginData } from "../../services/interfaces/auth.interface.ts";
import prisma from "../index.ts";

export class AuthPrismaRepository implements IAuthRepository {
  async findUserLoginDataByEmail(email: string): Promise<UserLoginData | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isActive: true,
        patient: { select: { firstName: true, lastName: true } },
        professional: { select: { firstName: true, lastName: true } },
        authCredential: {
          select: { passwordHash: true },
        },
      },
    });
    if (!user) return null;

    const profile = user.patient ?? user.professional;
    return {
      id: user.id,
      email: user.email,
      name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : null,
      isActive: user.isActive,
      authCredential: user.authCredential,
    };
  }
}