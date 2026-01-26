// C:\Users\USER\Documents\Landing Page Meksa\landing-page\src\features\dashboard\_components\Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS, UserRole } from "../config/dashboard-menu";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();

  // Filter menu berdasarkan role user yang sedang login
  const filteredMenu = MENU_ITEMS.filter((item) =>
    item.roles.includes(userRole as UserRole),
  );

  const handleLogout = async () => {
    // signOut client-side ini aman dari intercept middleware
    // karena dia melakukan full navigation, bukan fetch background.
    await signOut({
      redirect: true,
      callbackUrl: "/login",
    });
  };

  return (
    <div className="flex h-screen w-64 flex-col justify-between border-r bg-white px-4 py-6 shadow-sm">
      {/* 1. Logo / Header Sidebar */}
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-blue-600">Sekolah App</h1>
        <p className="mt-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
          Panel {userRole}
        </p>
      </div>

      {/* 2. Menu Navigasi */}
      <nav className="flex-1 space-y-1">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* 3. Tombol Logout */}
      <div className="border-t border-gray-200 p-4 dark:border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 ..."
        >
          <LogOut className="h-5 w-5" />
          {/* Icon Logout */}
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
