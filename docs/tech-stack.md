# Tech stack

## Locked versions (verified 2026-05-18 against npm)

These are pinned to the highest stable releases available today. Pin **exactly** in `package.json` (no `^`, no `~`) so every machine gets the same build.

| Concern                     | Package                       | Pinned version                    |
| --------------------------- | ----------------------------- | --------------------------------- |
| Framework                   | `next`                        | **16.2.6**                        |
| UI runtime                  | `react`                       | **19.2.6**                        |
|                             | `react-dom`                   | **19.2.6**                        |
| Language                    | `typescript`                  | **6.0.3**                         |
| Styling                     | `tailwindcss`                 | **4.3.0**                         |
| Component library           | `shadcn/ui`                   | latest (copied into repo via CLI) |
| Server state                | `@tanstack/react-query`       | **5.100.10**                      |
| UI state                    | `zustand`                     | **5.0.13**                        |
| Forms                       | `react-hook-form`             | **7.76.0**                        |
|                             | `@hookform/resolvers`         | **5.2.2**                         |
| Schemas                     | `zod`                         | **4.4.3**                         |
| i18n                        | `i18next`                     | **26.2.0**                        |
|                             | `react-i18next`               | **17.0.8**                        |
| Theme switch                | `next-themes`                 | **0.4.6**                         |
| Icons (system glyphs only)  | `lucide-react`                | **1.16.0**                        |
| Error tracking              | `@sentry/nextjs`              | **10.53.1**                       |
| Animation (mid-complexity)  | `framer-motion`               | **12.38.0**                       |
| Animation (complex / brand) | `lottie-react`                | **2.4.1**                         |
| SVG icons → React           | `@svgr/webpack`               | **8.1.0**                         |
| Rate limiting               | `@upstash/ratelimit`          | **2.0.8**                         |
| Test runner                 | `vitest`                      | **3.2.4**                         |
|                             | `@vitest/coverage-v8`         | **3.2.4**                         |
| RTL                         | `@testing-library/react`      | **16.3.2**                        |
|                             | `@testing-library/jest-dom`   | **6.9.1**                         |
| A11y in tests               | `vitest-axe`                  | **0.1.0**                         |
| E2E                         | `@playwright/test`            | **1.60.0**                        |
| E2E a11y                    | `@axe-core/playwright`        | **4.11.3**                        |
| Mocking                     | `msw`                         | **2.14.6**                        |
| A11y in CI                  | `pa11y-ci`                    | **4.1.1**                         |
| Lint                        | `eslint`                      | **9.39.4**                        |
|                             | `eslint-plugin-boundaries`    | **6.0.2**                         |
|                             | `eslint-plugin-import`        | **2.32.0**                        |
|                             | `eslint-plugin-sonarjs`       | **4.0.3**                         |
| Format                      | `prettier`                    | **3.8.3**                         |
|                             | `prettier-plugin-tailwindcss` | **0.8.0**                         |
| Package manager             | `pnpm`                        | **11.1.2**                        |

No React 20 is stable yet (only canary). No Tailwind v5 yet. No Next.js 17 yet. This is the current ceiling.

To re-check the ceiling at any time:

```bash
for p in next react typescript tailwindcss zod @tanstack/react-query zustand react-hook-form i18next vitest eslint; do
  echo -n "$p: "; npm view "$p" version
done
```

## Forbidden in this app

- `react-native`, `react-native-web`, `expo-*` modules, `nativewind`
- Inline `style={{ color: '#fff' }}` with hex/RGB values
- Hardcoded font-family strings outside `src/styles/tokens.css`
- Raw `fetch(...)` outside `src/lib/api-client.ts`
- Endpoint string literals outside `src/config/endpoints.ts`
- Any import from the frozen legacy folder `website-bonyad/`

## Why these choices

- **Next.js 16 App Router** — Turbopack default, full Server Components, streaming, nested layouts, partial prerendering.
- **React 19** — Server Components, Actions, `use()` hook.
- **TypeScript 6** — improved control-flow analysis, faster builds.
- **Tailwind v4** — tokens live as native CSS variables; dark mode + Arabic theming need zero JS.
- **shadcn/ui** — components copied into the repo (you own them), accessible by default via Radix.
- **TanStack Query** — proven server-state library; clean cache, mutations, devtools.
- **Zustand** — small, no boilerplate, no providers.
- **react-hook-form + zod 4** — uncontrolled forms (fast) + schema-as-types (no duplication).
- **i18next** — same library as the (frozen) legacy app; "init once" pattern carries over.
- **Sentry from day 1** — never ship blind.

## Major bumps that affect code patterns

Several majors landed since the original architecture draft. Watch for these when porting any example:

- **Zod 3 → 4** — most patterns unchanged (`z.object`, `z.infer`, `.parse`, `.safeParse`, coercion). Error-format shape and a few utility names changed; consult the Zod 4 migration guide. Run a quick TypeScript check on any code copied from Zod 3 sources.
- **Next 15 → 16** — Turbopack is default for `dev` and `build`. Some legacy `pages/`-era helpers were removed. App Router patterns in our docs are unaffected.
- **TypeScript 5 → 6** — stricter narrowing in some patterns. If a file fails to typecheck after the bump, the fix is almost always to add a missing type-guard or narrower union.
- **i18next 25 → 26 + react-i18next 16 → 17** — config shape stable; just confirm `useTranslation()` and `<Trans>` calls compile. Plurals API unchanged.
- **ESLint 9** — flat-config is the only config format. Pinned to 9.x (not 10) because `eslint-plugin-react@7.37.x` and several other plugins still use the pre-ESLint-10 context API; the React/Next plugin ecosystem hasn't migrated yet. Bump to 10 when `eslint-plugin-react@8+` or `@eslint-react/eslint-plugin` is the standard.
- **Vitest pinned to 3.2.4 (not 4)** — Vitest 4 ships with Rolldown (Rust bundler) as an internal dep whose platform-specific native bindings have flaky install behavior under pnpm 11. The v3 line uses standard Vite + Rollup and works reliably. Re-evaluate once Vitest 4.x has a few patch releases.
- **happy-dom (20.9.0) instead of jsdom for the test DOM** — jsdom 29's transitive `html-encoding-sniffer@6` uses CommonJS `require()` against the ESM-only `@exodus/bytes@1.15.0`, breaking under Node 20's strict ESM rules. happy-dom is a drop-in replacement, faster (~30%), and has no convoluted dep chain. The `vitest.config.ts` `environment: 'happy-dom'` is the only code-level change.
- **lucide-react 0.x → 1.0** — package now follows semver. Import paths unchanged.

## Adding a new dependency

Before `pnpm add anything`:

1. Confirm nothing in the existing stack already does the job.
2. Check bundle size on [bundlephobia.com](https://bundlephobia.com).
3. Confirm active maintenance (last commit within 6 months).
4. Mention in the PR description what alternatives you ruled out.
5. Pin the exact version (no `^`, no `~`) — match this doc's policy.

## Upgrading

When you upgrade a pinned package, update **this doc in the same PR**. If the upgrade is a major version, also note any code-pattern changes that ripple into other `docs/*.md` files.
