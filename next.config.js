/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        hostname: 'aulianza.s3.ap-southeast-1.amazonaws.com',
      },
      {
        hostname: 'static.webjam.cn',
      },
      {
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
};

module.exports = nextConfig;
