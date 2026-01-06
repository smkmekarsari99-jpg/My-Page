"use server";

import { signIn, signOut } from "@/src/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // TAMBAHKAN opsi { redirectTo: '/dashboard' }
    // Supaya setelah login sukses, user dipaksa masuk ke dashboard
    await signIn("credentials", formData, { redirectTo: "/dashboard" });
  } catch (error) {
    // Jika error adalah error redirect (tanda sukses login),
    // biarkan dia lolos (throw ulang) agar Next.js bisa memproses redirect.
    // Pengecekan ini agak tricky, jadi cara paling aman:

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email atau password salah.";
        default:
          return "Terjadi kesalahan sistem.";
      }
    }

    // PENTING: Lempar ulang error agar redirect bekerja!
    throw error;
  }
}

// ✅ INI BENAR
export async function handleSignOut() {
  // Biarkan signOut berjalan 'telanjang' tanpa try-catch
  // Karena dia perlu melempar error untuk redirect
  await signOut({ redirectTo: "/login" });
}
