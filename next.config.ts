/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',  // Limite la taille des requêtes
      allowedOrigins: ['*']  // Autorise toutes les origines
    }
  },
  // Ajout de la configuration pour écouter sur toutes les interfaces
  server: {
    hostname: '0.0.0.0',
    port: parseInt(process.env.PORT || '8080', 10),
  },
}

export default nextConfig;