"use client";

import { deleteUser } from "@/src/features/login/actions/users";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Edit, Trash2, UserCog } from "lucide-react";
import Link from "next/link";
import { useRef, useTransition } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "guru" | "siswa" | "staff" | string;
  createdAt: Date | null;
};

export default function UserTable({ data }: { data: User[] }) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  useGSAP(
    () => {
      if (tableRef.current) {
        gsap.fromTo(
          ".user-row",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out",
          },
        );
      }
    },
    { scope: tableRef, dependencies: [data] },
  );

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      startTransition(async () => {
        await deleteUser(id);
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "guru":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "siswa":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    // UBAH: Background putih solid, shadow halus, border abu-abu
    <div
      ref={tableRef}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          {/* UBAH: Header abu-abu terang, teks gelap */}
          <thead className="bg-gray-50 text-xs tracking-wider text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama User</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 text-right font-semibold">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Belum ada data user.
                </td>
              </tr>
            ) : (
              data.map((user) => (
                <tr
                  key={user.id}
                  className="user-row group transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <UserCog size={16} />
                      </div>
                      {/* UBAH: Teks Nama jadi Hitam (gray-900) */}
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/users/${user.id}/edit`}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isPending}
                        className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {isPending ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
