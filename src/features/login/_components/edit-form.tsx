"use client";

import { updateUser } from "../actions/users";
import { useActionState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { type InferSelectModel } from "drizzle-orm";
import { users } from "@/src/db/schema"; // Import schema users

type User = InferSelectModel<typeof users>;

export default function EditUserForm({ user }: { user: User }) {
  const initialState = { message: "", errors: {} };
  const [state, dispatch, isPending] = useActionState(updateUser, initialState);

  const formRef = useRef<HTMLFormElement>(null);

  useGSAP(
    () => {
      if (formRef.current) {
        gsap.fromTo(
          ".form-item",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" },
        );
      }
    },
    { scope: formRef },
  );

  return (
    <form
      ref={formRef}
      action={dispatch}
      // PERBAIKAN 1: Container Form
      // - bg-white/5 -> bg-white (supaya solid putih)
      // - border-white/10 -> border-gray-200 (border abu halus)
      // - text-gray-900 (text default gelap)
      className="mx-auto max-w-xl space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl"
    >
      <input type="hidden" name="id" value={user.id} />

      {/* Nama Field */}
      <div className="form-item space-y-2">
        <label
          htmlFor="name"
          // PERBAIKAN 2: Label
          // - text-gray-300 -> text-gray-700 (supaya terbaca di background putih)
          className="block text-sm font-medium text-gray-700"
        >
          Nama Lengkap
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={user.name}
          // PERBAIKAN 3: Input Field
          // - text-white -> text-gray-900 (teks input jadi hitam)
          // - bg-white/5 -> bg-gray-50 (background input abu sangat muda)
          // - border-white/10 -> border-gray-300
          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="form-item space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        {state?.errors?.email && (
          <p className="mt-1 text-sm text-red-500">{state.errors.email}</p>
        )}
      </div>

      {/* Role Field */}
      <div className="form-item space-y-2">
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700"
        >
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue={user.role}
          // Perbaikan Select sama dengan Input
          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="admin">Admin</option>
          <option value="guru">Guru</option>
          <option value="siswa">Siswa</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="form-item pt-4">
        <button
          type="submit"
          disabled={isPending}
          className={`w-full transform cursor-pointer rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 ${
            isPending
              ? "cursor-not-allowed bg-indigo-400 opacity-70"
              : "bg-indigo-600 hover:scale-[1.02] hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-[0.98]"
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Menyimpan...
            </span>
          ) : (
            "Simpan Perubahan"
          )}
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
