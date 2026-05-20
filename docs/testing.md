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

## Per-endpoint tests

**Every `features/X/api/<endpoint>.ts` MUST ship with a sibling `<endpoint>.test.ts` in the same PR.** This is hard-rule 1 in `CLAUDE.md` — the fetcher's branching (`toResult`, pending detection, error-code redirects, request-body normalisation) is what these tests cover. Form tests cover the integration, not the branching; they are not a substitute.

### Cover (at minimum)

1. **Happy path** — the fetcher returns the parsed success shape AND the outgoing request body matches what the legacy RN call site sends. Assert on a captured request, not just on the return value.
2. **One representative 4xx** — the backend's `{ messageEn, messageAr, errorCode }` envelope surfaces as `ApiError` with `err.status` correct, `err.localizedMessage('en')` and `err.localizedMessage('ar')` resolving to the right strings, and `err.errorCode` populated.
3. **Every special-state branch** the fetcher carries — login's 200-with-`"OTP sent"` → `{ kind: 'pending' }`, login's 400-`USER_ALREADY_EXISTS_PENDING` → `{ kind: 'pending' }`, OTP auto-submit, an unfamiliar `role` value (`'ADMIN'`) coming back without crashing, phone normalisation (`'0501234567'` → request body `'501234567'`), etc. One branch per `it` block.

### MSW pattern — request capture

```ts
// src/features/auth/api/login.test.ts
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/testing/handlers/server';
import { ApiError } from '@/lib/api-client';
import { loginUser } from './login';

function captureRequest() {
  const seen: { body?: unknown } = {};
  server.use(
    http.post('*/auth/login', async ({ request }) => {
      seen.body = await request.json();
      return HttpResponse.json({ token: 'tok', user: { id: 7, role: 'USER' } });
    }),
  );
  return seen;
}

describe('loginUser', () => {
  it('normalises the phone before sending it', async () => {
    const seen = captureRequest();
    await loginUser({ phone: '0501234567', password: 'x', role: 'USER' });
    expect(seen.body).toMatchObject({
      phoneNumber: '501234567',
      role: 'USER',
      fcmToken: 'no-token',
    });
  });

  it('returns { kind: "pending" } on a 200 with an OTP-sent message', async () => {
    server.use(http.post('*/auth/login', () => HttpResponse.json({ message: 'OTP sent.' })));
    const r = await loginUser({ phone: '501234567', password: 'x', role: 'USER' });
    expect(r).toMatchObject({ kind: 'pending', phoneNumber: '501234567', role: 'USER' });
  });

  it('throws ApiError with messageAr/messageEn on 400 ACCOUNT_NOT_FOUND', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json(
          {
            messageEn: 'Account not found.',
            messageAr: 'الحساب غير موجود.',
            errorCode: 'ACCOUNT_NOT_FOUND',
          },
          { status: 400 },
        ),
      ),
    );
    await expect(
      loginUser({ phone: '501234567', password: 'x', role: 'USER' }),
    ).rejects.toMatchObject({
      status: 400,
      errorCode: 'ACCOUNT_NOT_FOUND',
    });
  });
});
```

### Why this matters

The login bug we shipped (UI showed generic `"Something went wrong"` on a real 400) would have been caught by point 2 above — the fetcher swallowed the localised message because no test asserted that `err.messageEn` was populated. Adding the test forces the contract.

### Where the test file lives

Next to the fetcher: `src/features/auth/api/login.test.ts`, never under `__tests__/`. Test files cap at 400 lines.

## CI gates

`pnpm test` must pass before any PR can merge:

- Vitest: all unit + component tests pass, coverage ≥80% on `utils/` and `schemas/`.
- Playwright: critical-path E2E specs pass.
- Type-check + lint pass (separate steps).
