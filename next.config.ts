
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Crucial for static export for Firebase Hosting
  // Ensure errors are caught during build, not ignored
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true, // Required for static export as Firebase doesn't run Next.js image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
