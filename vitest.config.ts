import path from 'node:path';

import { defineConfig } from 'vitest/config';

// SVG files are processed by @svgr/webpack in Next.js but Vitest uses Vite,
// which has no SVGR plugin here. Without this transform, SVG imports return
// raw data-URIs that axe-core tries to use as CSS selectors and deadlocks.
// This plugin returns a minimal React component (`() => null`) for every SVG.
const svgMock = {
  name: 'svg-mock',
  transform(_: string, id: string) {
    if (!id.endsWith('.svg')) return;
    return { code: 'export default () => null;', map: null };
  },
};

export default defineConfig({
  plugins: [svgMock],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      'next/image': path.resolve(import.meta.dirname, 'src/testing/mocks/next-image.tsx'),
      'next/link': path.resolve(import.meta.dirname, 'src/testing/mocks/next-link.tsx'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/testing/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'e2e', 'website-bonyad'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/testing/**',
        'src/locales/**',
        'src/styles/**',
        'src/app/**/{layout,page,error,loading,not-found,global-error}.tsx',
      ],
    },
  },
});
