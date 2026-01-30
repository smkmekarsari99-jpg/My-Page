// C:\Users\USER\Documents\Landing Page Meksa\landing-page\src\features\user-management\components\stundents\student-table.tsx

"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { Edit2, Trash2, AlertCircle, Loader2 } from "lucide-react";
import {
  deleteStudent,
  updateAttendanceStatus,
} from "../../actions/student-actions";
import { toast } from "sonner";
import StudentForm from "./student-form";
import { StudentQRViewer } from "./student-qr-viewer";
import { cn } from "@/lib/utils";

// --- TYPES ---
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpha" | "terlambat";

type StudentRowData = {
  id: number;
  fullName: string | null;
  nis: string;
  photoUrl: string | null;
  className: string | null;
  // Data untuk Edit
  email: string | null;
  nisn: string | null;
  gender: string | null;
  address: string | null;
  classId: number | null;
  // Data Absensi
  attendanceId: number | null;
  checkIn: Date | null;
  checkOut: Date | null;
  status: AttendanceStatus | null;
  attendanceDate?: string | null;
};

interface StudentTableProps {
  data: StudentRowData[];
  classes: { id: number; name: string }[];
}

// --- HELPER FORMAT JAM ---
const formatTimeOnly = (date: Date | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// --- KOMPONEN BARU: QUICK STATUS SELECTOR ---
// Ini adalah tombol S, H, A, T, I yang kamu minta
const QuickStatusSelector = ({
  studentId,
  currentStatus,
  date,
}: {
  studentId: number;
  currentStatus: AttendanceStatus | null;
  date: string;
}) => {
  const [loading, setLoading] = useState<AttendanceStatus | null>(null);
  // Optimistic UI: Update tampilan segera sebelum server merespon agar terasa cepat
  const [optimisticStatus, setOptimisticStatus] =
    useState<AttendanceStatus | null>(currentStatus);

  // Update state jika props berubah (misal pindah tanggal)
  useEffect(() => {
    setOptimisticStatus(currentStatus);
  }, [currentStatus]);

  const handleUpdate = async (newStatus: AttendanceStatus) => {
    // Jika status sudah sama, jangan lakukan apa-apa (hemat request)
    if (optimisticStatus === newStatus) return;

    setLoading(newStatus); // Tampilkan loading di tombol yang diklik
    setOptimisticStatus(newStatus); // Ubah warna tombol segera (biar user seneng)

    try {
      const res = await updateAttendanceStatus(studentId, date, newStatus);
      if (!res.success) {
        // Kembalikan status jika gagal
        toast.error("Gagal update status");
        setOptimisticStatus(currentStatus);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
      setOptimisticStatus(currentStatus);
    } finally {
      setLoading(null);
    }
  };

  // Konfigurasi Tombol Inisial
  const options: {
    label: string;
    value: AttendanceStatus;
    colorClass: string;
  }[] = [
    {
      label: "H",
      value: "hadir",
      colorClass:
        "hover:bg-emerald-100 hover:text-emerald-700 text-emerald-600 border-emerald-200",
    },
    {
      label: "T",
      value: "terlambat",
      colorClass:
        "hover:bg-amber-100 hover:text-amber-700 text-amber-600 border-amber-200",
    },
    {
      label: "S",
      value: "sakit",
      colorClass:
        "hover:bg-rose-100 hover:text-rose-700 text-rose-600 border-rose-200",
    },
    {
      label: "I",
      value: "izin",
      colorClass:
        "hover:bg-blue-100 hover:text-blue-700 text-blue-600 border-blue-200",
    },
    {
      label: "A",
      value: "alpha",
      colorClass:
        "hover:bg-zinc-100 hover:text-zinc-700 text-zinc-500 border-zinc-200",
    },
  ];

  return (
    <div className="flex items-center justify-center gap-1">
      {options.map((opt) => {
        const isActive = optimisticStatus === opt.value;
        const isLoadingThis = loading === opt.value;

        return (
          <button
            key={opt.value}
            onClick={() => handleUpdate(opt.value)}
            disabled={!!loading}
            title={opt.value.toUpperCase()} // Tooltip saat hover (Hadir, Sakit, dll)
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md border text-xs font-bold transition-all",
              // Style default (Outline)
              opt.colorClass,
              "bg-white",
              // Style jika AKTIF (Solid Color)
              isActive &&
                opt.value === "hadir" &&
                "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white",
              isActive &&
                opt.value === "terlambat" &&
                "border-amber-500 bg-amber-500 text-white hover:bg-amber-600 hover:text-white",
              isActive &&
                opt.value === "sakit" &&
                "border-rose-500 bg-rose-500 text-white hover:bg-rose-600 hover:text-white",
              isActive &&
                opt.value === "izin" &&
                "border-blue-500 bg-blue-500 text-white hover:bg-blue-600 hover:text-white",
              isActive &&
                opt.value === "alpha" &&
                "border-zinc-500 bg-zinc-500 text-white hover:bg-zinc-600 hover:text-white",
              // Style saat disabled
              loading && !isLoadingThis && "cursor-not-allowed opacity-30",
            )}
          >
            {isLoadingThis ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              opt.label
            )}
          </button>
        );
      })}
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function StudentTable({ data, classes }: StudentTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const currentHour = new Date().getHours();
  const isLateAfternoon = currentHour >= 16;

  // GSAP Animation
  useEffect(() => {
    if (containerRef.current) {
      const rows = containerRef.current.querySelectorAll("tbody tr");
      gsap.fromTo(
        rows,
        { opacity: 0, y: 15, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.4,
          stagger: 0.04,
          ease: "power2.out",
        },
      );
    }
  }, [data]);

  const handleDelete = async (id: number) => {
    if (
      confirm("Yakin ingin menghapus siswa ini? Akun login juga akan terhapus.")
    ) {
      const res = await deleteStudent(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50/50 font-medium text-gray-500">
            <tr>
              <th className="w-[50px] px-6 py-4 text-center">#</th>
              <th className="px-6 py-4">Siswa</th>
              <th className="px-6 py-4">NIS</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4 text-center">Masuk</th>
              <th className="px-6 py-4 text-center">Pulang</th>
              {/* Kolom Status sekarang jadi Quick Action */}
              <th className="px-6 py-4 text-center">Status (H/T/S/I/A)</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  Tidak ada data siswa ditemukan.
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const avatarUrl =
                  item.photoUrl ??
                  `https://ui-avatars.com/api/?name=${item.fullName}&background=random`;

                const isCheckedIn = !!item.checkIn;
                const isNotCheckedOut = !item.checkOut;
                const showCheckoutWarning =
                  isCheckedIn && isNotCheckedOut && isLateAfternoon;

                // Tanggal untuk update status (Default hari ini jika null)
                const rowDate =
                  item.attendanceDate || new Date().toLocaleDateString("en-CA");

                return (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-6 py-4 text-center text-xs text-gray-400">
                      {index + 1}
                    </td>

                    {/* Kolom Siswa */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200">
                          <img
                            src={avatarUrl}
                            alt={item.fullName || "Siswa"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.fullName}
                          </div>
                          {item.email && (
                            <div className="text-xs text-gray-500">
                              {item.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-gray-600">
                      {item.nis}
                    </td>

                    <td className="px-6 py-4">
                      {item.className ? (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                          {item.className}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center font-mono">
                      {item.checkIn ? (
                        <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-600">
                          {formatTimeOnly(item.checkIn)}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center font-mono">
                      {item.checkOut ? (
                        <span className="rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-600">
                          {formatTimeOnly(item.checkOut)}
                        </span>
                      ) : showCheckoutWarning ? (
                        <div
                          className="flex animate-pulse items-center justify-center gap-1 text-amber-600"
                          title="Siswa belum tap kartu pulang!"
                        >
                          <AlertCircle size={16} />
                          <span className="text-xs font-bold">Lupa?</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>

                    {/* KOLOM STATUS BARU (QUICK SELECTOR) */}
                    <td className="px-6 py-4">
                      <QuickStatusSelector
                        studentId={item.id}
                        currentStatus={item.status}
                        date={rowDate}
                      />
                    </td>

                    {/* Kolom Aksi (Lebih Ringkas) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <StudentQRViewer
                          student={{
                            name: item.fullName || "",
                            nis: item.nis,
                            className: item.className || "",
                            photoUrl: avatarUrl,
                          }}
                        />

                        <StudentForm
                          classes={classes}
                          initialData={{
                            id: item.id,
                            name: item.fullName || "",
                            email: item.email || "",
                            nis: item.nis,
                            nisn: item.nisn || "",
                            gender: (item.gender as "L" | "P") || "L",
                            classId: item.classId ?? 0,
                            address: item.address || "",
                          }}
                          trigger={
                            <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
                              <Edit2 size={16} />
                            </button>
                          }
                        />

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
