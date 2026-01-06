"use server";

import { db } from "@/src/db";
import { users } from "@/src/features/login/_db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";

// --- 1. DEFINISI TIPE ---

export type ActionState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    _form?: string[];
  };
  message?: string | null;
};

// --- 2. SCHEMAS (ZOD) ---

// Kita definisikan Enum Role sekali saja agar bisa dipakai ulang (Reusability)
const RoleEnum = z.enum(["admin", "guru", "siswa", "staff"]);

// Schema untuk CREATE
const CreateUserSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: RoleEnum, // Gunakan enum yang sudah didefinisikan
});

// Schema untuk UPDATE
const UpdateUserSchema = z.object({
  id: z.coerce.number(), // coerce mengubah string '123' jadi number 123
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: RoleEnum,
});

// --- 3. ACTIONS ---

// A. CREATE USER
export async function createUser(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const validatedFields = CreateUserSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gagal membuat user. Cek input Anda.",
    };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    // Cek duplikasi email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return {
        errors: { email: ["Email sudah digunakan user lain."] },
        message: "Gagal membuat user.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Hapus 'as any'. Zod sudah menjamin 'role' adalah "admin" | "guru" | "siswa" | "staff"
    // Pastikan di schema Drizzle, kolom role tipenya sesuai (varchar atau pgEnum dengan value sama)
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: role,
    });
  } catch (error) {
    console.error("Create Error:", error);
    return { message: "Database Error: Gagal menyimpan user." };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

// B. UPDATE USER
export async function updateUser(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  };

  const validatedFields = UpdateUserSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gagal update. Cek input Anda.",
    };
  }

  const { id, name, email, role } = validatedFields.data;

  try {
    await db
      .update(users)
      .set({
        name,
        email,
        role: role, // Tanpa 'as any', Type-safe karena output Zod match dengan Schema
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    revalidatePath("/dashboard/users");

    return { message: "✅ Berhasil mengupdate user!" };
  } catch (error) {
    console.error("Update Error:", error);
    return { message: "Gagal mengupdate database." };
  }
}

// C. DELETE USER
export async function deleteUser(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/dashboard/users");
    return { success: true, message: "User berhasil dihapus" };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Gagal menghapus user" };
  }
}
