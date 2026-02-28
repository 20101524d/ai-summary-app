/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow fetching from Supabase Storage URLs
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
