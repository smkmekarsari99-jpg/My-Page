"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Edit2, Trash2, GraduationCap } from "lucide-react";
import { deleteClass } from "../../actions/class-actions";
import { toast } from "sonner";
import type { ClassWithDetails } from "@/src/db/schema";
import ClassForm from "./class-form";

interface ClassTableProps {
  data: ClassWithDetails[];
  teachers: { id: string; name: string }[];
}

export default function ClassTable({ data, teachers }: ClassTableProps) {
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
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
      const res = await deleteClass(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    }
  };

  const getBadgeStyle = (major: string) => {
    // Update warna badge agar lebih kontras di background putih
    switch (major) {
      case "RPL":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "TKJ":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "AKL":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "OTKP":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    // UBAH: Container jadi Putih (bg-white) dengan Shadow halus
    <div
      ref={container}
      className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <table className="w-full text-left text-sm">
        {/* Header: Abu muda */}
        <thead className="border-b border-gray-200 bg-gray-50/50 font-medium text-gray-500">
          <tr>
            <th className="w-[60px] px-6 py-4 text-center">#</th>
            <th className="px-6 py-4">Identitas Kelas</th>
            <th className="px-6 py-4">Jurusan</th>
            <th className="px-6 py-4">Wali Kelas</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                Belum ada data kelas.
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              // Hover: abu sangat muda
              <tr
                key={item.id}
                className="group transition-colors hover:bg-gray-50/80"
              >
                <td className="px-6 py-4 text-center text-xs text-gray-400">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      {/* Text hitam */}
                      <div className="font-semibold text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.academicYear} • {item.grade}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${getBadgeStyle(item.major)}`}
                  >
                    {item.major}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-600">
                    {item.homeroomTeacher?.name || "-"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <ClassForm
                      teachers={teachers}
                      initialData={{
                        id: item.id,
                        name: item.name,
                        grade: item.grade,
                        major: item.major,
                        academicYear: item.academicYear,
                        teacherId: item.teacherId || "",
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
