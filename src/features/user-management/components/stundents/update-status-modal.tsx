"use client";

import { useState } from "react";
import { updateAttendanceStatus } from "../../actions/student-actions";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

// 1. [FIX] Definisikan tipe status secara eksplisit
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpha" | "terlambat";

interface UpdateStatusModalProps {
  studentId: number;
  studentName: string;
  currentStatus: string | null;
  date: string;
  onClose: () => void;
}

export default function UpdateStatusModal({
  studentId,
  studentName,
  currentStatus,
  date,
  onClose,
}: UpdateStatusModalProps) {
  const [loading, setLoading] = useState(false);

  // 2. [FIX] Gunakan Generics pada useState
  // Kita memberitahu React bahwa state ini HANYA boleh berisi AttendanceStatus
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(
    // Kita melakukan casting aman di sini. Jika currentStatus null/tidak valid, default ke "alpha"
    (isValidStatus(currentStatus)
      ? currentStatus
      : "alpha") as AttendanceStatus,
  );

  const handleSave = async () => {
    setLoading(true);

    // 3. [FIX] Panggil Server Action TANPA 'as any'
    // TypeScript sekarang tahu bahwa 'selectedStatus' tipe datanya sudah pasti benar
    const result = await updateAttendanceStatus(
      studentId,
      date,
      selectedStatus,
    );

    setLoading(false);
    if (result.success) {
      alert("Berhasil! " + result.message);
      onClose();
    } else {
      alert("Gagal: " + result.message);
    }
  };

  // Helper kecil untuk memastikan status dari props valid (Opsional tapi bagus)
  function isValidStatus(status: string | null): boolean {
    const valid = ["hadir", "sakit", "izin", "alpha", "terlambat"];
    return status !== null && valid.includes(status);
  }

  // Daftar status untuk looping tombol
  const statusOptions: AttendanceStatus[] = [
    "hadir",
    "terlambat",
    "sakit",
    "izin",
    "alpha",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl duration-200">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Update Status Absensi
          </h3>
          <p className="text-sm text-gray-500">
            Siswa:{" "}
            <span className="font-semibold text-blue-600">{studentName}</span>
          </p>
          <p className="text-sm text-gray-500">Tanggal: {date}</p>
        </div>

        {/* Pilihan Status */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Pilih Status Baru:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((stat) => (
              <button
                key={stat}
                onClick={() => setSelectedStatus(stat)}
                className={`flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  selectedStatus === stat
                    ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-offset-1"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {stat.charAt(0).toUpperCase() + stat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
