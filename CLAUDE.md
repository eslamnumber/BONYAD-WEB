# CLAUDE.md — Orientation for AI coding assistants

This file is automatically loaded by Claude Code (and read by other AI tools) when working in this repo. **Read this first, then read only the rule doc(s) relevant to the current task.** Doing this minimizes token use and avoids the "read everything every time" trap.

## What this app is

A Next.js 15 App Router web app for **Bonyad** — a marketplace connecting customers with verified construction/service technicians in Saudi Arabia. Backend is REST.

## The `website-bonyad/` folder

The folder `website-bonyad/` at the repo root holds the **frozen legacy React Native + Expo codebase**. It is **`.gitignore`'d** and never modified — read-only reference for:

- Backend endpoints (`website-bonyad/src/config/api.ts`)
- Auth flow shape (login → validate-token → refresh-token)
- Request/response shapes and field names
- Role gating logic
- Existing translation key inventory

**Never copy UI, JSX, components, styling, design tokens, or visual decisions from `website-bonyad/`.** New designs come from Figma — see [`docs/figma-to-code.md`](docs/figma-to-code.md).

## Where the rules live

All architecture rules are in **[`docs/README.md`](docs/README.md)** — read it first; it's a one-page index of focused topic docs (each ≤150 lines).

Topic shortcuts:

| Working on…                                    | Read                                                                                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Any non-trivial task**                       | [`docs/task-workflow.md`](docs/task-workflow.md) — phased execution + verification gates (MANDATORY)                              |
| **Implementing a Figma frame**                 | [`docs/figma-to-code.md`](docs/figma-to-code.md) — Figma MCP, icons, animations, asset structure                                  |
| **Anything new**                               | [`docs/new-screen-checklist.md`](docs/new-screen-checklist.md) — 40-step gate                                                     |
| Folder placement                               | [`docs/folder-structure.md`](docs/folder-structure.md)                                                                            |
| A component                                    | [`docs/components.md`](docs/components.md)                                                                                        |
| Fetching data                                  | [`docs/state-management.md`](docs/state-management.md) + [`docs/api-and-auth.md`](docs/api-and-auth.md)                           |
| A form                                         | [`docs/forms-validation.md`](docs/forms-validation.md)                                                                            |
| Styling / colors / fonts                       | [`docs/theming.md`](docs/theming.md)                                                                                              |
| Responsive layout / breakpoints                | [`docs/responsive-design.md`](docs/responsive-design.md)                                                                          |
| Translations / RTL                             | [`docs/i18n-and-rtl.md`](docs/i18n-and-rtl.md)                                                                                    |
| Error handling                                 | [`docs/error-handling.md`](docs/error-handling.md)                                                                                |
| A public/marketing page                        | [`docs/seo-and-ai-readability.md`](docs/seo-and-ai-readability.md) + [`docs/caching-and-runtime.md`](docs/caching-and-runtime.md) |
| Headers, CSP, CSRF, rate limit, JSON-LD safety | [`docs/security-headers.md`](docs/security-headers.md)                                                                            |
| Caching, ISR, revalidation, edge vs Node       | [`docs/caching-and-runtime.md`](docs/caching-and-runtime.md)                                                                      |
| Accessibility (a11y)                           | [`docs/accessibility.md`](docs/accessibility.md)                                                                                  |
| Deploying, env vars, CI/CD                     | [`docs/deployment-and-env.md`](docs/deployment-and-env.md)                                                                        |
| Naming anything                                | [`docs/naming.md`](docs/naming.md)                                                                                                |
| Import errors / boundaries                     | [`docs/import-boundaries.md`](docs/import-boundaries.md)                                                                          |
| Tests                                          | [`docs/testing.md`](docs/testing.md)                                                                                              |
| File too long?                                 | [`docs/file-size-limits.md`](docs/file-size-limits.md)                                                                            |

## Non-negotiable hard rules (skim before every task)

These are violated most often. Memorize them:

1. **No `fetch()` outside `src/lib/api-client.ts`.** Always go through a TanStack Query hook in `features/X/api/`.
2. **No endpoint string literal outside `src/config/endpoints.ts`.** Mirror endpoints from `website-bonyad/src/config/api.ts`.
3. **No hardcoded colors, hex, RGB, or font-family.** Use Tailwind utilities backed by tokens in `src/styles/tokens.css`.
4. **No physical Tailwind direction utilities** (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`). Use logical (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`). **Default to `-start` over `-end`** — `-end` flips alignment between English and Arabic and is almost always wrong when you're matching an RTL Figma frame. See [`docs/i18n-and-rtl.md`](docs/i18n-and-rtl.md) for the exact trap.
5. **No user-facing string in JSX.** Always `t('namespace.key')` from `react-i18next`.
6. **Features cannot import from other features.** Lift shared code to `src/components/`, `src/hooks/`, `src/utils/`, etc.
7. **No `react-native`, `react-native-web`, `expo-*`, or `nativewind`** anywhere. The legacy app at `website-bonyad/` is **reference only — never copy from it directly**.
8. **File ≤ 200 lines, function ≤ 50 lines, complexity ≤ 10, nesting ≤ 4.** ESLint-enforced. If you hit a limit, extract.
9. **Server Component by default.** Add `'use client'` only at the leaf component that needs hooks/state/events.
10. **Every public page needs SSR + metadata + JSON-LD.** See [`docs/seo-and-ai-readability.md`](docs/seo-and-ai-readability.md).
11. **JSON-LD must be HTML-escaped before `dangerouslySetInnerHTML`** and carry the CSP nonce. Use the `<JsonLd>` helper, never inline. See [`docs/security-headers.md`](docs/security-headers.md).
12. **No `process.env.X` outside `src/config/env.ts`.** All env access goes through the zod-validated `env` export. See [`docs/deployment-and-env.md`](docs/deployment-and-env.md).
13. **WCAG 2.2 AA target.** No `outline: none`, every icon-only button has `aria-label`, every form input has a real `<label>`. See [`docs/accessibility.md`](docs/accessibility.md).
14. **The legacy RN app at `website-bonyad/src/` is backend-integration reference ONLY** — read it to learn endpoints, auth flow, and request/response shapes. **Never copy UI, JSX, styling, components, or design decisions.** Visuals come from Figma. See [`docs/migration-notes.md`](docs/migration-notes.md) + [`docs/figma-to-code.md`](docs/figma-to-code.md).
15. **No invented icons.** Every icon is an SVG exported from Figma, placed in `src/components/icons/`, with `currentColor` fills/strokes. `lucide-react` is only allowed for system glyphs whose default form matches the design. See [`docs/figma-to-code.md`](docs/figma-to-code.md).
16. **Every non-trivial task is split into phases with verification gates.** Phase 0 = plan and stop. After each phase, run typecheck/lint/test, produce a phase-gate report, and wait for the user before starting the next phase. See [`docs/task-workflow.md`](docs/task-workflow.md).
17. **Pixel-perfect Figma matching is mandatory.** When implementing a frame, enumerate every section as a node ID and call `get_design_context` per section — never infer or approximate sections that fall outside the truncation window. After building each section, verify computed styles (padding, gap, font size, color, radius, icon size) against Figma via DOM inspect, and verify the layout in both `en` (LTR) and `ar` (RTL). See [`docs/figma-to-code.md`](docs/figma-to-code.md) §Pixel-perfect verification.

## How to work efficiently

- **Don't grep the whole repo** for conventions — they're in `docs/`. Read the relevant doc once.
- **Don't re-read `ARCHITECTURE.md`** — it's a thin redirect. Go straight to `docs/`.
- **Don't read the legacy `website-bonyad/src/` codebase for patterns** — only for endpoint paths, auth flow, i18n keys.
- **Use the templates** in `docs/state-management.md` and `docs/forms-validation.md` as copy-paste starting points.

## Per-folder hints (only the non-obvious ones)

- `src/app/` — **routes only.** Logic lives in `src/features/`.
- `src/components/ui/` — **shadcn/ui primitives only.** Don't put app-specific things here.
- `src/features/<f>/api/` — **one file per endpoint**, exports fetcher + query-key + hook.
- `src/features/<f>/schemas/` — zod schemas; types are derived with `z.infer`.
- `src/config/endpoints.ts` — **don't drift from `website-bonyad/src/config/api.ts`**. They must mirror.

## When you're unsure

1. Re-read the relevant doc.
2. Look at an existing feature for an example.
3. If still unclear, **ask the user** — don't guess.

## What does NOT belong in this repo

- Anything from the legacy RN codebase under `website-bonyad/` — that folder is `.gitignore`'d and frozen. Never edit it, never copy patterns from it (only read it for backend integration shape).
- React Native / Expo / NativeWind / `react-native-web` packages. This is a pure web codebase.
