
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      'https://9000-firebase-studio-1749215492199.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev',
      'https://9002-firebase-studio-1749215492199.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev',
      'https://6000-firebase-potentially-app-test-1761825097034.cluster-c3a7z3wnwzapkx3rfr5kz62dac.cloudworkstations.dev',
    ],
  },
  webpack: (config) => {
    config.externals.push({
      'node-fetch': 'commonjs2 node-fetch',
    });
    return config;
  },
};

export default nextConfig;
