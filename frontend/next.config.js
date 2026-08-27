/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    // URL del Training Studio (app independiente, login propio) — solo un
    // enlace de acceso desde el menú, nunca una llamada API en runtime.
    NEXT_PUBLIC_TRAINING_STUDIO_URL: process.env.NEXT_PUBLIC_TRAINING_STUDIO_URL || 'http://localhost:3003',
  },
}

module.exports = nextConfig
