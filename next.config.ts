import type { NextConfig } from "next";
import { supabaseProjectHost } from "./app/lib/supabase-config";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  serverExternalPackages: ["nodemailer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
      {
        protocol: "https",
        hostname: "ipay99.wordpress.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: supabaseProjectHost,
        pathname: "/storage/v1/object/public/news-media/**",
      },
    ],
  },
};

export default nextConfig;
