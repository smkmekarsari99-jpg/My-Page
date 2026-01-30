// C:\Users\USER\Documents\Landing Page Meksa\landing-page\src\features\user-management\actions\student-actions.ts

"use server";

import { db } from "@/src/db";
import { users, studentProfiles, classes, attendance } from "@/src/db/schema";
import { createClient } from "@supabase/supabase-js";
import { eq, desc, and, ilike, or } from "drizzle-orm";
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
// 2. GET STUDENTS (FIXED FILTER LOGIC)
// ============================================================================
const getTodayDate = () => {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
};
const VALID_STATUSES = [
  "hadir",
  "terlambat",
  "sakit",
  "izin",
  "alpha",
] as const;
type AttendanceStatus = (typeof VALID_STATUSES)[number];

export async function getStudents(params?: {
  date?: string;
  classId?: string;
  search?: string;
  status?: string;
}) {
  // 1. Tentukan Tanggal
  const selectedDate = params?.date || getTodayDate();

  try {
    // 2. SIAPKAN KONDISI WHERE (DILAKUKAN DI AWAL)
    const conditions = [];

    // Filter Kelas
    if (params?.classId && params.classId !== "all") {
      conditions.push(eq(studentProfiles.classId, parseInt(params.classId)));
    }

    // Filter Search (Nama atau NIS)
    if (params?.search) {
      conditions.push(
        or(
          ilike(users.name, `%${params.search}%`),
          ilike(studentProfiles.nis, `%${params.search}%`),
        ),
      );
    }

    if (params?.status && params.status !== "all") {
      // Kita cek: apakah text dari URL ada di dalam daftar VALID_STATUSES?
      // Teknik ini disebut "Type Guard"
      const statusParam = params.status as AttendanceStatus;

      if (VALID_STATUSES.includes(statusParam)) {
        // Karena sudah dicek di atas, TypeScript sekarang tahu
        // bahwa statusParam BUKAN sekadar string, tapi tipe AttendanceStatus.
        // Jadi Drizzle tidak akan error.
        conditions.push(eq(attendance.status, statusParam));
      }
    }

    // 3. BUILD QUERY DAN EKSEKUSI SEKALIGUS
    const data = await db
      .select({
        // Data Utama
        id: studentProfiles.id,
        fullName: users.name,
        nis: studentProfiles.nis,
        photoUrl: studentProfiles.photoUrl,
        className: classes.name,

        // Data Pelengkap
        email: users.email,
        nisn: studentProfiles.nisn,
        gender: studentProfiles.gender,
        address: studentProfiles.address,
        classId: studentProfiles.classId,

        // Data Absensi
        attendanceId: attendance.id,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        status: attendance.status,
        attendanceDate: attendance.date,
      })
      .from(studentProfiles)
      .leftJoin(users, eq(studentProfiles.userId, users.id))
      .leftJoin(classes, eq(studentProfiles.classId, classes.id))
      .leftJoin(
        attendance,
        and(
          eq(attendance.studentId, studentProfiles.id),
          eq(attendance.date, selectedDate),
        ),
      )
      // [FIX UTAMA DISINI]
      // .where ditempel langsung. Jika conditions kosong, pakai undefined (agar ambil semua)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(studentProfiles.id));

    return { success: true, data, selectedDate };
  } catch (error) {
    console.error("Error fetching students:", error);
    return {
      success: false,
      data: [],
      selectedDate: params?.date || getTodayDate(),
    };
  }
}

// Type Definition Action State
type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// ============================================================================
// 3. CREATE / UPDATE STUDENT
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
    if (photoFile.size > 2 * 1024 * 1024) {
      return { success: false, message: "Ukuran foto maksimal 2MB!" };
    }
    if (!photoFile.type.startsWith("image/")) {
      return { success: false, message: "File harus berupa gambar!" };
    }

    const fileName = `${Date.now()}-${photoFile.name.replaceAll(" ", "_")}`;

    const { error } = await supabase.storage
      .from("students")
      .upload(fileName, photoFile, {
        contentType: photoFile.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload Error:", error);
      return { success: false, message: "Gagal mengupload foto ke server." };
    }

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

        // Update Profiles
        await tx
          .update(studentProfiles)
          .set({
            nis,
            nisn,
            gender: gender as "L" | "P",
            classId,
            address,
            ...(photoUrl ? { photoUrl } : {}),
          })
          .where(eq(studentProfiles.id, id));
      });

      revalidatePath("/dashboard/students");
      return { success: true, message: "Data siswa berhasil diperbarui." };
    }

    // === SKENARIO CREATE (SISWA BARU) ===
    else {
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existingEmail) {
        return { success: false, message: "Email sudah digunakan user lain." };
      }

      const existingNIS = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.nis, nis),
      });
      if (existingNIS) {
        return { success: false, message: "NIS sudah terdaftar." };
      }

      await db.transaction(async (tx) => {
        const newUserId = uuidv4();
        const hashedPassword = await bcrypt.hash("123456", 10);

        // 1. Insert ke tabel Users
        await tx.insert(users).values({
          id: newUserId,
          name,
          email,
          password: hashedPassword,
          role: "siswa",
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
          photoUrl: photoUrl,
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

    await db.delete(users).where(eq(users.id, student.userId));

    revalidatePath("/dashboard/students");
    return { success: true, message: "Siswa berhasil dihapus." };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, message: "Gagal menghapus siswa." };
  }
}

// ============================================================================
// 5. UPDATE ATTENDANCE STATUS (MANUAL BY ADMIN)
// ============================================================================
export async function updateAttendanceStatus(
  studentId: number,
  date: string,
  status: "hadir" | "sakit" | "izin" | "alpha" | "terlambat",
) {
  try {
    // 1. Cek apakah sudah ada data absensi untuk siswa & tanggal ini
    const existingRecord = await db.query.attendance.findFirst({
      where: and(
        eq(attendance.studentId, studentId),
        eq(attendance.date, date),
      ),
    });

    if (existingRecord) {
      // A. Jika Ada -> UPDATE statusnya saja
      await db
        .update(attendance)
        .set({
          status: status,
          // Opsional: Jika diset sakit/izin, mungkin checkIn/Out mau di-reset atau dibiarkan
          // checkIn: status === 'hadir' || status === 'terlambat' ? attendance.checkIn : null
        })
        .where(eq(attendance.id, existingRecord.id));
    } else {
      // B. Jika Tidak Ada -> INSERT data baru
      await db.insert(attendance).values({
        studentId,
        date,
        status,
        checkIn: null, // Karena manual, jam masuk kosong dulu
        checkOut: null,
      });
    }

    revalidatePath("/dashboard/students");
    return {
      success: true,
      message: `Status berhasil diubah menjadi ${status}`,
    };
  } catch (error) {
    console.error("Update Attendance Error:", error);
    return { success: false, message: "Gagal mengubah status absensi." };
  }
}

// ============================================================================
// 6. BULK IMPORT STUDENTS (FROM EXCEL)
// --- TYPE DEFINITION (Strict) ---
// Tipe data yang valid untuk dikirim ke fungsi ini
export type BulkStudentInput = {
  name: string;
  email: string;
  nis: string;
  nisn: string;
  gender: "L" | "P";
  classId: number;
  address: string;
};

type BulkImportResult = {
  success: boolean;
  message: string;
  count?: number;
  skipped?: number;
};

// --- ACTION ---
export async function bulkCreateStudents(
  studentsData: BulkStudentInput[],
): Promise<BulkImportResult> {
  try {
    if (!studentsData || studentsData.length === 0) {
      return { success: false, message: "Data kosong tidak dapat diproses." };
    }

    // 1. Persiapan Data untuk Pengecekan Duplikasi
    // Kita ambil hanya kolom yang diperlukan untuk validasi (Ringan)
    const existingUsers = await db.select({ email: users.email }).from(users);
    const existingProfiles = await db
      .select({ nis: studentProfiles.nis })
      .from(studentProfiles);

    // Konversi ke Set untuk pencarian O(1) -> Sangat Cepat
    const existingEmails = new Set(existingUsers.map((u) => u.email));
    const existingNIS = new Set(existingProfiles.map((p) => p.nis));

    const hashedPassword = await bcrypt.hash("123456", 10); // Default Password
    let successCount = 0;
    let skipCount = 0;

    // 2. Transaksi Database
    await db.transaction(async (tx) => {
      for (const student of studentsData) {
        // Validasi Duplikasi
        if (existingEmails.has(student.email) || existingNIS.has(student.nis)) {
          skipCount++;
          continue;
        }

        const newUserId = uuidv4();

        // Insert User
        await tx.insert(users).values({
          id: newUserId,
          name: student.name,
          email: student.email,
          password: hashedPassword,
          role: "siswa",
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`,
        });

        // Insert Profile
        await tx.insert(studentProfiles).values({
          userId: newUserId,
          nis: student.nis,
          nisn: student.nisn,
          classId: student.classId,
          gender: student.gender,
          address: student.address,
          photoUrl: null,
        });

        // Update Set lokal agar jika ada duplikat di dalam file Excel itu sendiri, terdeteksi
        existingEmails.add(student.email);
        existingNIS.add(student.nis);
        successCount++;
      }
    });

    revalidatePath("/dashboard/students");

    return {
      success: true,
      message: `Import Selesai!`,
      count: successCount,
      skipped: skipCount,
    };
  } catch (error) {
    console.error("Bulk Import Error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem saat import data.",
    };
  }
}

// ============================================================================
// 7. GET ALL STUDENTS FOR EXPORT (FINAL - LINTER FRIENDLY)
// ============================================================================
export async function getAllStudentsForExport() {
  try {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    const data = await db
      .select({
        nama: users.name,
        nis: studentProfiles.nis,
        nisn: studentProfiles.nisn,
        email: users.email,
        gender: studentProfiles.gender,
        kelas: classes.name,
        alamat: studentProfiles.address,
        status: attendance.status,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        date: attendance.date,
      })
      .from(users)
      .innerJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .innerJoin(classes, eq(studentProfiles.classId, classes.id))
      .leftJoin(
        attendance,
        and(
          eq(attendance.studentId, studentProfiles.id),
          eq(attendance.date, today),
        ),
      )
      .orderBy(classes.name, users.name);

    const formattedData = data.map((item) => {
      // [FIX] Gunakan 'unknown' pengganti 'any' agar ESLint tidak marah
      const formatTime = (timeVal: unknown) => {
        if (!timeVal) return "-";

        // Cek apakah string
        if (typeof timeVal === "string") {
          return timeVal.substring(0, 5);
        }

        // Cek apakah Date Object
        if (timeVal instanceof Date) {
          return timeVal.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }
        return "-";
      };

      const formatStatus = (status: string | null) => {
        if (!status) return "Belum Absen";
        return status.charAt(0).toUpperCase() + status.slice(1);
      };

      // [FIX] Casting ke 'unknown' dulu
      let dateDisplay = today;
      if (item.date) {
        const rawDate = item.date as unknown; // Trick agar bisa dicek instanceof

        if (rawDate instanceof Date) {
          dateDisplay = rawDate.toLocaleDateString("id-ID");
        } else if (typeof rawDate === "string") {
          dateDisplay = rawDate;
        }
      }

      return {
        "Nama Lengkap": item.nama,
        NIS: item.nis,
        NISN: item.nisn || "-",
        Email: item.email,
        "L/P": item.gender,
        Kelas: item.kelas,
        Alamat: item.alamat || "-",
        Tanggal: dateDisplay,
        Status: formatStatus(item.status),
        "Jam Masuk": formatTime(item.checkIn),
        "Jam Pulang": formatTime(item.checkOut),
      };
    });

    return formattedData;
  } catch (error) {
    console.error("Export Error:", error);
    return [];
  }
}
