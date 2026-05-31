import type { NextConfig } from 'next';

const workerUrl = process.env.WORKER_URL ?? 'http://localhost:8787';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${workerUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
