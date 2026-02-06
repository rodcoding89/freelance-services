import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
const domaine = process.env.NEXT_PUBLIC_ROOT_LINK;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: domaine ?? "",
        port: '',
        pathname: '/assets/**',
      },
    ], // Autoriser l'optimisation d'images
  },
  productionBrowserSourceMaps: false,
  output: 'standalone',
};

export default withNextIntl(nextConfig);
