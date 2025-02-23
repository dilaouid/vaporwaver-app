/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',  // Limite la taille des requêtes
      allowedOrigins: ['*']  // Autorise toutes les origines
    }
  }
}

export default nextConfig;