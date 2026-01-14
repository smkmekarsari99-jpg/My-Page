// File: src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../features/login/_db/schema";
// 1. Import schema dari fitur Login (yang sudah Anda miliki)
// Pastikan path-nya benar sesuai struktur folder Anda
import * as authSchema from "@/src/features/login/_db/schema";

// 2. Import schema dari fitur Landing Page (yang baru kita buat)
import * as landingSchema from "@/src/features/landing-page/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    ...authSchema,
    ...landingSchema,
  },
});
