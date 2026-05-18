# Bonyad — Web

A Next.js 15 App Router web app for **Bonyad** — a marketplace connecting customers in Saudi Arabia with verified construction and home-service technicians.

> **Status: scaffolding.** The application architecture, design system, i18n, SEO, security headers, and testing infrastructure are in place. Backend integration and public-screen content are next.

The folder `website-bonyad/` at the repo root is the **frozen legacy React Native codebase** — `.gitignore`'d, reference-only. Never modified. See [`docs/migration-notes.md`](docs/migration-notes.md).

---

## Requirements

- **Node** ≥ 20.18.0 (`.nvmrc` provided — run `nvm use`)
- **pnpm** ≥ 11 (`packageManager` field in `package.json` pins the exact version)

If you don't have pnpm, the cleanest path:

```bash
corepack enable
corepack prepare pnpm@11.1.2 --activate
```

## Quick start

```bash
pnpm install      # ~90s first time
pnpm dev          # http://localhost:3000
```

Optional: copy `.env.example` to `.env.local` and override defaults (`NEXT_PUBLIC_SITE_URL`, etc.).

## Scripts

| Command                 | What it does                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm dev`              | Next.js dev server (Turbopack) at `localhost:3000`                                            |
| `pnpm build`            | Production build (`output: 'standalone'`)                                                     |
| `pnpm start`            | Run the production build                                                                      |
| `pnpm lint`             | ESLint flat config — file-size, layered imports, no-process-env, no-fetch, RTL utility checks |
| `pnpm lint:fix`         | Auto-fix lint issues                                                                          |
| `pnpm format`           | Prettier across the repo                                                                      |
| `pnpm format:check`     | Verify formatting (CI)                                                                        |
| `pnpm typecheck`        | `tsc --noEmit` strict mode                                                                    |
| `pnpm test`             | Vitest unit + component tests                                                                 |
| `pnpm test:watch`       | Vitest interactive watch                                                                      |
| `pnpm test:coverage`    | Vitest with v8 coverage report                                                                |
| `pnpm test:e2e:install` | One-time: download Chromium for Playwright                                                    |
| `pnpm test:e2e`         | Playwright E2E specs (boots dev server)                                                       |
| `pnpm test:a11y`        | pa11y-ci against the live sitemap                                                             |

## Architecture

The full ruleset is in [`docs/`](docs/) (~25 focused topic files). Start with [`docs/README.md`](docs/README.md). The 16 binding hard rules live in [`CLAUDE.md`](CLAUDE.md) at the repo root.

Most important rules:

1. **No `fetch()` outside `src/lib/api-client.ts`** — go through TanStack Query hooks.
2. **No endpoint string literals outside `src/config/endpoints.ts`** — mirror the legacy app.
3. **No hardcoded colors / hex / RGB / font-family** — tokens in `src/styles/tokens.css`.
4. **No physical Tailwind direction utilities** — `ms-` / `me-` / `ps-` / `pe-` / `start-` / `end-`.
5. **No user-facing strings in JSX** — `t('namespace.key')` only.
6. **Features can't import from other features** — lift shared code to `src/`.
7. **No `react-native` / `expo-*` / `nativewind`** anywhere.
8. **File ≤ 200 lines, function ≤ 50 lines, complexity ≤ 10, nesting ≤ 4** — ESLint-enforced.
9. **Server Components by default** — `'use client'` only at the leaf.
10. **JSON-LD must be HTML-escaped + carry the CSP nonce** — use the `<JsonLd>` helper.
11. **No `process.env.X` outside `src/config/env.ts`** — zod-validated `env` export.
12. **WCAG 2.2 AA** — every icon-only button has `aria-label`; every input has a `<label>`.
13. **No invented icons** — every icon comes from Figma via SVGR.
14. **Phased execution** — every non-trivial task runs in phases with gate reports.

## Project layout

```
src/
├── app/                  Routes only — no logic.
├── components/
│   ├── ui/               shadcn-style primitives (Button, Input, Card, …).
│   ├── feedback/         LoadingState, ErrorState, EmptyState, RouteAnnouncer.
│   ├── layout/           AppShell, Header, Footer, SkipLink, ThemeToggle, …
│   ├── seo/              <JsonLd>.
│   ├── icons/            SVGs exported from Figma (currently empty).
│   └── illustrations/    Larger named SVGs from Figma (currently empty).
├── config/               env.ts, routes.ts, constants.ts.
├── lib/                  utils, fonts, i18n, sentry, locale, get-translations.
├── locales/              en.json, ar.json — identical key shapes.
├── styles/tokens.css     Every design token as a CSS variable.
├── testing/              Vitest setup, RTL render helper, MSW handlers.
└── types/                Shared TS types.

e2e/                      Playwright specs + config.
docs/                     Architecture rules (25 files).
public/                   robots.txt, llms.txt, llms-full.txt, OG assets.
website-bonyad/           Frozen legacy RN code — .gitignored, never edited.
```

## Conventions

- **Files / folders** — `kebab-case`. **Components** — `PascalCase`. **Hooks** — `useCamelCase`.
- **Translation keys** — `feature.section.key`. Mirror in both `en.json` and `ar.json`.
- **Tests** — `xxx.test.ts(x)` next to source; E2E specs in `e2e/`.
- **Git commit messages** — Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`…). Enforced by `commitlint`.
- **Pre-commit** — lint-staged auto-fixes formatting + lint on changed files (via Husky).

## Deployment

The app is hosting-agnostic — `output: 'standalone'` produces a portable Node bundle that runs on Cloud Run, Docker, Fly, Railway, self-hosted, or Vercel. See [`docs/deployment-and-env.md`](docs/deployment-and-env.md). To change the production domain, set `NEXT_PUBLIC_SITE_URL` in your hosting provider's env — everything else (sitemap, robots, JSON-LD, metadataBase) updates automatically.

## For AI assistants working in this repo

Read [`CLAUDE.md`](CLAUDE.md) (Claude Code), [`AGENTS.md`](AGENTS.md) (Codex / Cline / Aider), `.cursorrules` (Cursor), `.windsurfrules` (Windsurf), or [`.github/copilot-instructions.md`](.github/copilot-instructions.md) (Copilot). All point at the same `docs/` rule set.

For ad-hoc chats (web Claude, ChatGPT), paste [`docs/ai-onboarding.md`](docs/ai-onboarding.md) into the chat once.

## License

Proprietary. © Bonyad.
