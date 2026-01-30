import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  AcademicCapIcon, // 1. [TAMBAHKAN INI] Icon Topi Toga untuk Siswa
} from "@heroicons/react/24/outline";

export type UserRole = "admin" | "guru" | "siswa" | "staff";

export const MENU_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["admin", "guru", "siswa", "staff"],
  },
  {
    name: "Scan Absensi",
    href: "/dashboard/scanner",
    icon: QrCodeIcon,
    roles: ["admin", "guru", "staff"],
  },
  // --- MENU BARU DIMULAI ---
  {
    name: "Manajemen Siswa", // Nama Menu
    href: "/dashboard/students", // Link ke folder page.tsx kamu
    icon: AcademicCapIcon, // Icon Topi Toga
    roles: ["admin", "guru"], // Admin dan Guru biasanya butuh akses ini
  },
  // --- MENU BARU SELESAI ---
  {
    name: "Manajemen User", // Ini bisa dipakai untuk manage Guru/Staff/Admin
    href: "/dashboard/users",
    icon: UsersIcon,
    roles: ["admin"],
  },
  {
    name: "Manajemen Kelas",
    href: "/dashboard/classes",
    icon: BookOpenIcon,
    roles: ["admin", "guru"],
  },
  {
    name: "Jadwal",
    href: "/dashboard/schedule",
    icon: CalendarIcon,
    roles: ["guru", "siswa"],
  },
  {
    name: "Keuangan SPP",
    href: "/dashboard/finance",
    icon: CurrencyDollarIcon,
    roles: ["admin", "staff"],
  },
];
