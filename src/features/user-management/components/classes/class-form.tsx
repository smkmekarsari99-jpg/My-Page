"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createClass,
  updateClass,
  type ActionState,
} from "../../actions/class-actions";
import { toast } from "sonner";
import { Loader2, Plus, Save, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface TeacherOption {
  id: string;
  name: string;
}

interface ClassFormProps {
  teachers: TeacherOption[];
  initialData?: {
    id: number;
    name: string;
    grade: string;
    major: string;
    academicYear: string;
    teacherId: string;
  };
  trigger?: React.ReactNode;
}

const initialState: ActionState = {
  success: false,
  message: "",
};

export default function ClassForm({
  teachers,
  initialData,
  trigger,
}: ClassFormProps) {
  const [open, setOpen] = useState(false);
  const actionFunction = initialData
    ? updateClass.bind(null, initialData.id)
    : createClass;
  const [state, action, isPending] = useActionState(
    actionFunction,
    initialState,
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setTimeout(() => setOpen(false), 0);
      } else if (!state.success && state.message !== "") {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button
            suppressHydrationWarning={true}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] hover:bg-blue-700"
          >
            <Plus size={18} />
            <span>Buat Kelas</span>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />

        {/* UBAH: Background putih (bg-white) & Text gelap */}
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl duration-200">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              {initialData ? "Edit Kelas" : "Data Kelas Baru"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-semibold text-gray-500 uppercase"
              >
                Nama Kelas
              </label>
              {/* INPUT: Background putih, Border abu */}
              <input
                id="name"
                name="name"
                defaultValue={initialData?.name}
                placeholder="Contoh: X RPL 1"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {state.errors?.name && (
                <p className="text-xs text-red-500">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Tingkat
                </label>
                <select
                  name="grade"
                  defaultValue={initialData?.grade || "X"}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Jurusan
                </label>
                <input
                  name="major"
                  defaultValue={initialData?.major}
                  placeholder="RPL"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Wali Kelas
              </label>
              <select
                name="teacherId"
                defaultValue={initialData?.teacherId || ""}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="" disabled>
                  Pilih Guru...
                </option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <input type="hidden" name="academicYear" value="2025/2026" />

            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
                >
                  Batal
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {initialData ? "Simpan Perubahan" : "Simpan Kelas"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
