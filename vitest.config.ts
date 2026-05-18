import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
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
