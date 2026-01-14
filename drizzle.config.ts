import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load variabel dari .env
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: [
    "./src/features/login/_db/schema.ts",
    "./src/features/landing-page/db/schema.ts",
  ],
  out: "./drizzle", // Folder output untuk file migrasi (nanti otomatis dibuat)
  dialect: "postgresql", // Jenis database
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Mengambil URL dari .env
  },
});
