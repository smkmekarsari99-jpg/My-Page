"use client";

import { Button } from "@/components/ui/button"; // Shadcn Button
import { motion } from "framer-motion"; // Animasi
import { ArrowRight, BookOpen } from "lucide-react"; // Icons
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex h-[90vh] w-full items-center justify-center overflow-hidden">
      {/* 1. Background Image dengan Overlay */}
      {/* Ganti '/images/school-bg.jpg' dengan foto asli sekolah nanti */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        {/* Overlay gelap agar teks terbaca jelas */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40" />
      </div>

      {/* 2. Konten Utama */}
      <div className="relative z-10 container px-4 md:px-6">
        <div className="max-w-3xl space-y-6">
          {/* Animasi Badge Kecil */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-950/50 px-3 py-1 text-sm font-medium text-blue-300 backdrop-blur-sm"
          >
            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            PPDB Tahun Ajaran 2026/2027 Telah Dibuka
          </motion.div>

          {/* Judul Utama */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Mewujudkan Generasi <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Cerdas & Berkarakter
            </span>
          </motion.h1>

          {/* Subjudul */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl"
          >
            Yayasan Pendidikan Mekarsari (SMP & SMK) berkomitmen mencetak
            lulusan yang unggul dalam IPTEK dan kokoh dalam IMTAQ. Siap kerja,
            siap kuliah, siap wirausaha.
          </motion.p>

          {/* Tombol Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col gap-4 pt-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="h-12 bg-blue-600 px-8 text-lg font-semibold text-white hover:bg-blue-700"
              asChild
            >
              <Link href="/ppdb">
                Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-12 border-slate-400 px-8 text-lg font-semibold text-slate-100 hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/profil">
                <BookOpen className="ml-2 h-5 w-5" /> Pelajari Profil
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* 3. Dekorasi Tambahan (Scroll Indicator) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50"
      >
        <span className="text-xs tracking-widest uppercase">
          Scroll ke bawah
        </span>
        <div className="h-12 w-[1px] bg-gradient-to-b from-white/50 to-transparent" />
      </motion.div>
    </section>
  );
}
