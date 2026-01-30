"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudentIDCard } from "./StudentIdCard"; // Reuse komponen siswa tadi
import { QrCode } from "lucide-react";

interface StudentQRViewerProps {
  student: {
    name: string;
    nis: string;
    className?: string; // class.name
    photoUrl?: string;
  };
}

export function StudentQRViewer({ student }: StudentQRViewerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Lihat QR Code">
          <QrCode className="h-4 w-4 text-blue-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kartu Pelajar Digital</DialogTitle>
        </DialogHeader>

        {/* Render Kartu Pelajar di sini */}
        <StudentIDCard student={student} />

        <div className="mt-4 flex w-full gap-2">
          <Button className="w-full" onClick={() => window.print()}>
            Cetak Kartu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
