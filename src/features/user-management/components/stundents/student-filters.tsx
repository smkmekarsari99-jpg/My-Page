"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search, Calendar, Filter } from "lucide-react"; // Import icon Filter

interface StudentFiltersProps {
  classes: { id: number; name: string }[];
}

export default function StudentFilters({ classes }: StudentFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("search", term);
    else params.delete("search");
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      {/* KIRI: Search */}
      <div className="relative w-full md:w-1/3">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get("search")?.toString()}
          placeholder="Cari nama atau NIS..."
          className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* KANAN: Filters */}
      <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
        {/* Filter Tanggal */}
        <div className="relative">
          <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="date"
            className="rounded-lg border border-gray-200 py-2 pr-3 pl-10 text-sm outline-none focus:border-blue-500"
            defaultValue={searchParams.get("date") || ""}
            onChange={(e) => handleFilterChange("date", e.target.value)}
          />
        </div>

        {/* Filter Kelas */}
        <select
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          onChange={(e) => handleFilterChange("classId", e.target.value)}
          defaultValue={searchParams.get("classId") || "all"}
        >
          <option value="all">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* [BARU] Filter Status */}
        <div className="relative">
          <Filter className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-gray-500" />
          <select
            className="rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-sm font-medium text-gray-700 outline-none focus:border-blue-500"
            onChange={(e) => handleFilterChange("status", e.target.value)}
            defaultValue={searchParams.get("status") || "all"}
          >
            <option value="all">Semua Status</option>
            <option value="hadir">Hadir</option>
            <option value="terlambat">Terlambat</option>
            <option value="sakit">Sakit</option>
            <option value="izin">Izin</option>
            {/* Note: Alpha/Belum hadir agak spesial, biasanya perlu handling null di query */}
          </select>
        </div>
      </div>
    </div>
  );
}
