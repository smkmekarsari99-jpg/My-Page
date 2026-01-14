import "dotenv/config"; // Cukup satu kali import dotenv
import { db } from "@/src/db/index";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// Setup Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// PENTING: Gunakan SERVICE_ROLE_KEY, bukan Anon Key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("⏳ Sedang memproses seeding data...");

  const adminEmail = "admin@sekolah.com";
  const rawPassword = "PasswordAdmin123!"; // Password asli untuk login

  // ---------------------------------------------------------
  // LANGKAH 1: Buat User di Supabase Auth (auth.users)
  // ---------------------------------------------------------
  console.log("   --> Mendaftarkan ke Supabase Auth...");

  // Cek dulu apakah user sudah ada untuk mencegah error
  const { data: listUsers } = await supabase.auth.admin.listUsers();
  const existingUser = listUsers.users.find((u) => u.email === adminEmail);

  let userId = existingUser?.id;

  if (!userId) {
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: rawPassword,
        email_confirm: true, // Langsung verifikasi email
        user_metadata: { role: "admin" },
      });

    if (authError) {
      throw new Error(`Gagal buat Auth User: ${authError.message}`);
    }
    userId = authData.user.id;
  } else {
    console.log(
      "   --> User Auth sudah ada, melanjutkan update data public...",
    );
  }

  // ---------------------------------------------------------
  // LANGKAH 2: Masukkan ke Tabel Public (public.users)
  // ---------------------------------------------------------
  console.log("   --> Menyimpan ke database aplikasi...");

  // Kita tetap hash password jika kolom tabel Anda mewajibkannya,
  // tapi ingat: login Supabase pakai password asli, bukan hash ini.
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Gunakan .onConflictDoUpdate jika Anda ingin seed bisa dijalankan berulang kali
  // atau cek manual seperti di bawah:

  await db
    .insert(users)
    .values({
      id: userId, // <--- PENTING: ID harus sama dengan Supabase Auth ID
      name: "Admin Utama",
      email: adminEmail,
      password: hashedPassword, // Opsional: sebenarnya tidak perlu disimpan di sini jika pakai Supabase Auth
      role: "admin",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email, // Pastikan kolom email unique di schema.ts
      set: {
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },
    });

  console.log("✅ Berhasil! Akun Admin siap digunakan.");
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Pass : ${rawPassword}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Terjadi Error:", err);
  process.exit(1);
});
