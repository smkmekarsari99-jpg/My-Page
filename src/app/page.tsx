// src/app/page.tsx
import { HeroSection } from "@/src/components/hero";
import { StatsSection } from "@/src/components/stats";

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* 1. Hero Section: Bagian paling atas dengan foto & judul */}
      <HeroSection />

      <StatsSection />

      {/* 2. Area Kosong untuk Section Berikutnya */}
      {/* Nanti kita akan isi ini dengan Statistik, Program, Berita, dll */}
      <section className="bg-slate-50 py-24 text-center dark:bg-slate-900/50">
        <div className="container px-4">
          <p className="text-muted-foreground animate-pulse">
            Menyiapkan Section Statistik & Program Keahlian...
          </p>
        </div>
      </section>
    </div>
  );
}
