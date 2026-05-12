import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@coffee-service/ui-library'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-c41a9919abd64864b940c181c034637e.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
