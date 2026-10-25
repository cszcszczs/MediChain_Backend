import "dotenv/config";
import { hash } from "argon2";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const email = process.env.ADMIN_EMAIL?.trim();
const password = process.env.ADMIN_PASSWORD;
const connectionString =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DIRECT_URL ??
  process.env.SUPABASE_DATABASE_URL;

if (!email) {
  throw new Error("ADMIN_EMAIL debe configurarse para ejecutar el seed");
}
if (!password || password.length < 8) {
  throw new Error("ADMIN_PASSWORD debe configurarse con al menos 8 caracteres");
}
if (!connectionString) {
  throw new Error("Configura DIRECT_URL o DATABASE_URL para ejecutar el seed");
}

const isLocalDatabase = ["localhost", "127.0.0.1", "[::1]"].includes(
  new URL(connectionString).hostname,
);
const pool = new Pool({
  connectionString,
  ...(isLocalDatabase ? {} : { ssl: { rejectUnauthorized: false } }),
  max: 1,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const passwordHash = await hash(password);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      authCredential: {
        create: { passwordHash },
      },
    },
    update: {
      authCredential: {
        upsert: {
          create: { passwordHash },
          update: {},
        },
      },
    },
  });
  console.log(`Usuario inicial disponible: ${email}`);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
