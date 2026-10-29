import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("El correo es inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginRequestDTO = z.infer<typeof loginSchema>;

export interface LoginResponseDTO {
  accessToken: string;
  tokenType: "Bearer";
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}