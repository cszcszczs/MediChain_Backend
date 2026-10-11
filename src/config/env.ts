import dotenv from "dotenv";

dotenv.config()

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || new TextEncoder().encode(jwtSecret).byteLength < 32) {
  throw new Error("JWT_SECRET debe configurarse con al menos 32 bytes");
}

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  jwtSecret,
}

