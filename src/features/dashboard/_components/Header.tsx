import React from "react";

type DashboardHeaderProps = {
  userName: string;
  userEmail: string;
};

export const DashboardHeader = ({
  userName,
  userEmail,
}: DashboardHeaderProps) => {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Selamat Datang, {userName}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-indigo-100 font-bold text-indigo-600">
        {userName?.charAt(0).toUpperCase()}
      </div>
    </header>
  );
};
