import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

/**
 * Flat ESLint config for the Bonyad Next.js app.
 *
 * Rules enforced beyond the standard recommendations:
 *  - File / function / complexity / nesting limits (docs/file-size-limits.md)
 *  - Layered import boundaries: app → features → shared (docs/import-boundaries.md)
 *  - Feature isolation: features/A cannot import from features/B
 *  - No physical Tailwind direction utilities (docs/i18n-and-rtl.md)
 *  - No `process.env.X` outside src/config/env.ts
 *  - No raw `fetch(` outside src/lib/api-client.ts
 */
export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'website-bonyad/**',
      '.claude/**',
      'next-env.d.ts',
      '**/*.css',
      '**/*.json',
      '**/*.md',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      boundaries,
      sonarjs,
    },
    settings: {
      react: { version: 'detect' },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'feature', pattern: 'src/features/*', mode: 'folder', capture: ['name'] },
        {
          type: 'shared',
          pattern: 'src/{components,hooks,stores,lib,utils,types,config,styles,testing,locales}/**',
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // React + Next
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // TypeScript: enforce consistent type-only imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Prefer `type` over `interface` for object shapes (matches docs/components.md).
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // File-size / complexity hard limits (docs/file-size-limits.md)
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-params': ['error', 4],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],
      'react/jsx-max-depth': ['error', { max: 5 }],
      'sonarjs/cognitive-complexity': ['error', 15],

      // Import hygiene
      'import/no-cycle': 'error',
      'import/no-default-export': 'off', // Next.js routes require default exports
      'import/order': [
        'warn',
        {
          // No `type` group — type-only imports sort with their source (external, internal, etc).
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          // tsconfig `@/*` paths resolve to local source — classify as internal.
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Layered boundaries (docs/import-boundaries.md) — v6 object-based syntax.
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'app' },
              allow: [{ to: { type: 'feature' } }, { to: { type: 'shared' } }],
            },
            {
              from: { type: 'feature' },
              allow: [
                {
                  to: {
                    type: 'feature',
                    captured: { name: '{{ from.captured.name }}' },
                  },
                },
                { to: { type: 'shared' } },
              ],
            },
            {
              from: { type: 'shared' },
              allow: [{ to: { type: 'shared' } }],
            },
          ],
        },
      ],

      // Force imports from feature index barrels
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/!(index)', '@/features/*/*'],
              message: 'Import from the feature index only (`@/features/<name>`).',
            },
            {
              group: [
                '../../../website-bonyad/*',
                '../../website-bonyad/*',
                '../website-bonyad/*',
                'website-bonyad/*',
              ],
              message:
                'The website-bonyad/ folder is frozen legacy code, gitignored, and not part of this app. Read it only — never import from it.',
            },
            {
              group: ['react-native', 'react-native-*', 'expo-*', 'nativewind'],
              message: 'This is a web codebase. Never import React Native or Expo modules.',
            },
          ],
        },
      ],

      // No physical Tailwind direction utilities (docs/i18n-and-rtl.md).
      // `rounded-l-` requires trailing dash so we don't false-positive on `rounded-lg`.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(^|\\s)(ml-|mr-|pl-|pr-|left-|right-|text-left|text-right|border-l-|border-r-|rounded-l-|rounded-r-)/]",
          message:
            'Use logical Tailwind utilities (ms-, me-, ps-, pe-, start-, end-, text-start, text-end, border-s-, border-e-, rounded-s-, rounded-e-). See docs/i18n-and-rtl.md.',
        },
      ],

      // Misc safety
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },

  // src/config/env.ts is the ONLY place allowed to read process.env.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/config/env.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'process', message: 'Use the validated env export from @/config/env instead.' },
      ],
    },
  },

  // src/lib/api-client.ts is the ONLY place allowed to call raw fetch.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/api-client.ts', 'src/testing/**', '**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Use apiClient from @/lib/api-client instead of raw fetch.' },
      ],
    },
  },

  // Test files: relaxed file-size limit.
  {
    files: ['**/*.test.{ts,tsx}', 'e2e/**/*.{ts,tsx}', 'src/testing/**/*.{ts,tsx}'],
    rules: {
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': 'off',
      'no-restricted-globals': 'off',
    },
  },

  // Type declaration files: module-augmentation patterns require `interface`
  // and often produce "empty" interfaces that are intentional.
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // CommonJS configs (commitlint.config.cjs, etc.) — CJS globals + sourceType.
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-restricted-globals': 'off',
    },
  },

  // Generated / config-table files: no max-lines.
  // (CSS, JSON, MD already excluded from linting via top-level `ignores`.)
  {
    files: [
      'src/config/endpoints.ts',
      // Build-tool config files (not application code)
      'eslint.config.mjs',
      'next.config.ts',
      'tailwind.config.ts',
      'postcss.config.mjs',
      'vitest.config.ts',
      'playwright.config.ts',
    ],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },
);
