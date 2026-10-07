import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home directory confuses Next's workspace
  // detection; pin the root to this project.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
