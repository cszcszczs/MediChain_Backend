import { LoginRequestDTO, LoginResponseDTO } from "../../dto/auth.dto.ts";

export interface UserLoginData {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  authCredential: { passwordHash: string } | null;
}

export interface IAuthService {
  login(credentials: LoginRequestDTO): Promise<LoginResponseDTO | null>;
}

export interface IAuthRepository {
  findUserLoginDataByEmail(email: string): Promise<UserLoginData | null>;
}