// C:\Users\USER\Documents\Landing Page Meksa\landing-page\src\app\dashboard\page.tsx

import { auth } from "@/src/auth";
import { DashboardOverview } from "@/src/features/dashboard/_components/Overview";

export default async function DashboardPage() {
  const session = await auth();
  const userRole = session?.user?.role || "siswa";

  return (
    // Panggil Logic Tampilan dari Features
    <DashboardOverview userRole={userRole} />
  );
}
