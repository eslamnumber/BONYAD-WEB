import type { NextConfig } from 'next';

// Static security headers applied to every response.
// The per-request CSP nonce is set in `middleware.ts` instead.
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Uploaded assets (certificates, service icons, portfolio photos) are
      // served from Google Cloud Storage; the backend also returns full GCS URLs.
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      // Backend hosts — relative asset paths are resolved against these by
      // `buildAssetUrl` (production / dev Cloud Run + the legacy MSW base).
      {
        protocol: 'https',
        hostname: 'bonyad-app-1026710889441.me-central1.run.app',
      },
      {
        protocol: 'https',
        hostname: 'bonyad-app-dev-1026710889441.me-central1.run.app',
      },
      {
        protocol: 'https',
        hostname: 'bonyad-app-nyayeditqq-ww.a.run.app',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // SVG files become React components via SVGR.
  // Next 16 uses Turbopack by default — the loader is configured here, not in `webpack()`.
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              // Preserve viewBox so SVGs scale correctly when CSS resizes them.
              // SVGO's default preset strips viewBox when it matches width × height.
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                        // Preserve original IDs (gradient/clip refs like s1g0, s2g0…).
                        // Without this, SVGO renames every ID to "a", causing all
                        // inlined SVGs on the same page to share the same gradient.
                        cleanupIds: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
  },
};

export default config;
