"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Background Zoom
      tl.fromTo(
        bgRef.current,
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5 },
      )

        // 2. Elements Stagger
        .fromTo(
          ".hero-item",
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
          },
          "-=1.0",
        );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative flex h-[90vh] w-full items-center justify-center overflow-hidden bg-slate-900"
    >
      {/* Background */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-900/30" />
      </div>

      <div className="relative z-10 container px-4 md:px-6">
        <div className="max-w-4xl space-y-6">
          {/* Badge */}
          <div className="hero-item inline-flex items-center rounded-full border border-blue-500/30 bg-blue-950/50 px-4 py-1.5 text-sm font-medium text-blue-300 opacity-0 backdrop-blur-md">
            <span className="relative mr-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            PPDB Tahun Ajaran 2026/2027 Telah Dibuka
          </div>

          {/* Judul Utama */}
          <h1
            ref={titleRef}
            className="hero-item text-4xl leading-tight font-extrabold tracking-tight text-white opacity-0 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Mewujudkan Generasi <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg filter">
              Cerdas & Berkarakter
            </span>
          </h1>

          {/* Subjudul (FIXED: Tag penutup sekarang </p>) */}
          <p className="hero-item max-w-2xl text-lg leading-relaxed text-slate-300 opacity-0 md:text-xl">
            Yayasan Pendidikan Mekarsari (SMP & SMK) mencetak lulusan unggul
            dalam IPTEK dan kokoh dalam IMTAQ. Siap kerja, siap kuliah, siap
            wirausaha.
          </p>

          {/* Tombol Action */}
          <div className="hero-item flex flex-col gap-4 pt-4 opacity-0 sm:flex-row">
            <Button
              size="lg"
              className="h-14 rounded-full bg-blue-600 px-8 text-lg font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105 hover:bg-blue-700"
              asChild
            >
              <Link href="/ppdb">
                Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-slate-600 px-8 text-lg font-semibold text-slate-200 transition-all hover:scale-105 hover:bg-slate-800 hover:text-white"
              asChild
            >
              <Link href="/profil">
                <BookOpen className="ml-2 h-5 w-5" /> Pelajari Profil
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}

function ScrollIndicator() {
  const arrowRef = useRef(null);

  useGSAP(() => {
    gsap.to(arrowRef.current, {
      y: 10,
      opacity: 0.5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  });

  return (
    <div
      ref={arrowRef}
      className="absolute bottom-10 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2 text-slate-400"
    >
      <span className="text-xs font-medium tracking-[0.2em] uppercase">
        Scroll
      </span>
      <div className="h-8 w-[1px] bg-gradient-to-b from-slate-400 to-transparent"></div>
    </div>
  );
}
