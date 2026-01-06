import React from "react";

type DashboardOverviewProps = {
  userRole: string;
};

export const DashboardOverview = ({ userRole }: DashboardOverviewProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Kartu Statistik */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Status User
        </h3>
        <p className="mt-2 text-3xl font-bold text-gray-900 capitalize dark:text-white">
          {userRole}
        </p>
      </div>

      {/* Widget lain bisa ditambahkan di sini nanti */}
    </div>
  );
};
