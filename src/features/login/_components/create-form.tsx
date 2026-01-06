"use client";

import { createUser } from "../actions/users"; // Import action create
import { useActionState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function CreateUserForm() {
  const initialState = { message: "", errors: {} };
  // Menggunakan createUser, bukan updateUser
  const [state, dispatch, isPending] = useActionState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useGSAP(
    () => {
      if (formRef.current) {
        gsap.fromTo(
          ".form-item",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        );
      }
    },
    { scope: formRef },
  );

  return (
    <form
      ref={formRef}
      action={dispatch}
      className="mx-auto max-w-xl space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg"
    >
      {/* NAMA */}
      <div className="form-item space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nama Lengkap
        </label>
        <input
          name="name"
          type="text"
          placeholder="Contoh: Budi Santoso"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        {state?.errors?.name && (
          <p className="text-sm text-red-500">{state.errors.name}</p>
        )}
      </div>

      {/* EMAIL */}
      <div className="form-item space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          name="email"
          type="email"
          placeholder="budi@sekolah.com"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        {state?.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email}</p>
        )}
      </div>

      {/* PASSWORD (Wajib untuk Create) */}
      <div className="form-item space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          name="password"
          type="password"
          placeholder="Minimal 6 karakter"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        {state?.errors?.password && (
          <p className="text-sm text-red-500">{state.errors.password}</p>
        )}
      </div>

      {/* ROLE */}
      <div className="form-item space-y-2">
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select
          name="role"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="siswa">Siswa</option>
          <option value="guru">Guru</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* BUTTON */}
      <div className="form-item pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 disabled:opacity-70"
        >
          {isPending ? "Menyimpan..." : "Tambah User Baru"}
        </button>
        {state?.message && (
          <p className="mt-4 text-center text-sm text-red-500">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
