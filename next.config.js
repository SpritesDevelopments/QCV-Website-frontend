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
        protocol: 'http',
        hostname: '188.165.254.184',
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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://188.165.254.184:8106/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
