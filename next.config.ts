import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Enable if you need to access environment variables at build time
  // env: {
  //   CUSTOM_VAR: process.env.CUSTOM_VAR,
  // }
  /* config options here */
};

export default nextConfig;
