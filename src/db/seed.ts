import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema"; // ✅ Import schema gabungan
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// 1. Setup Database Connection (Langsung di sini agar mandiri)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not defined");

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

// 2. Setup Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Wajib ada di .env

if (!supabaseServiceKey)
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing!");

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("⏳ Sedang memproses seeding data...");

  const adminEmail = "admin@sekolah.com";
  const rawPassword = "PasswordAdmin123!"; // Password untuk login

  // ---------------------------------------------------------
  // LANGKAH 1: Buat User di Supabase Auth (auth.users)
  // ---------------------------------------------------------
  console.log("   --> Mendaftarkan ke Supabase Auth...");

  // Cek user di Auth Supabase
  const { data: listUsers } = await supabase.auth.admin.listUsers();
  const existingUser = listUsers.users.find((u) => u.email === adminEmail);

  let userId = existingUser?.id;

  if (!userId) {
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: rawPassword,
        email_confirm: true,
        user_metadata: { role: "admin" },
      });

    if (authError) {
      throw new Error(`Gagal buat Auth User: ${authError.message}`);
    }
    userId = authData.user.id;
    console.log("   --> User Auth baru berhasil dibuat.");
  } else {
    console.log("   --> User Auth sudah ada, melanjutkan...");
  }

  // ---------------------------------------------------------
  // LANGKAH 2: Masukkan ke Tabel Public (public.users)
  // ---------------------------------------------------------
  console.log("   --> Menyimpan ke database aplikasi (public.users)...");

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Menggunakan schema.users yang baru
  await db
    .insert(schema.users)
    .values({
      id: userId!, // ID harus sama dengan Supabase Auth
      name: "Admin Utama",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
      // image: "", // Opsional
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },
    });

  console.log("✅ Berhasil! Akun Admin siap digunakan.");
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Pass : ${rawPassword}`);
}

main()
  .catch((err) => {
    console.error("❌ Terjadi Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end(); // Tutup koneksi database
    process.exit(0);
  });
