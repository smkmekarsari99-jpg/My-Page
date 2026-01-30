import { getStudents } from "@/src/features/user-management/actions/student-actions";
import { getClasses } from "@/src/features/user-management/actions/class-actions";
import StudentTable from "@/src/features/user-management/components/stundents/student-table";
import StudentForm from "@/src/features/user-management/components/stundents/student-form";
// 1. IMPORT KOMPONEN IMPORT EXCEL
import StudentImport from "@/src/features/user-management/components/stundents/student-import";
import StudentFilters from "@/src/features/user-management/components/stundents/student-filters";
import { Users, Plus } from "lucide-react";

// [KHUSUS NEXT.js 15/16 & React 19]
// Tipe searchParams sekarang adalah Promise
type SearchParams = Promise<{
  date?: string;
  classId?: string;
  search?: string;
  status?: string;
}>;

// Props harus menerima SearchParams sebagai Promise
export default async function StudentsPage(props: {
  searchParams: SearchParams;
}) {
  // [FIX UTAMA] Await searchParams sebelum digunakan
  const searchParams = await props.searchParams;

  // 1. Ambil value dari searchParams yang sudah di-await
  const filters = {
    date: searchParams.date,
    classId: searchParams.classId,
    search: searchParams.search,
    status: searchParams.status,
  };

  // 2. Fetch Data dengan Filter
  const [studentsRes, classes] = await Promise.all([
    getStudents(filters),
    getClasses(),
  ]);

  // Validasi data
  const validStudents = studentsRes.success ? studentsRes.data : [];

  // Format Tanggal untuk Judul
  const displayDate = studentsRes.selectedDate
    ? new Date(studentsRes.selectedDate).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Hari Ini";

  // Siapkan data kelas untuk dropdown
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
            Data Absensi:{" "}
            <span className="font-semibold text-blue-600">{displayDate}</span>
          </p>
        </div>

        {/* --- AREA TOMBOL AKSI --- */}
        <div className="flex items-center gap-3">
          {/* 1. Tombol Import Excel (Baru) */}
          <StudentImport classes={classOptions} />

          {/* 2. Tombol Tambah Manual (Lama) */}
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
      </div>

      <hr className="border-gray-100" />

      {/* Filter & Search */}
      <StudentFilters classes={classOptions} />

      {/* Tabel Data */}
      <StudentTable data={validStudents} classes={classOptions} />
    </div>
  );
}
