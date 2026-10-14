import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone locally/in Docker, but let Vercel handle serverless packaging natively
  output: process.env.VERCEL ? undefined : "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["https://*.space-z.ai", "https://*.z.ai"],
};

export default nextConfig;
