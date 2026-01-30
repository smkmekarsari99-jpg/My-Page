import { z } from "zod";

// Schema untuk memparsing data JSON string dari QR Code
export const qrPayloadSchema = z.object({
  nis: z.string().min(1, "NIS tidak valid"),
  // Kita bisa tambah 'secret' token di masa depan untuk keamanan
});

// Schema untuk response feedback ke UI (Type-Safety untuk UI Scanner)
export type ScanResult = {
  success: boolean;
  message: string;
  student?: {
    name: string;
    class: string;
    photoUrl: string | null;
    status: "hadir" | "terlambat" | "pulang";
    time: string;
  };
};
