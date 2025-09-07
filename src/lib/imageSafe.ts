const allowedHosts = new Set([
  'cdn.jsdelivr.net',
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'randomuser.me',
  'res.cloudinary.com',
  'picsum.photos',
]);

export function isAllowedHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return allowedHosts.has(hostname);
  } catch {
    return false;
  }
}

export function safeImageProps(src: string) {
  return isAllowedHost(src) ? { src } : { src, unoptimized: true };
}

