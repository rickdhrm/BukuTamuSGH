import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone mode is for Docker on-premise deployment, disable on Vercel serverless
  ...(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV
    ? {}
    : { output: "standalone" }),
};

export default nextConfig;
