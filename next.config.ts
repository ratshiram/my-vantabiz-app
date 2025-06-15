
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Configure Next.js for static export
  typescript: {
    ignoreBuildErrors: false, // Fail build on TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Fail build on ESLint errors
  },
  images: {
    unoptimized: true, // Disable Next.js image optimization for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        'http://6000-firebase-studio-1749937401269.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev'
    ],
  }
};

export default nextConfig;
