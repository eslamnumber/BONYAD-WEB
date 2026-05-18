# Import boundaries

## The layer diagram

```
                  ┌─────────┐
                  │  app/   │  ← can import anything below
                  └────┬────┘
                       │
                  ┌────▼────────┐
                  │  features/  │  ← can import from shared, NOT from other features
                  └────┬────────┘
                       │
   ┌─────────┬─────────┼─────────┬─────────┬──────────┐
   ▼         ▼         ▼         ▼         ▼          ▼
components/ hooks/  stores/   lib/      utils/    types/    config/   ← shared layer
   │
   └── components/ui/  ← lowest layer, depends on nothing app-specific
```

## Hard import rules — enforced by ESLint

1. **`features/A/**`cannot import from`features/B/**`.** Cross-feature work happens at the `app/` layer or through shared code.
2. **Shared folders cannot import from `features/` or `app/`.** Shared code is pure infrastructure.
3. **`components/ui/**`cannot import from anything outside`components/ui/`, `lib/utils`(the`cn`helper), or`lucide-react`.\*\* No app types, no API, no i18n.
4. **Always import from a feature's `index.ts` barrel** when crossing the feature boundary. Inside a feature, deep imports are fine.
5. **Use the `@/` alias for every cross-folder import.** Never `../../../features/auth`. Configured in `tsconfig.json`.
6. **No barrel imports inside the same feature.** Inside `features/auth/`, import siblings directly (`./components/login-form`), not via `../index`. Prevents circular imports.
7. **Type-only imports use `import type`.** Enforced by `@typescript-eslint/consistent-type-imports`.
8. **No circular dependencies.** Enforced by `eslint-plugin-import/no-cycle`.

## When you need cross-feature data

You have three options, in order of preference:

1. **Lift the shared piece** to `src/components/`, `src/hooks/`, `src/types/`, or `src/utils/`. Most cases.
2. **Compose at the `app/` layer.** The page imports from both features and wires them together.
3. **Re-fetch.** The second feature defines its own query hook that hits the same endpoint. Cheap because TanStack Query dedupes by query key.

Never:

- Import a query hook from another feature.
- Import a component from another feature.
- Share a Zustand store between unrelated features.

## ESLint enforcement

In `eslint.config.mjs`:

```js
import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'feature', pattern: 'src/features/*', mode: 'folder', capture: ['name'] },
        {
          type: 'shared',
          pattern: 'src/{components,hooks,stores,lib,utils,types,config,styles}/**',
        },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['feature', 'shared'] },
            { from: 'feature', allow: [['feature', { name: '${from.name}' }], 'shared'] },
            { from: 'shared', allow: ['shared'] },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/features/*/!(index)'], message: 'Import from the feature index only.' },
          ],
        },
      ],
      'import/no-cycle': 'error',
    },
  },
];
```
