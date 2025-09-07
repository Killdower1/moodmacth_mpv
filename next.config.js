/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { allowedOrigins: ['*'] } },
  images: {
    domains: [
      'cdn.jsdelivr.net',
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'randomuser.me',
      'res.cloudinary.com',
      'picsum.photos',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.jsdelivr.net', pathname: '/gh/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'randomuser.me', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/seed/**' },
    ],
  },
};
module.exports = nextConfig;
