import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.ts";
import type { IHistoryStorage } from "./interfaces/history.interface.ts";

export class SupabaseHistoryStorage implements IHistoryStorage {
  readonly bucket = env.supabaseHistoryBucket;

  private getClient() {
    if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
      throw new Error("Supabase Storage no está configurado");
    }
    return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async upload(objectPath: string, file: Express.Multer.File): Promise<void> {
    const { error } = await this.getClient().storage.from(this.bucket).upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throw new Error(`Falló la carga a Supabase Storage: ${error.message}`);
  }

  async remove(objectPaths: string[]): Promise<void> {
    if (objectPaths.length === 0) return;
    const { error } = await this.getClient().storage.from(this.bucket).remove(objectPaths);
    if (error) throw new Error(`Falló la limpieza de Supabase Storage: ${error.message}`);
  }
}