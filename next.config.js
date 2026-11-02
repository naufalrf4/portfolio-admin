import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = __dirname;
const r2ImageHostname =
  process.env.ADMIN_R2_ACCOUNT_ID && process.env.ADMIN_R2_BUCKET_NAME
    ? `${process.env.ADMIN_R2_BUCKET_NAME}.${process.env.ADMIN_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : null;

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: WORKSPACE_ROOT,
  turbopack: {
    root: WORKSPACE_ROOT,
  },
  experimental: {
    // Limits static-generation workers to reduce peak build memory on the VPS.
    // This can increase build time, but avoids concurrent workers exhausting
    // the container.
    cpus: 1,
  },
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
  serverExternalPackages: ['geoip-lite'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.naufalrf.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.naufalrf.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      ...(r2ImageHostname
        ? [
            {
              protocol: 'https',
              hostname: r2ImageHostname,
              pathname: '/**',
            },
          ]
        : []),
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
