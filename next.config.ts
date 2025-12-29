import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['s3.amazonaws.com', 's3.me-south-1.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
