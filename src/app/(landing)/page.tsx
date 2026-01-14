// src/app/page.tsx
import { HeroSection } from "@/src/components/hero";
import { StatsSection } from "@/src/components/stats"; // Pastikan file ini ada (dari langkah sebelumnya)
import { ProgramsSection } from "@/src/components/programs"; // <--- Import baru

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Statistik (Jumlah Siswa, dll) */}
      <StatsSection />

      {/* 3. Program Keahlian / Jurusan */}
      <ProgramsSection />

      {/* 4. Berita (Next Step) */}
      <section className="bg-white py-24 text-center dark:bg-slate-950">
        <p className="text-muted-foreground">
          Section Berita Terbaru akan muncul di sini...
        </p>
      </section>
    </div>
  );
}
