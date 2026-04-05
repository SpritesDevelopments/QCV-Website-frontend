/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8106',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/api/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
