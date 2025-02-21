import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config) => {
    config.externals.push({
      'vaporwaver-ts': 'commonjs vaporwaver-ts',
    });
    return config;
  }
};

export default nextConfig;
