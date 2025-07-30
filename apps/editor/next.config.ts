import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true,
  experimental: {
    inlineCss: false,
  },
  transpilePackages: ['three'],
};

export default nextConfig;
