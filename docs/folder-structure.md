# Folder structure

## Top-level layout

```
web/
├── public/                      # Static assets served as-is
├── src/
│   ├── app/                     # Next.js App Router — ROUTES ONLY
│   │   ├── (auth)/              # Route group: auth shell — no AppShell/footer
│   │   │   ├── layout.tsx       #   Minimal layout (logo navbar only)
│   │   │   └── login/page.tsx   #   /login — SSR metadata + labels
│   │   ├── (main)/              # Route group: public pages with AppShell
│   │   │   ├── layout.tsx       #   Wraps children in AppShell (header + footer)
│   │   │   └── page.tsx         #   / — home page
│   │   ├── api/                 # Next.js route handlers (only if needed)
│   │   ├── layout.tsx           # Root layout — html/body/Providers ONLY
│   │   ├── error.tsx            # Root error boundary
│   │   ├── not-found.tsx
│   │   └── globals.css          # Tailwind directives + theme tokens ONLY
│   │
│   ├── components/              # SHARED components — used by 2+ features
│   │   ├── ui/                  # shadcn/ui primitives (Button, Input, Dialog…)
│   │   ├── layout/              # AppShell, Sidebar, Header, Footer
│   │   ├── feedback/            # Toast, ErrorState, EmptyState, LoadingState
│   │   └── data-display/        # DataTable, Pagination, etc.
│   │
│   ├── features/                # Business features — see below
│   │   ├── auth/                # Login, register, forgot-password flows
│   │   ├── projects/
│   │   ├── bids/
│   │   ├── chat/
│   │   ├── technicians/
│   │   ├── portfolio/
│   │   ├── payments/
│   │   ├── notifications/
│   │   └── …
│   │
│   ├── lib/                     # Preconfigured third-party clients
│   │   ├── api-client.ts        # Typed fetch wrapper
│   │   ├── query-client.ts      # TanStack Query client config
│   │   ├── i18n.ts              # i18next config — initialized once
│   │   ├── auth-storage.ts      # Token persistence (cookies)
│   │   ├── sentry.ts            # Sentry init
│   │   └── analytics.ts
│   │
│   ├── config/                  # App-wide constants
│   │   ├── env.ts               # Typed env-var access (zod-validated)
│   │   ├── routes.ts            # Centralized route paths
│   │   ├── endpoints.ts         # API_ENDPOINTS mirror of RN app
│   │   └── constants.ts         # Pagination sizes, debounce ms, etc.
│   │
│   ├── hooks/                   # SHARED hooks (useDebounce, useMediaQuery…)
│   ├── stores/                  # SHARED Zustand stores (auth, ui, locale)
│   ├── types/                   # SHARED types (User, Role, ApiError…)
│   ├── utils/                   # SHARED pure functions (formatDate, cn…)
│   ├── styles/
│   │   └── tokens.css           # @theme tokens — colors, fonts, radii, spacing
│   ├── locales/
│   │   ├── en.json
│   │   └── ar.json
│   └── testing/                 # Test setup, MSW handlers, fixtures
│
├── e2e/                         # Playwright tests
├── docs/                        # This folder
├── .env.example                 # All required env vars documented
├── eslint.config.mjs
├── tailwind.config.ts           # Tailwind v4 minimal config — tokens in CSS
├── next.config.ts
└── tsconfig.json                # strict: true, paths: { "@/*": ["./src/*"] }
```

## Inside a feature folder

A feature is a vertical slice (auth, projects, chat…). Each feature folder:

```
features/<feature-name>/
├── api/                         # All HTTP — one file per endpoint
│   ├── get-projects.ts
│   ├── create-project.ts
│   └── index.ts                 # Re-exports
├── components/                  # Components used ONLY inside this feature
├── hooks/                       # Feature-local hooks
├── stores/                      # Feature-local Zustand store (rare)
├── schemas/                     # zod schemas (form + API request/response)
├── types/                       # Feature-local TS types (derived from zod)
├── utils/                       # Feature-local pure helpers
└── index.ts                     # Public API — re-exports for other layers
```

## Folder rules

1. **Routes contain no logic.** `app/(main)/page.tsx` or `app/(auth)/login/page.tsx` may only render a feature component and set metadata. Move all logic to the feature component.
2. **A file goes in a feature folder if it's used by ≤1 feature.** If a second feature needs it, promote to the top-level shared folder.
3. **No "common" or "shared" inside a feature.** If you feel the urge, the thing belongs at the top level.
4. **No deep nesting.** Max 2 levels inside a feature (`features/auth/components/login-form.tsx` is fine; `features/auth/components/forms/login/index.tsx` is not).
5. **Every feature has an `index.ts` barrel.** Other layers import from `@/features/auth`, never `@/features/auth/components/login-form`.
6. **Files and folders are `kebab-case`.** Default exports inside are `PascalCase` for components (see [naming.md](naming.md)).
