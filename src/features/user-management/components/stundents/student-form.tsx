"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import { createPortal } from "react-dom";
import { saveStudent } from "../../actions/student-actions";
import { toast } from "sonner";
import { X, Loader2, Save, Camera } from "lucide-react";

interface StudentFormProps {
  classes: { id: number; name: string }[];
  trigger: React.ReactNode;
  initialData?: {
    id?: number;
    name: string;
    email: string;
    nis: string;
    nisn?: string;
    gender: "L" | "P";
    classId: number;
    address?: string;
    photoUrl?: string | null; // Tambahkan tipe ini biar aman
  };
}

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export default function StudentForm({
  classes,
  trigger,
  initialData,
  ...props
}: StudentFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  // State Action React 19
  const [state, formAction, isPending] = useActionState(
    saveStudent,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      const timer = setTimeout(() => setIsOpen(false), 0);
      return () => clearTimeout(timer);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  // Ref untuk input file hidden
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk preview gambar
  const [preview, setPreview] = useState<string | null>(
    initialData?.photoUrl || null,
  );

  // Fungsi saat user memilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Buat URL sementara untuk preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  // ==========================================
  // BAGIAN UI MODAL
  // ==========================================
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {initialData ? "Edit Data Siswa" : "Tambah Siswa Baru"}
            </h3>
            <p className="text-xs text-gray-500">
              Lengkapi biodata akademik siswa di bawah ini.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form action={formAction} className="p-6">
          {initialData?.id && (
            <input type="hidden" name="id" value={initialData.id} />
          )}

          {/* === BAGIAN UPLOAD FOTO (YANG TADI HILANG) === */}
          <div className="mb-6 flex flex-col items-center justify-center gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-500"
            >
              {/* Tampilkan Preview atau Placeholder */}
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                  <Camera size={24} />
                  <span className="text-[10px]">Upload</span>
                </div>
              )}

              {/* Overlay saat hover */}
              <div className="absolute inset-0 hidden items-center justify-center bg-black/30 text-white group-hover:flex">
                <Camera size={20} />
              </div>
            </div>

            {/* Input File (Disembunyikan) */}
            <input
              type="file"
              name="photo" // Wajib ada name="photo" agar terbaca di Server Action
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />
            <p className="text-xs text-gray-500">
              Klik lingkaran untuk upload foto
            </p>
          </div>
          {/* === END UPLOAD FOTO === */}

          <div className="grid gap-5 md:grid-cols-2">
            {/* Nama Lengkap */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                defaultValue={initialData?.name}
                placeholder="Contoh: Ahmad Dahlan"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              {state.errors?.name && (
                <p className="mt-1 text-xs text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Email (Untuk Login)
              </label>
              <input
                type="email"
                name="email"
                defaultValue={initialData?.email}
                placeholder="siswa@sekolah.sch.id"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              {state.errors?.email && (
                <p className="mt-1 text-xs text-red-500">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* NIS */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                NIS (Nomor Induk)
              </label>
              <input
                type="text"
                name="nis"
                defaultValue={initialData?.nis}
                placeholder="Ex: 21221005"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              {state.errors?.nis && (
                <p className="mt-1 text-xs text-red-500">
                  {state.errors.nis[0]}
                </p>
              )}
            </div>

            {/* NISN */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                NISN (Opsional)
              </label>
              <input
                type="text"
                name="nisn"
                defaultValue={initialData?.nisn}
                placeholder="Ex: 0051234567"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Jenis Kelamin
              </label>
              <select
                name="gender"
                defaultValue={initialData?.gender}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Pilih --</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              {state.errors?.gender && (
                <p className="mt-1 text-xs text-red-500">
                  {state.errors.gender[0]}
                </p>
              )}
            </div>

            {/* Kelas */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Kelas
              </label>
              <select
                name="classId"
                defaultValue={initialData?.classId}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {state.errors?.classId && (
                <p className="mt-1 text-xs text-red-500">
                  {state.errors.classId[0]}
                </p>
              )}
            </div>

            {/* Alamat */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Alamat Lengkap (Opsional)
              </label>
              <textarea
                name="address"
                defaultValue={initialData?.address}
                rows={2}
                placeholder="Jl. Mawar No. 12..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} /> Simpan Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
