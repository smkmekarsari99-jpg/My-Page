"use server";

import { db } from "@/src/db";
import {
  attendance,
  studentProfiles,
  schoolSettings,
  classes,
  type SchoolSettings, // 1. Import Type yang sudah kamu define di schema
} from "@/src/db/schema";
import {
  qrPayloadSchema,
  type ScanResult,
} from "@/src/lib/validators/attendance";
import { eq, and } from "drizzle-orm"; // sql tidak dipakai, bisa dihapus
import { revalidatePath } from "next/cache";

export async function processAttendance(qrData: string): Promise<ScanResult> {
  try {
    // 1. Parsing Data QR
    const parsed = JSON.parse(qrData);
    const validation = qrPayloadSchema.safeParse(parsed);

    if (!validation.success) {
      return { success: false, message: "Format QR Code tidak valid!" };
    }

    const { nis } = validation.data;

    // 2. Cari Siswa Berdasarkan NIS
    const student = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.nis, nis),
      with: {
        user: true,
        class: true,
      },
    });

    if (!student || !student.user) {
      return { success: false, message: "Siswa tidak ditemukan!" };
    }

    // 3. Ambil Setting Sekolah (Type-Safe)
    const dbSettings = await db.query.schoolSettings.findFirst();

    // Kita definisikan settings secara eksplisit dengan tipe SchoolSettings
    // Ini menjamin settings TIDAK PERNAH null/undefined di baris bawahnya
    const settings: SchoolSettings = dbSettings || {
      id: 0, // Dummy ID (karena ini fallback memori, tidak masuk DB)
      checkInStart: "06:00:00",
      lateThreshold: "07:15:00",
      checkOutStart: "15:00:00",
      updatedAt: new Date(), // Isi dengan object Date valid
    };

    // 4. Cek Apakah Sudah Absen Hari Ini?
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    // Drizzle menyimpan tanggal sebagai string 'YYYY-MM-DD' jika tipe kolomnya 'date'

    const existingLog = await db.query.attendance.findFirst({
      where: and(
        eq(attendance.studentId, student.id),
        eq(attendance.date, today),
      ),
    });

    const now = new Date();
    const currentTimeString = now.toLocaleTimeString("id-ID", {
      hour12: false,
    }); // HH:MM:SS

    // --- LOGIC: ABSEN PULANG ---
    if (existingLog) {
      if (existingLog.checkOut) {
        return {
          success: false,
          message: `Sudah absen pulang jam ${existingLog.checkOut.toLocaleTimeString("id-ID")}`,
        };
      }

      // Hapus tanda '!' karena settings sudah pasti terdefinisi (bukan undefined)
      if (currentTimeString < settings.checkOutStart) {
        return { success: false, message: "Belum waktunya pulang!" };
      }

      await db
        .update(attendance)
        .set({ checkOut: now })
        .where(eq(attendance.id, existingLog.id));

      revalidatePath("/dashboard");
      return {
        success: true,
        message: "Hati-hati di jalan!",
        student: {
          name: student.user.name,
          class: student.class?.name || "-",
          photoUrl: student.photoUrl,
          status: "pulang",
          time: currentTimeString,
        },
      };
    }

    // --- LOGIC: ABSEN MASUK ---

    // Hapus tanda '!'
    if (currentTimeString < settings.checkInStart) {
      return { success: false, message: "Absen belum dibuka." };
    }

    // Hapus tanda '!'
    const isLate = currentTimeString > settings.lateThreshold;
    const status = isLate ? "terlambat" : "hadir";

    await db.insert(attendance).values({
      studentId: student.id,
      date: today,
      checkIn: now,
      status: status,
      isLate: isLate,
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: isLate ? "Anda Terlambat!" : "Selamat Pagi!",
      student: {
        name: student.user.name,
        class: student.class?.name || "-",
        photoUrl: student.photoUrl,
        status: status,
        time: currentTimeString,
      },
    };
  } catch (error) {
    console.error("Attendance Error:", error);
    return { success: false, message: "Gagal memproses data. Coba lagi." };
  }
}
