import { getStudents } from "@/src/features/user-management/actions/student-actions";
import { getClasses } from "@/src/features/user-management/actions/class-actions"; // Pastikan path ini benar
import StudentTable from "@/src/features/user-management/components/stundents/student-table";
import StudentForm from "@/src/features/user-management/components/stundents/student-form";
import { Users, Plus } from "lucide-react";

export default async function StudentsPage() {
  // 1. Fetch Data di Server (Parallel Fetching agar cepat)
  const [students, classes] = await Promise.all([getStudents(), getClasses()]);

  // Siapkan data kelas ringkas untuk dropdown form
  const classOptions = classes.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6 p-8">
      {/* Header Page */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="rounded-lg bg-blue-600 p-2 text-white shadow-md shadow-blue-200">
              <Users size={24} />
            </div>
            Manajemen Siswa
          </h1>
          <p className="mt-1 pl-[52px] text-sm text-gray-500">
            Kelola data siswa, akun login, dan plotting kelas.
          </p>
        </div>

        {/* Tombol Tambah (Memicu Modal) */}
        <StudentForm
          classes={classOptions}
          trigger={
            <button className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl active:scale-95">
              <Plus size={18} />
              Tambah Siswa
            </button>
          }
        />
      </div>

      <hr className="border-gray-100" />

      {/* Tabel Data */}
      <StudentTable data={students} classes={classOptions} />
    </div>
  );
}
