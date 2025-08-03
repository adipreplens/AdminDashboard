import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  output: 'export',
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;
