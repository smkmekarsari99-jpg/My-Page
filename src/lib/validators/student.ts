import { z } from "zod";

export const studentSchema = z.object({
  id: z.coerce.number().optional(),

  name: z.string().min(3, "Nama lengkap wajib diisi (min 3 karakter)"),
  email: z.string().email("Format email tidak valid"),
  nis: z.string().min(1, "NIS Wajib diisi"),
  nisn: z.string().optional(),

  // === SOLUSI ANTI ERROR ===
  // Kita terima string dulu, lalu validasi isinya manual.
  // Hasil akhirnya tetap tipe "L" | "P"
  gender: z
    .string()
    .min(1, "Pilih jenis kelamin") // Cek tidak boleh kosong
    .refine((val): val is "L" | "P" => val === "L" || val === "P", {
      message: "Pilih jenis kelamin (L/P)",
    }),

  classId: z.coerce.number().min(1, "Wajib memilih kelas"),
  address: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
