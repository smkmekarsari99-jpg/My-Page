import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline"; // Pastikan install heroicons: npm i @heroicons/react

export type UserRole = "admin" | "guru" | "siswa";

export const MENU_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["admin", "guru", "siswa"], // Semua bisa lihat
  },
  {
    name: "Manajemen User",
    href: "/dashboard/users",
    icon: UsersIcon,
    roles: ["admin"], // Hanya admin
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
    roles: ["admin"],
  },
];
