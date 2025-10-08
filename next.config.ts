import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // skips all ESLint errors at build time
  },
};

export default nextConfig;
