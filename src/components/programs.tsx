"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code,
  PenTool,
  Cpu,
  Globe,
  Calculator,
  Wrench,
} from "lucide-react";
import Image from "next/image";

// Data Dummy (Nanti bisa diganti dengan data dari Database Drizzle)
const programs = {
  smp: [
    {
      title: "Tahfidz Al-Qur'an",
      desc: "Program unggulan menghafal Al-Qur'an dengan metode mutqin.",
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Science Club",
      desc: "Pengembangan minat bakat di bidang sains dan penelitian remaja.",
      icon: Globe,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Robotic Kidz",
      desc: "Ekstrakurikuler robotika untuk melatih logika pemrograman dasar.",
      icon: Cpu,
      color: "bg-orange-100 text-orange-600",
    },
  ],
  smk: [
    {
      title: "Teknik Komputer & Jaringan",
      desc: "Mencetak teknisi handal dalam infrastruktur jaringan dan server.",
      icon: Globe,
      color: "bg-blue-100 text-blue-600",
      image:
        "https://images.unsplash.com/photo-1558494949-ef526b0042a0?w=800&q=80", // Contoh gambar
    },
    {
      title: "Desain Komunikasi Visual",
      desc: "Keahlian desain grafis, fotografi, videografi, dan branding.",
      icon: PenTool,
      color: "bg-purple-100 text-purple-600",
      image:
        "https://images.unsplash.com/photo-1626785774573-4b799312c95d?w=800&q=80",
    },
    {
      title: "Rekayasa Perangkat Lunak",
      desc: "Pengembangan aplikasi web, mobile (Android/iOS) dan game dev.",
      icon: Code,
      color: "bg-indigo-100 text-indigo-600",
      image:
        "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800&q=80",
    },
    {
      title: "Teknik Bisnis Sepeda Motor",
      desc: "Mekanik handal standar industri otomotif roda dua.",
      icon: Wrench,
      color: "bg-red-100 text-red-600",
      image:
        "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
    },
  ],
};

export function ProgramsSection() {
  return (
    <section className="bg-slate-50 py-20 dark:bg-slate-900/50" id="program">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-primary/30 text-primary bg-primary/5 mb-4 px-4 py-1"
          >
            Program Pendidikan
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Jenjang Pendidikan & Keahlian
          </h2>
          <p className="text-muted-foreground text-lg">
            Kami menyediakan layanan pendidikan terpadu mulai dari jenjang
            menengah pertama (SMP) hingga kejuruan (SMK).
          </p>
        </div>

        {/* Tabs System */}
        <Tabs defaultValue="smk" className="mx-auto w-full max-w-5xl">
          <div className="mb-8 flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-200/50 p-1 dark:bg-slate-800">
              <TabsTrigger
                value="smp"
                className="py-2 text-base data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Unit SMP
              </TabsTrigger>
              <TabsTrigger
                value="smk"
                className="py-2 text-base data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Unit SMK
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Konten SMP */}
          <TabsContent value="smp" className="mt-0">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {programs.smp.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full border-slate-200 transition-shadow hover:shadow-lg dark:border-slate-800">
                    <CardHeader>
                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${item.color}`}
                      >
                        <item.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {item.desc}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {/* CTA SMP */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                Masih banyak ekstrakurikuler lainnya seperti Pramuka, Paskibra,
                Futsal, dll.
              </p>
            </div>
          </TabsContent>

          {/* Konten SMK */}
          <TabsContent value="smk" className="mt-0">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {programs.smk.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="hover:border-primary/50 h-full overflow-hidden border-slate-200 transition-colors dark:border-slate-800">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div
                        className={`absolute bottom-4 left-4 rounded-lg bg-white/90 p-2 backdrop-blur-sm`}
                      >
                        <item.icon className="h-5 w-5 text-slate-900" />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary text-xl transition-colors">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {item.desc}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
