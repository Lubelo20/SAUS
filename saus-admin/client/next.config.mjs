/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'admin.saus.org.za', 'saus.org.za'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  },
};

export default nextConfig;
