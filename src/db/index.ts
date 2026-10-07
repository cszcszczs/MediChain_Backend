import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Se usa la conexión a la base de datos
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  // Desactiva la verificación estricta de SSL para conexiones pooled de Supabase
  ssl: { rejectUnauthorized: false },
  // Limita el tamaño del pool local para no saturar el pooler de Supabase
  max: 10,
});

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
