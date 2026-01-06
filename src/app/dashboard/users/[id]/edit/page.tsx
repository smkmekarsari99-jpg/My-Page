import { db } from "@/src/db/index";
import { users } from "@/src/features/login/_db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditUserForm from "@/src/features/login/_components/edit-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Await params (Next.js 16 Standard)
  const { id } = await params;
  const userId = parseInt(id);

  if (isNaN(userId)) return notFound();

  // 2. Fetch data user
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  // 3. Handle 404
  if (!user) {
    notFound();
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Header Section: Back Button + Title */}
        <div className="space-y-6">
          {/* PERBAIKAN 1: Tombol Kembali */}
          {/* - text-gray-400 -> text-gray-500 (supaya lebih jelas) */}
          {/* - hover:text-white -> hover:text-indigo-600 (supaya saat hover warnanya ungu, bukan hilang jadi putih) */}
          <Link
            href="/dashboard/users"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Kembali ke Daftar User
          </Link>

          <div className="space-y-2">
            {/* PERBAIKAN 2: Judul Gradient */}
            {/* Menggunakan warna gradient yang sedikit lebih gelap (600/500) agar kontras di background putih */}
            <h1 className="bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Edit Data User
            </h1>

            {/* PERBAIKAN 3: Deskripsi & Nama User */}
            {/* - text-gray-400 -> text-gray-500 */}
            <p className="text-base text-gray-500">
              Perbarui informasi untuk{" "}
              {/* - text-gray-200 -> text-gray-900 (Ubah nama user jadi Hitam, sebelumnya Putih/Invisible) */}
              <span className="font-semibold text-gray-900">{user.name}</span>{" "}
              di bawah ini.
            </p>
          </div>
        </div>

        {/* Form Component */}
        <EditUserForm user={user} />
      </div>
    </main>
  );
}
