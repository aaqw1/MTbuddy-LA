/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    // Allow data: URIs for Gemini-generated base64 images
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

module.exports = nextConfig;

