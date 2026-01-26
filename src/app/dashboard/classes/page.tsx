import { db } from "@/src/db";
import { classes, users } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import ClassTable from "@/src/features/user-management/components/classes/class-table";
import ClassForm from "@/src/features/user-management/components/classes/class-form";

export const metadata = {
  title: "Manajemen Kelas | Dashboard",
  description: "Kelola data kelas dan wali kelas.",
};

export default async function ClassesPage() {
  const classesData = await db.query.classes.findMany({
    with: {
      homeroomTeacher: {
        columns: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: [desc(classes.id)],
  });

  const teachers = await db.query.users.findMany({
    where: eq(users.role, "guru"),
    columns: { id: true, name: true },
  });

  return (
    // UBAH: bg-slate-950 -> bg-gray-50 (abu sangat muda)
    <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 sm:p-8">
      {/* HEADER: Border bawah abu tipis */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          {/* Text jadi gelap */}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Data Kelas
          </h1>
          <p className="text-sm text-gray-500">
            Atur daftar kelas, jurusan, dan penugasan wali kelas.
          </p>
        </div>

        <ClassForm teachers={teachers} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
          <span>Total {classesData.length} Kelas Terdaftar</span>
        </div>

        <ClassTable data={classesData} teachers={teachers} />
      </section>
    </div>
  );
}
