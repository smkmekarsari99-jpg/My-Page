"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Edit2, Trash2, User } from "lucide-react";
import { deleteStudent } from "../../actions/student-actions";
import { toast } from "sonner";
import type { StudentWithDetails } from "@/src/db/schema";
import StudentForm from "./student-form";

interface StudentTableProps {
  data: StudentWithDetails[];
  classes: { id: number; name: string }[];
}

export default function StudentTable({ data, classes }: StudentTableProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      gsap.fromTo(
        container.current.querySelectorAll("tr"),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" },
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
      ref={container}
      className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50/50 font-medium text-gray-500">
          <tr>
            <th className="w-[60px] px-6 py-4 text-center">#</th>
            <th className="px-6 py-4">Siswa</th>
            <th className="px-6 py-4">Identitas (NIS/NISN)</th>
            <th className="px-6 py-4">Kelas</th>
            <th className="px-6 py-4">Gender</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                Belum ada data siswa.
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              // FIX 1: Definisikan URL gambar di luar JSX agar rapi dan aman dari null
              const avatarUrl =
                item.photoUrl ??
                item.user.image ??
                `https://ui-avatars.com/api/?name=${item.user.name}&background=random`;

              return (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-gray-50/80"
                >
                  <td className="px-6 py-4 text-center text-xs text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200">
                        {/* FIX 1: Gunakan variabel avatarUrl yang sudah aman */}
                        <img
                          src={avatarUrl}
                          alt={item.user.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">
                        {item.nis}
                      </span>
                      {item.nisn && (
                        <span className="text-xs text-gray-400">
                          {item.nisn}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.class ? (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                        {item.class.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.gender === "L"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-pink-50 text-pink-700"
                      }`}
                    >
                      {item.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <StudentForm
                        classes={classes}
                        initialData={{
                          id: item.id,
                          name: item.user.name,
                          email: item.user.email,
                          nis: item.nis,
                          nisn: item.nisn || "", // Handle null NISN
                          gender: item.gender as "L" | "P",

                          // FIX 2: Gunakan '?? 0' (Nullish Coalescing)
                          // Jika classId null, ganti jadi 0 (biar tidak error tipe data)
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
  );
}
