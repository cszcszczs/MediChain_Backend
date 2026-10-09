import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '../config/env.ts';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Se usa la conexión a la base de datos
const connectionString = env.url;
const isLocalDatabase = ['localhost', '127.0.0.1', '[::1]'].includes(
  new URL(connectionString).hostname,
);

const pool = new Pool({
  connectionString,
  ...(isLocalDatabase ? {} : { ssl: { rejectUnauthorized: false } }),
  max: 10,
});

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
