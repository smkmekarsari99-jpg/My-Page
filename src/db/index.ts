// File: src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "@/src/features/login/_db/schema";
import * as landingSchema from "@/src/features/landing-page/db/schema";

// --- PERUBAHAN DI SINI ---
// Kita buat logika fallback. Prioritaskan DATABASE_URL (lokal),
// kalau tidak ada, ambil POSTGRES_URL (Vercel).
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or POSTGRES_URL is not set");
}

const pool = new Pool({
  connectionString: connectionString,
});
// -------------------------

export const db = drizzle(pool, {
  schema: {
    ...authSchema,
    ...landingSchema,
  },
});
