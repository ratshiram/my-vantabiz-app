
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Ensures compatibility with Firebase App Hosting and similar platforms
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true, // Retained as per previous settings, revisit if platform supports optimization
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
