"use server";

import { db } from "@/src/db";
import { classes, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==========================================
// 1. PERBAIKAN SCHEMA (Hapus errorMap yang bermasalah)
// ==========================================

const classSchema = z.object({
  name: z.string().min(2, { message: "Nama kelas minimal 2 karakter" }),

  // PERBAIKAN 1: Hapus options object kedua untuk sementara agar kompatibel
  // Zod akan otomatis menolak jika value bukan X, XI, atau XII
  grade: z.enum(["X", "XI", "XII"]),

  major: z.string().min(2, { message: "Jurusan wajib diisi" }),
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, {
    message: "Format tahun harus YYYY/YYYY",
  }),
  teacherId: z.string().uuid({ message: "ID Guru tidak valid" }),
});

export type ActionState = {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof z.infer<typeof classSchema>]?: string[];
  };
};

export async function createClass(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // ==========================================
  // 2. PERBAIKAN TIPE DATA (Hapus 'any')
  // ==========================================

  const rawData = {
    name: formData.get("name") as string,

    // PERBAIKAN 2: Ubah 'as any' menjadi 'as string'
    // Kita "memaksa" TS menganggap ini string agar bisa masuk ke validasi Zod.
    // Jika value-nya aneh (bukan X/XI/XII), Zod yang akan menangkap errornya, bukan TypeScript.
    grade: formData.get("grade") as string,

    major: formData.get("major") as string,
    academicYear: formData.get("academicYear") as string,
    teacherId: formData.get("teacherId") as string,
  };

  // Validasi Zod
  // (Jika 'grade' ternyata string kosong atau ngawur, safeParse akan return success: false)
  const validated = classSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validasi gagal. Periksa input Anda.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // Security Check
    const teacher = await db.query.users.findFirst({
      where: eq(users.id, validated.data.teacherId),
      columns: { role: true },
    });

    if (!teacher || teacher.role !== "guru") {
      return {
        success: false,
        message: "Validasi Gagal: User yang dipilih bukan Guru!",
      };
    }

    // Insert ke Database
    await db.insert(classes).values({
      name: validated.data.name,

      // Karena sudah divalidasi Zod, TS tahu ini pasti "X" | "XI" | "XII"
      // Tapi kadang TS butuh penegasan ulang (Type Casting) karena 'grade' di DB adalah Enum
      grade: validated.data.grade as "X" | "XI" | "XII",

      major: validated.data.major,
      academicYear: validated.data.academicYear,
      teacherId: validated.data.teacherId,
    });

    revalidatePath("/dashboard/classes");
    return { success: true, message: "Kelas berhasil dibuat!" };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem saat menyimpan data.",
    };
  }
}

export async function deleteClass(
  id: number,
): Promise<{ success: boolean; message: string }> {
  try {
    await db.delete(classes).where(eq(classes.id, id));
    revalidatePath("/dashboard/classes");
    return { success: true, message: "Data kelas berhasil dihapus." };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Gagal menghapus data kelas." };
  }
}

// 6. UPDATE ACTION (BARU)
// ==========================================
export async function updateClass(
  id: number,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawData = {
    name: formData.get("name") as string,
    grade: formData.get("grade") as string,
    major: formData.get("major") as string,
    academicYear: formData.get("academicYear") as string,
    teacherId: formData.get("teacherId") as string,
  };

  const validated = classSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validasi gagal.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // Update Database
    await db
      .update(classes)
      .set({
        name: validated.data.name,
        grade: validated.data.grade as "X" | "XI" | "XII",
        major: validated.data.major,
        academicYear: validated.data.academicYear,
        teacherId: validated.data.teacherId,
        updatedAt: new Date(), // Update timestamp
      })
      .where(eq(classes.id, id));

    revalidatePath("/dashboard/classes");
    return { success: true, message: "Data kelas berhasil diperbarui!" };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, message: "Gagal memperbarui data kelas." };
  }
}
