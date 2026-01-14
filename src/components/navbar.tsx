"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Helper standard shadcn
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, School } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Beranda", href: "/" },
  { name: "Tentang Kami", href: "/tentang" },
  { name: "Unit SMP", href: "/smp" },
  { name: "Unit SMK", href: "/smk" },
  { name: "Berita", href: "/berita" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary/10 rounded-lg p-2">
              <School className="text-primary h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg leading-none font-bold tracking-tight">
                Mekarsari
              </span>
              <span className="text-muted-foreground text-xs font-medium">
                Yayasan Pendidikan
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:text-primary text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
          <Button size="sm" className="font-semibold shadow-sm">
            PPDB Online
          </Button>
        </nav>

        {/* Mobile Navigation (Sheet) */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="mb-4 text-left text-lg font-bold">
                Menu Navigasi
              </SheetTitle>
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "hover:text-primary border-border/50 border-b py-2 text-lg font-medium transition-colors",
                      pathname === item.href
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <Button className="mt-4 w-full" size="lg">
                  Daftar PPDB Sekarang
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
