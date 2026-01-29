// C:\Users\USER\Documents\Landing Page Meksa\landing-page\src\features\user-management\actions\student-actions.ts

"use server";

import { db } from "@/src/db";
import {
  users,
  studentProfiles,
  classes,
  type StudentWithDetails,
} from "@/src/db/schema";
import { createClient } from "@supabase/supabase-js";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { studentSchema } from "@/src/lib/validators/student";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

// ============================================================================
// 1. SETUP SUPABASE CLIENT
// ============================================================================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ============================================================================
// 2. GET STUDENTS
// ============================================================================
export async function getStudents(): Promise<StudentWithDetails[]> {
  try {
    const data = await db
      .select({
        id: studentProfiles.id,
        userId: studentProfiles.userId,
        classId: studentProfiles.classId,
        nis: studentProfiles.nis,
        nisn: studentProfiles.nisn,
        photoUrl: studentProfiles.photoUrl,
        address: studentProfiles.address,
        gender: studentProfiles.gender,
        user: {
          name: users.name,
          email: users.email,
          image: users.image,
        },
        class: {
          name: classes.name,
        },
      })
      .from(studentProfiles)
      .leftJoin(users, eq(studentProfiles.userId, users.id))
      .leftJoin(classes, eq(studentProfiles.classId, classes.id))
      .orderBy(desc(studentProfiles.id));

    return data.map((row) => ({
      ...row,
      user: row.user!,
      class: row.class,
    })) as StudentWithDetails[];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

// Type Definition Action State
type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// ============================================================================
// 3. CREATE / UPDATE STUDENT (DENGAN FOTO)
// ============================================================================
export async function saveStudent(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());

  // 1. Validasi Input Text dengan Zod
  const validated = studentSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validasi gagal, mohon periksa inputan Anda.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // 2. Logic Upload Foto ke Supabase
  const photoFile = formData.get("photo") as File;
  let photoUrl: string | null = null;

  if (photoFile && photoFile.size > 0) {
    // Validasi File
    if (photoFile.size > 2 * 1024 * 1024) {
      return { success: false, message: "Ukuran foto maksimal 2MB!" };
    }
    if (!photoFile.type.startsWith("image/")) {
      return { success: false, message: "File harus berupa gambar!" };
    }

    // Generate nama file unik
    const fileName = `${Date.now()}-${photoFile.name.replaceAll(" ", "_")}`;

    // Upload
    const { error } = await supabase.storage
      .from("students") // Pastikan bucket 'students' sudah public
      .upload(fileName, photoFile, {
        contentType: photoFile.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload Error:", error);
      return { success: false, message: "Gagal mengupload foto ke server." };
    }

    // Ambil Public URL
    const { data: publicData } = supabase.storage
      .from("students")
      .getPublicUrl(fileName);

    photoUrl = publicData.publicUrl;
  }

  const { name, email, nis, nisn, gender, classId, address, id } =
    validated.data;

  try {
    // === SKENARIO UPDATE ===
    if (id) {
      const existingStudent = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.id, id),
      });

      if (!existingStudent) {
        return { success: false, message: "Siswa tidak ditemukan." };
      }

      await db.transaction(async (tx) => {
        // Update Users
        await tx
          .update(users)
          .set({ name, email, updatedAt: new Date() })
          .where(eq(users.id, existingStudent.userId));

        await tx
          .update(studentProfiles)
          .set({
            nis,
            nisn,
            gender: gender as "L" | "P",
            classId,
            address,
            ...(photoUrl ? { photoUrl } : {}), // <--- INI SOLUSINYA
          })
          .where(eq(studentProfiles.id, id));
      });

      revalidatePath("/dashboard/students");
      return { success: true, message: "Data siswa berhasil diperbarui." };
    }

    // === SKENARIO CREATE (SISWA BARU) ===
    else {
      // Cek Email Duplicate
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existingEmail) {
        return { success: false, message: "Email sudah digunakan user lain." };
      }

      // Cek NIS Duplicate
      const existingNIS = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.nis, nis),
      });
      if (existingNIS) {
        return { success: false, message: "NIS sudah terdaftar." };
      }

      await db.transaction(async (tx) => {
        const newUserId = uuidv4();
        const hashedPassword = await bcrypt.hash("123456", 10); // Default Password

        // 1. Insert ke tabel Users
        await tx.insert(users).values({
          id: newUserId,
          name,
          email,
          password: hashedPassword,
          role: "siswa",
          // Jika tidak ada foto upload, pakai avatar default UI-Avatars
          image: photoUrl
            ? photoUrl
            : `https://ui-avatars.com/api/?name=${name}&background=random`,
        });

        // 2. Insert ke tabel StudentProfiles
        await tx.insert(studentProfiles).values({
          userId: newUserId,
          nis,
          nisn,
          classId,
          gender: gender as "L" | "P",
          address,
          photoUrl: photoUrl, // <--- BAGIAN PENTING: Simpan URL ke DB
        });
      });

      revalidatePath("/dashboard/students");
      return { success: true, message: "Siswa baru berhasil ditambahkan." };
    }
  } catch (error) {
    console.error("Error saving student:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}

// ============================================================================
// 4. DELETE STUDENT
// ============================================================================
export async function deleteStudent(studentId: number) {
  try {
    const student = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.id, studentId),
    });

    if (!student) return { success: false, message: "Siswa tidak ditemukan" };

    // Hapus user (Cascade delete akan menghapus profile juga jika setting DB benar)
    // Jika tidak cascade manual, hapus profile dulu baru user.
    await db.delete(users).where(eq(users.id, student.userId));

    revalidatePath("/dashboard/students");
    return { success: true, message: "Siswa berhasil dihapus." };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Gagal menghapus siswa." };
  }
}
