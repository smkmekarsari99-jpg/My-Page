"use client";

import { useActionState, useEffect, useRef } from "react"; // useActionState is React 19 / Next 16 hook
import { authenticate } from "./actions/auth-actions";
import gsap from "gsap";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  // Refs untuk animasi GSAP
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Animasi Background/Container
    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.inOut" },
    );

    // Animasi Judul turun dari atas
    tl.fromTo(
      titleRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.5",
    );

    // Animasi Form muncul
    tl.fromTo(
      formRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.3",
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen items-center justify-center bg-gray-100 p-4"
    >
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2
            ref={titleRef}
            className="text-3xl font-bold tracking-tight text-gray-900"
          >
            Aplikasi Sekolah
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk sebagai Admin, Guru, atau Siswa
          </p>
        </div>

        <form ref={formRef} action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-0 px-3 py-2.5 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6"
                placeholder="Email Address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border-0 px-3 py-2.5 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Ingat saya
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Lupa password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              aria-disabled={isPending}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Memproses..." : "Masuk"}
            </button>
          </div>

          {errorMessage && (
            <div className="mt-2 flex items-center justify-center space-x-2 rounded bg-red-50 p-2 text-sm text-red-500">
              <p>{errorMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
