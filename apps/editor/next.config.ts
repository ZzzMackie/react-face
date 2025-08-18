import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true,
  experimental: {
    inlineCss: false,
  },
  transpilePackages: ['three'],
  // HTTPS配置
  server: {
    https: true,
    allowHTTP1: true,
    accessOrigin: '*',
  },
  // 开发服务器配置
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  resolve: {
    alias: {
      '@appUtils': resolve(__dirname, 'app/utils'),
    },
  },
  // 代理配置
  async rewrites() {
    return [
      {
        source: '/draco-proxy/:path*',
        destination: 'https://unpkg.com/three@0.158.0/examples/js/libs/draco/:path*',
      },
    ];
  },
  // 头部配置
  async headers() {
    return [
      {
        source: '/draco-proxy/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/api/proxy/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
