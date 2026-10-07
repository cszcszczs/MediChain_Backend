import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Usa la conexión directa de Supabase (puerto 5432)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
