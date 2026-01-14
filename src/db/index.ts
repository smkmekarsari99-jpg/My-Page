import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
// ✅ Cukup import satu file schema utama ini saja
import * as schema from "./schema";

// Logika fallback URL (Vercel/Lokal) - Ini sudah bagus, pertahankan.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or POSTGRES_URL is not set");
}

const pool = new Pool({
  connectionString: connectionString,
});

// ✅ KUNCI PERBAIKAN:
// Masukkan variabel 'schema' langsung. Tidak perlu di-spread (...) lagi.
export const db = drizzle(pool, { schema });
