"use server";

import { db } from "@/src/db";
import { users } from "@/src/features/login/_db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

// 1. Definisikan Tipe State
export type FormState = {
  message?: string;
  error?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
  };
};

const CreateUserSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  role: z.enum(["admin", "guru", "siswa"], {
    message: "Pilih role yang valid (admin, guru, atau siswa)",
  }),
});

// 2. Gunakan Tipe FormState menggantikan 'any'
export async function createUser(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const validatedFields = CreateUserSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      // Zod mengembalikan array of strings untuk setiap field
      error: validatedFields.error.flatten().fieldErrors,
      message: "Gagal validasi data. Periksa inputan Anda.",
    };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        message: "Email sudah digunakan user lain.",
        // Kita kembalikan object error kosong agar sesuai tipe
        error: {},
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: "Terjadi kesalahan saat menyimpan ke database.",
      error: {},
    };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");

  // TypeScript butuh return di akhir function path,
  // meskipun redirect di atas akan melempar error (NEXT_REDIRECT)
  return { message: "Berhasil" };
}

export async function deleteUser(userId: number) {
  try {
    // 1. Eksekusi Hapus di DB
    await db.delete(users).where(eq(users.id, userId));

    // 2. Refresh halaman agar data hilang dari tabel
    revalidatePath("/dashboard/users");

    return { message: "User berhasil dihapus" };
  } catch (error) {
    console.error("Gagal menghapus user:", error);
    return { message: "Gagal menghapus user" };
  }
}
