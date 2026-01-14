// Import Navbar landing page Anda di sini
import { Navbar } from "@/src/components/navbar";
import { Footer } from "@/src/components/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar /> {/* Navbar hanya muncul di grup (landing) */}
      <main>{children}</main>
      <Footer />
    </>
  );
}
