import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
// Pastikan path import ini sesuai dengan lokasi sidebar Anda sekarang
import Sidebar from "@/src/features/dashboard/_components/Sidebar";
import { DashboardHeader } from "@/src/features/dashboard/_components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Gunakan optional chaining dan nullish coalescing untuk keamanan data
  const userRole = session.user.role || "siswa";
  const userName = session.user.name || "User";
  const userEmail = session.user.email || "";

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Sidebar Tetap di Kiri */}
      <aside className="fixed inset-y-0 z-50 hidden w-64 border-r border-gray-200 bg-white md:block dark:border-white/10 dark:bg-black">
        <Sidebar userRole={userRole} />
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 transition-all duration-300 md:ml-64">
        <div className="p-8">
          {/* Panggil Komponen Header dari Features */}
          <DashboardHeader userName={userName} userEmail={userEmail} />

          {/* Render Page Children (Isi Halaman) */}
          {children}
        </div>
      </main>
    </div>
  );
}
