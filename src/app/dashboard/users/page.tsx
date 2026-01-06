import { db } from "@/src/db";
import { users } from "@/src/features/login/_db/schema";
import { desc } from "drizzle-orm";
import UserTable from "@/src/features/user-management/user-table";
import { Metadata } from "next";
import Link from "next/link"; // ✅ 1. Wajib import Link
import { Plus } from "lucide-react"; // ✅ 2. Import Icon Plus biar cantik

export const metadata: Metadata = {
  title: "Manajemen Users | Aplikasi Sekolah",
};

export default async function UsersPage() {
  // Ambil data users dari database, urutkan dari yang terbaru
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Daftar Pengguna
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data akun siswa, guru, dan staff sekolah di sini.
          </p>
        </div>

        {/* ✅ 3. Tombol Tambah User (Sekarang Pakai Link) */}
        <Link
          href="/dashboard/users/create"
          className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-95"
        >
          <Plus
            size={18}
            className="transition-transform group-hover:rotate-90"
          />
          Tambah User
        </Link>
      </div>

      {/* Tampilkan Tabel */}
      <UserTable data={allUsers} />
    </div>
  );
}
