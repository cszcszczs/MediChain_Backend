import { defineConfig } from '@prisma/config';
import { env } from "../src/config/env.ts";

export default defineConfig({
  datasource: {
    // Usa la conexión directa de Supabase (puerto 5432)
    url: env.url,
  },
});
