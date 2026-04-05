/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'pinterest.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'kprofiles.com' },
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
