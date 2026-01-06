import LoginForm from "@/src/features/login/_components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Aplikasi Sekolah",
  description: "Halaman masuk untuk akses dashboard sekolah",
};

export default function LoginPage() {
  return (
    <main>
      <LoginForm />
    </main>
  );
}
