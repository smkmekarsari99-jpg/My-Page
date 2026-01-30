"use client";

import QRCode from "react-qr-code";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// 1. Definisikan bentuk data Student
interface StudentData {
  nis: string;
  name: string;
  className?: string; // Nama Kelas (Misal: X RPL 1)
  photoUrl?: string | null;
}

// 2. Bungkus dalam prop 'student' agar sesuai dengan panggilan <StudentIDCard student={...} />
interface StudentIDCardProps {
  student: StudentData;
}

export function StudentIDCard({ student }: StudentIDCardProps) {
  // Destructuring agar mudah dipanggil di bawah
  const { nis, name, className, photoUrl } = student;

  // Payload JSON untuk QR Code
  const qrPayload = JSON.stringify({ nis: nis });

  return (
    <div className="perspective-1000 mx-auto w-full max-w-sm">
      <Card className="relative overflow-hidden border-zinc-200 bg-white shadow-xl transition-transform duration-500 hover:scale-[1.02] dark:border-zinc-800 dark:bg-zinc-950 print:border-black print:shadow-none">
        {/* Dekorasi Header */}
        <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-600 print:bg-gray-300 print:from-gray-300 print:to-gray-300">
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-white p-1 dark:bg-zinc-950">
            <Avatar className="h-20 w-20 border-2 border-white dark:border-zinc-900">
              <AvatarImage
                src={photoUrl || ""}
                alt={name}
                className="object-cover"
              />
              <AvatarFallback className="bg-zinc-100 text-xl font-bold text-zinc-500">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="flex flex-col items-center space-y-4 pt-12 pb-8 text-center">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {name}
            </h3>

            {/* Tampilkan Kelas & NIS */}
            <div className="mt-2 flex items-center justify-center gap-2">
              {className && (
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-700"
                >
                  {className}
                </Badge>
              )}
              <Badge variant="secondary" className="font-mono tracking-wider">
                {nis}
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-inner dark:border-zinc-800 dark:bg-zinc-900 print:border-black">
            <QRCode
              value={qrPayload}
              size={140}
              className="h-auto w-full max-w-[140px]"
              viewBox={`0 0 256 256`}
            />
          </div>

          <p className="text-xs text-zinc-400 print:hidden">
            Scan QR ini di pos keamanan untuk absensi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
