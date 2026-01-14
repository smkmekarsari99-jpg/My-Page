import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Nanti jika ada domain lain (misal: supabase), tambahkan di sini
    ],
  },
};

export default nextConfig;
