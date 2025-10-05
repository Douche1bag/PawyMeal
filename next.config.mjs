/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: '/docs',
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
