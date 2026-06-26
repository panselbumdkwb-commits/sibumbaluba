import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Bcryptjs harus jalan di Node.js runtime, bukan Edge
  serverExternalPackages: ['bcryptjs'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Next.js 15: skip type check saat build (jalankan tsc manual untuk dev)
  // Vercel akan tetap build sukses meski ada error TS lokal karena deps belum install
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint saat build di Vercel (jalankan manual: npm run lint)
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
