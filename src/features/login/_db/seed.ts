// File: src/db/seed.ts
import "dotenv/config";
import { db } from "@/src/db/index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("⏳ Sedang memproses seeding data...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const newAdmin = await db
    .insert(users)
    .values({
      name: "Admin Utama",
      email: "admin@sekolah.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
    })
    .returning();

  console.log("✅ Berhasil membuat Admin:", newAdmin);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Terjadi Error:", err);
  process.exit(1);
});
