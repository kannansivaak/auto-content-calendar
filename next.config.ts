// File: next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['instagram.com', 'cdninstagram.com'],
  },
}

module.exports = nextConfig
