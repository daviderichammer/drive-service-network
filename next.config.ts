import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "openbay.driveservicenetwork.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  // CHANGE 001 / 009 — the "For Fleets" and "Fleet Accounts" pages have been
  // eliminated and their relevant content consolidated into HOME.
  async redirects() {
    return [
      { source: "/fleet-operators", destination: "/", permanent: true },
      { source: "/fleet-accounts", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;
