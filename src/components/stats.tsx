"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Building2, Trophy } from "lucide-react";

// Data Statistik (Nanti bisa diambil dari Database jika mau)
const stats = [
  {
    label: "Siswa Aktif",
    value: "1,250+",
    icon: Users,
    color: "text-blue-500",
  },
  {
    label: "Alumni Sukses",
    value: "5,000+",
    icon: GraduationCap,
    color: "text-emerald-500",
  },
  {
    label: "Guru & Staff",
    value: "120",
    icon: Building2,
    color: "text-orange-500",
  },
  {
    label: "Prestasi Sekolah",
    value: "350+",
    icon: Trophy,
    color: "text-yellow-500",
  },
];

export function StatsSection() {
  return (
    <section className="border-y border-slate-100 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex cursor-default flex-col items-center space-y-2 text-center"
            >
              {/* Icon dengan Background Circle Halus */}
              <div
                className={`rounded-full bg-slate-50 p-4 transition-transform duration-300 group-hover:scale-110 dark:bg-slate-900 ${stat.color}`}
              >
                <stat.icon className="h-8 w-8" />
              </div>

              {/* Angka Besar */}
              <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {stat.value}
              </h3>

              {/* Label */}
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
