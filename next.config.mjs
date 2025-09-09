/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [ { protocol: "https", hostname: "cdn.jsdelivr.net" }, { protocol: "https", hostname: "images.unsplash.com" }, { protocol: "https", hostname: "avatars.githubusercontent.com" } ], 
    domains: ["cdn.jsdelivr.net","images.unsplash.com","lh3.googleusercontent.com","res.cloudinary.com"],
  },
}
export default nextConfig

