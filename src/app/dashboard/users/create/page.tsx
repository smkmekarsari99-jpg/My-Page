import CreateUserForm from "@/src/features/login/_components/create-form"; // Sesuaikan path import
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateUserPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Header dengan tombol kembali */}
        <div className="space-y-6">
          <Link
            href="/dashboard/users"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Kembali ke Daftar User
          </Link>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Tambah User Baru
            </h1>
            <p className="text-gray-500">
              Buat akun baru untuk siswa, guru, atau staff sekolah.
            </p>
          </div>
        </div>

        {/* Render Form Create */}
        <CreateUserForm />
      </div>
    </div>
  );
}
