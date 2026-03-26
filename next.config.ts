import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
