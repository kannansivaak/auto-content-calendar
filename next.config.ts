/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['instagram.com', 'cdninstagram.com'],
  },
  async rewrites() {
    return [];
  },

  // Make sure API routes are not being redirected
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
