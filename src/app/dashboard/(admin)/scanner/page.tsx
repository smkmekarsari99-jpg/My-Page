"use client";

import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { processAttendance } from "@/src/features/user-management/actions/attendance";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Tipe State
type ScannerState =
  | {
      type: "success";
      message: string;
      data: { name: string; class: string; status: string; time: string };
    }
  | { type: "error"; message: string; data?: never };

export default function ScannerPage() {
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const [scanResult, setScanResult] = useState<ScannerState | null>(null);

  useGSAP(() => {
    if (scanResult && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
      );
    }
  }, [scanResult]);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    const rawValue = detectedCodes[0]?.rawValue;

    // Prevent double scan
    if (!rawValue || isProcessing || rawValue === lastScanned) return;

    setIsProcessing(true);
    setLastScanned(rawValue);

    // Tips: Jika ingin suara beep, tambahkan kode ini:
    // const audio = new Audio('/sounds/beep.mp3');
    // audio.play().catch(e => console.log("Audio play failed", e));

    toast.loading("Memproses data...", { id: "scan-toast" });

    const response = await processAttendance(rawValue);

    if (response.success && response.student) {
      toast.success(response.message, { id: "scan-toast" });
      setScanResult({
        type: "success",
        data: response.student,
        message: response.message,
      });
    } else {
      toast.error(response.message, { id: "scan-toast" });
      setScanResult({
        type: "error",
        message: response.message,
      });
    }

    setTimeout(() => {
      setIsProcessing(false);
      setLastScanned(null);
    }, 3000);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-4 text-white">
      <div className="pointer-events-none absolute top-0 left-0 h-1/2 w-full bg-gradient-to-b from-blue-900/20 to-transparent" />

      <div className="z-10 grid w-full max-w-4xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
        {/* Kiri: Area Kamera */}
        <div className="flex flex-col gap-4">
          <h1 className="text-center text-2xl font-bold tracking-tight lg:text-left">
            Scanner Absensi
          </h1>
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-white/10 bg-zinc-900 shadow-2xl">
            {/* --- FIX DISINI --- */}
            <Scanner
              onScan={handleScan}
              scanDelay={2000}
              allowMultiple={true}
              components={{ finder: false }} // Hapus audio: false
              styles={{ container: { width: "100%", height: "100%" } }}
            />
            {/* ------------------ */}

            <div className="pointer-events-none absolute inset-0 border-[30px] border-black/50">
              <div className="relative h-full w-full border-2 border-blue-500/50">
                <div className="absolute top-0 left-0 h-8 w-8 animate-pulse rounded-tl-xl border-t-4 border-l-4 border-blue-400" />
                <div className="absolute top-0 right-0 h-8 w-8 animate-pulse rounded-tr-xl border-t-4 border-r-4 border-blue-400" />
                <div className="absolute bottom-0 left-0 h-8 w-8 animate-pulse rounded-bl-xl border-b-4 border-l-4 border-blue-400" />
                <div className="absolute right-0 bottom-0 h-8 w-8 animate-pulse rounded-br-xl border-r-4 border-b-4 border-blue-400" />
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-zinc-500">
            Pastikan QR Code terlihat jelas
          </p>
        </div>

        {/* Kanan: Hasil Scan */}
        <div className="flex h-full min-h-[400px] items-center justify-center">
          {!scanResult ? (
            <div className="space-y-4 text-center text-zinc-600">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                <User className="h-8 w-8 opacity-50" />
              </div>
              <p>Menunggu scan...</p>
            </div>
          ) : (
            <div ref={resultRef} className="w-full">
              <Card
                className={cn(
                  "relative flex flex-col items-center gap-6 overflow-hidden border-0 p-8 text-center shadow-2xl",
                  scanResult.type === "success"
                    ? "bg-green-500/10"
                    : "bg-red-500/10",
                )}
              >
                <div
                  className={cn(
                    "mb-2 flex h-24 w-24 items-center justify-center rounded-full shadow-lg",
                    scanResult.type === "success"
                      ? scanResult.data?.status === "terlambat"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-red-500",
                  )}
                >
                  {scanResult.type === "success" ? (
                    scanResult.data.status === "terlambat" ? (
                      <Clock className="h-12 w-12 text-white" />
                    ) : (
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    )
                  ) : (
                    <XCircle className="h-12 w-12 text-white" />
                  )}
                </div>

                {scanResult.type === "success" ? (
                  <>
                    <div>
                      <h2 className="mb-1 text-3xl font-bold text-white">
                        {scanResult.data.name}
                      </h2>
                      <p className="text-lg text-zinc-400">
                        {scanResult.data.class}
                      </p>
                    </div>
                    <div className="mt-4 grid w-full grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-black/20 p-4">
                        <p className="text-xs tracking-wider text-zinc-400 uppercase">
                          Status
                        </p>
                        <p
                          className={cn(
                            "text-xl font-bold capitalize",
                            scanResult.data.status === "terlambat"
                              ? "text-yellow-400"
                              : "text-green-400",
                          )}
                        >
                          {scanResult.data.status}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-black/20 p-4">
                        <p className="text-xs tracking-wider text-zinc-400 uppercase">
                          Waktu
                        </p>
                        <p className="text-xl font-bold text-white">
                          {scanResult.data.time}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-red-400">
                      Gagal Absen
                    </h2>
                    <p className="mt-2 text-zinc-400">{scanResult.message}</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
