import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    inlineCss: false,
  },
  transpilePackages: ['three'],
  // HTTPS配置 (仅在开发环境启用)
  ...(process.env.NODE_ENV === 'development' && {
    server: {
      https: true,
      allowHTTP1: true,
      accessOrigin: '*',
    },
  }),
  // 开发服务器配置
  devIndicators: {
    position: 'bottom-right',
  },
  webpack: (config, { isServer }) => {
    // 解决 Konva 在服务端渲染的问题
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    
    // 添加别名
    config.resolve.alias = {
      ...config.resolve.alias,
      '@appUtils': resolve(__dirname, 'app/utils'),
    };
    
    return config;
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
