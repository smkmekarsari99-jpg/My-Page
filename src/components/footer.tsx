import Link from "next/link";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Desc */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-lg font-bold">YP. Mekarsari</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Membangun generasi cerdas, berkarakter, dan siap kerja dengan
              landasan iman dan taqwa.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold">Tautan Cepat</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/smp" className="hover:text-primary">
                  Profil SMP
                </Link>
              </li>
              <li>
                <Link href="/smk" className="hover:text-primary">
                  Profil SMK
                </Link>
              </li>
              <li>
                <Link href="/guru" className="hover:text-primary">
                  Data Guru
                </Link>
              </li>
              <li>
                <Link href="/ekskul" className="hover:text-primary">
                  Ekstrakurikuler
                </Link>
              </li>
            </ul>
          </div>

          {/* Program SMK (Khusus karena sekolah Vokasi) */}
          <div>
            <h4 className="mb-4 font-semibold">Kompetensi Keahlian</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-primary">
                  Teknik Jaringan Komputer
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Multimedia / DKV
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Akuntansi
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Pemasaran
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="mb-4 font-semibold">Hubungi Kami</h4>
            <ul className="text-muted-foreground space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Jl. Raya Mekarsari No. 123, Kab. Bekasi, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>(021) 890-1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@mekarsari.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground mt-12 border-t pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Yayasan Pendidikan Mekarsari. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
