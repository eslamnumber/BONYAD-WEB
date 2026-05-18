# Testing

## What to test

| Layer                                                              | Tool                      | Required?                 |
| ------------------------------------------------------------------ | ------------------------- | ------------------------- |
| Pure utils (`utils/`, `schemas/`)                                  | Vitest                    | Yes — 100% of branches    |
| Hooks (custom hooks, query/mutation hooks)                         | Vitest + RTL `renderHook` | Yes for non-trivial logic |
| Components with logic (forms, lists with filters)                  | Vitest + RTL              | Yes                       |
| Snapshot of dumb UI primitives                                     | —                         | No (waste)                |
| Critical user journeys (login, create-project, payment, chat send) | Playwright                | Yes                       |

## Rules

1. **Test files sit next to source.** `project-card.tsx` ↔ `project-card.test.tsx`.
2. **Use Testing Library queries by accessibility role**, not by class. `getByRole('button', { name: /save/i })`, not `getByTestId('save-btn')`. Test IDs are a last resort.
3. **Mock the network with MSW**, not by mocking `apiClient`. Handlers live in `src/testing/handlers/`. One file per feature.
4. **No `setTimeout` in tests.** Use `await waitFor` / `findBy*`.
5. **Each Playwright test seeds its own state** via API calls in `test.beforeEach` — never depends on a previous test's leftovers.
6. **One concept per test, not one assertion per test.** A test can have multiple `expect` calls if they describe the same behavior.
7. **i18n in tests:** load the `en.json` resource in the test setup so `t('…')` returns real strings. Assertions use real strings — not keys.
8. **No production code is changed to make it testable.** If a component is hard to test, fix the design (extract a hook, split the component), don't expose internals.

## Folder layout

```
web/
├── src/testing/
│   ├── setup.ts                # Vitest global setup
│   ├── render.tsx              # Custom render wrapping providers (i18n, theme, query client)
│   ├── handlers/               # MSW handlers — one file per feature
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   └── …
│   └── fixtures/               # Sample data (users, projects, etc.)
├── e2e/
│   ├── playwright.config.ts
│   ├── fixtures.ts             # Test users, seed helpers
│   └── login.spec.ts
└── vitest.config.ts
```

## Custom render

```tsx
// src/testing/render.tsx
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider attribute="class">
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>,
  );
}
```

Use `renderWithProviders` in every component test — never raw `render`.

## CI gates

`pnpm test` must pass before any PR can merge:

- Vitest: all unit + component tests pass, coverage ≥80% on `utils/` and `schemas/`.
- Playwright: critical-path E2E specs pass.
- Type-check + lint pass (separate steps).
