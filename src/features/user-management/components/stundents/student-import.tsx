"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Loader2, Upload, Download } from "lucide-react"; // Pastikan Download diimport
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  bulkCreateStudents,
  getAllStudentsForExport, // <--- IMPORT ACTION BARU TADI
  type BulkStudentInput,
} from "../../actions/student-actions";

// --- SCHEMA & TYPE ---
const ExcelRowSchema = z.object({
  "Nama Lengkap": z.string().min(1, "Nama wajib diisi"),
  NIS: z.union([z.string(), z.number()]).transform(String),
  NISN: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => String(val || "")),
  Email: z.string().email("Format email salah").optional().or(z.literal("")),
  "L/P": z
    .enum(["L", "P", "l", "p"])
    .transform((val) => val.toUpperCase() as "L" | "P"),
  Kelas: z.string().min(1, "Kelas wajib diisi"),
  Alamat: z.string().optional(),
});

interface StudentImportProps {
  classes: { id: number; name: string }[];
}

export default function StudentImport({ classes }: StudentImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // Loading state khusus export
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. LOGIC DOWNLOAD REAL DATA (EXPORT) ---
  const handleDownloadTemplate = async () => {
    try {
      setIsExporting(true); // Mulai loading
      toast.info("Menyiapkan data Excel...");

      // A. Ambil Data Real dari Database
      const exportData = await getAllStudentsForExport();

      // C. Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Auto-width kolom biar rapi
      const wscols = [
        { wch: 30 }, // Nama
        { wch: 15 }, // NIS
        { wch: 15 }, // NISN
        { wch: 30 }, // Email
        { wch: 5 }, // LP
        { wch: 15 }, // Kelas
        { wch: 30 }, // Alamat
        // -- Kolom Baru --
        { wch: 15 }, // Tanggal
        { wch: 15 }, // Status
        { wch: 12 }, // Masuk
        { wch: 12 }, // Pulang
      ];
      worksheet["!cols"] = wscols;

      const workbook = XLSX.utils.book_new();

      // Judul Sheet disesuaikan
      const sheetTitle =
        exportData.length > 2 ? "Laporan Absensi" : "Template Siswa";
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);

      // Nama File: Data_Siswa_TGL-BLN-THN.xlsx
      const dateStr = new Date()
        .toLocaleDateString("id-ID")
        .replace(/\//g, "-");
      XLSX.writeFile(workbook, `Data_Siswa_${dateStr}.xlsx`);

      toast.success("Data berhasil diunduh!");
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("Gagal mengunduh data.");
    } finally {
      setIsExporting(false); // Stop loading
    }
  };

  // --- 2. LOGIC UPLOAD FILE ---
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Format file harus .xlsx atau .xls");
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet) as unknown[];

        if (rawData.length === 0) {
          toast.warning("File Excel kosong!");
          setIsLoading(false);
          return;
        }

        const validStudents: BulkStudentInput[] = [];
        let errorCount = 0;

        for (const [index, row] of rawData.entries()) {
          const parsed = ExcelRowSchema.safeParse(row);
          if (!parsed.success) {
            // Log error tapi jangan stop proses, lanjut ke baris berikutnya
            errorCount++;
            continue;
          }

          const data = parsed.data;

          // Skip data "Contoh" jika user mengupload balik file Template Dummy
          if (data["Nama Lengkap"].toLowerCase().includes("contoh:")) {
            continue;
          }

          const normalizedExcelClass = data["Kelas"].trim().toLowerCase();
          const foundClass = classes.find(
            (c) => c.name.toLowerCase().trim() === normalizedExcelClass,
          );

          if (!foundClass) {
            errorCount++;
            continue;
          }

          validStudents.push({
            name: data["Nama Lengkap"],
            email: data["Email"] || `${data["NIS"]}@sekolah.sch.id`,
            nis: data["NIS"],
            nisn: data["NISN"],
            gender: data["L/P"],
            classId: foundClass.id,
            address: data["Alamat"] || "",
          });
        }

        if (validStudents.length === 0) {
          toast.error("Data tidak valid atau kosong.", {
            description: "Pastikan format sesuai template.",
          });
          setIsLoading(false);
          return;
        }

        const result = await bulkCreateStudents(validStudents);

        if (result.success) {
          toast.success("Import Berhasil", {
            description: `Masuk: ${result.count} | Skip/Error: ${result.skipped || 0 + errorCount}`,
          });
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          toast.error("Import Gagal", { description: result.message });
        }
      } catch (error) {
        console.error(error);
        toast.error("Error memproses file.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- RENDER ---
  const isBusy = isLoading || isExporting;

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* TOMBOL 1: DOWNLOAD (EXPORT) */}
      <button
        onClick={handleDownloadTemplate}
        disabled={isBusy}
        title="Download Data / Template"
        className={cn(
          "group flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95",
          isExporting && "cursor-wait opacity-70",
        )}
      >
        {isExporting ? (
          <Loader2 size={18} className="animate-spin text-blue-600" />
        ) : (
          <Download
            size={18}
            className="transition-transform group-hover:-translate-y-0.5"
          />
        )}
      </button>

      {/* TOMBOL 2: IMPORT */}
      <button
        onClick={handleTriggerUpload}
        disabled={isBusy}
        className={cn(
          "flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-100 active:scale-95",
          isBusy && "cursor-not-allowed opacity-70",
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span>{isLoading ? "Proses..." : "Import Excel"}</span>
      </button>
    </div>
  );
}
