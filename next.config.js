const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = { ...(config.resolve.alias || {}), '@': path.resolve(__dirname, 'src') };
    return config;
  },
  reactStrictMode: true,
  experimental: { serverActions: { allowedOrigins: ['*'] } },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};
module.exports = nextConfig;

