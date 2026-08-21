import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ponytail: disabled for R3F v9 + React 19 strict-mode bug (canvas target null).
  // Re-enable once R3F ships the fix.
  reactStrictMode: false,
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
