
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Changed for Firebase App Hosting
  // Ensure errors are caught during build, not ignored
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true, // May be revisited if App Hosting supports Next.js image optimization with standalone
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
