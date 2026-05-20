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

1. **No `fetch()` outside `src/lib/api-client.ts`.** Always go through a TanStack Query hook in `features/X/api/`. **Strict request schemas, permissive response types** — request bodies use zod, response shapes use a TS `type` (never `z.enum` on a backend-controlled string field, never a strict response schema passed to `apiClient`). Strict zod on a response surfaces as a misleading "Something went wrong" the day the backend adds an enum value. See [`docs/api-and-auth.md`](docs/api-and-auth.md) §Schema strategy. **Every new `features/X/api/*.ts` ships with a sibling `*.test.ts` in the same PR** covering: (a) happy path — fetcher returns the parsed result and the request body matches the RN call site; (b) one representative 4xx that surfaces as `ApiError` with `messageEn` / `messageAr` / `errorCode` populated; (c) every special-state branch (pending / OTP / `errorCode`-driven redirect / phone-normalisation / etc.). Form tests do NOT satisfy this rule — they exercise the integration, not the fetcher's branching. See [`docs/testing.md`](docs/testing.md) §Per-endpoint tests.
2. **No endpoint string literal outside `src/config/endpoints.ts`.** Mirror endpoints from `website-bonyad/src/config/api.ts`. Before adding a new endpoint integration: `curl` the real backend for ≥3 response cases (success / 4xx / edge) and copy field reads from the matching `website-bonyad/src/screens/` call site — never guess field names. See [`docs/api-and-auth.md`](docs/api-and-auth.md) §Before adding any new endpoint integration.
3. **No hardcoded colors, hex, RGB, or font-family.** Use Tailwind utilities backed by tokens in `src/styles/tokens.css`.
4. **No physical Tailwind direction utilities** (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`). Use logical (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`). **Default to `-end` over `-start` for card / content alignment** — the direction mapping is **inverted** (`en → rtl`, `ar → ltr`) per `LOCALE_DIRECTION` in `src/types/locale.ts`, so `-end` resolves to **right in Arabic, left in English** (matches Figma's RTL-first designs and mirrors automatically when the locale toggles). Never read `locale === 'ar'` directly — go through `LOCALE_DIRECTION` or logical CSS. Directional icons (chevrons, back/forward arrows) use a single `ChevronRight` + `ltr:-scale-x-100`, never a `dir === 'rtl' ? ChevronLeft : ChevronRight` conditional. See [`docs/i18n-and-rtl.md`](docs/i18n-and-rtl.md).
5. **No user-facing string in JSX.** Always `t('namespace.key')` from `react-i18next`.
6. **Features cannot import from other features.** Lift shared code to `src/components/`, `src/hooks/`, `src/utils/`, etc.
7. **No `react-native`, `react-native-web`, `expo-*`, or `nativewind`** anywhere. The legacy app at `website-bonyad/` is **reference only — never copy from it directly**.
8. **File ≤ 200 lines, function ≤ 50 lines, complexity ≤ 10, nesting ≤ 4, params ≤ 4, JSX depth ≤ 5. ESLint-enforced. NO EXCEPTIONS.** This applies **before you write the first line**, not as a lint cleanup pass. Concretely, the AI MUST: (a) include "extraction points" in the Phase 0 plan whenever a file will plausibly exceed 150 lines or a function 40 (the soft thresholds — extract earlier, not at the cap); (b) if a `Write` or `Edit` produces a file that would cross the cap, STOP and extract before continuing — never ship code that fails the lint cap with intent to "fix later"; (c) when a sibling file is already at the cap (e.g. existing 203-line file), the AI's first move is to refactor it down before adding the new code, in the same PR; (d) test files have a 400-line cap; (e) the exemption list (`src/styles/tokens.css`, `src/locales/**`, `src/config/endpoints.ts`, generated files) is closed — no other file is exempt. Extraction patterns are documented in [`docs/file-size-limits.md`](docs/file-size-limits.md) §What to do when you hit a limit. Gaming the limits with `helpers-1.ts` / `part-a.ts` is itself a defect; each split must have a clear name and a single responsibility.
9. **Server Component by default.** Add `'use client'` only at the leaf component that needs hooks/state/events.
10. **Every public page needs SSR + metadata + JSON-LD.** See [`docs/seo-and-ai-readability.md`](docs/seo-and-ai-readability.md).
11. **JSON-LD must be HTML-escaped before `dangerouslySetInnerHTML`** and carry the CSP nonce. Use the `<JsonLd>` helper, never inline. See [`docs/security-headers.md`](docs/security-headers.md).
12. **No `process.env.X` outside `src/config/env.ts`.** All env access goes through the zod-validated `env` export. See [`docs/deployment-and-env.md`](docs/deployment-and-env.md).
13. **WCAG 2.2 AA target.** No `outline: none`, every icon-only button has `aria-label`, every form input has a real `<label>`. See [`docs/accessibility.md`](docs/accessibility.md).
14. **The legacy RN app at `website-bonyad/src/` is backend-integration reference ONLY** — read it to learn endpoints, auth flow, and request/response shapes. **Never copy UI, JSX, styling, components, or design decisions.** Visuals come from Figma. See [`docs/migration-notes.md`](docs/migration-notes.md) + [`docs/figma-to-code.md`](docs/figma-to-code.md).
15. **No invented icons.** Every icon is an SVG exported from Figma, placed in `src/components/icons/`, with `currentColor` fills/strokes. `lucide-react` is only allowed for system glyphs whose default form matches the design. See [`docs/figma-to-code.md`](docs/figma-to-code.md).
16. **Every non-trivial task is split into phases with verification gates.** Phase 0 = plan and stop. **Screen-building (phase 5) is sub-phased one section at a time — solo is the default.** Every named section in the Figma frame is its own sub-phase, gets its own `get_design_context` call, and its own 5-axis gate. Bundling is reserved for the rare case of pure separator bands (single-layer, no content, no background of their own); building two non-trivial sections in one sub-phase is a defect, not a shortcut, even if the user says "just finish the next one". After each phase / sub-phase, produce a gate report and **STOP** — do not auto-continue. See [`docs/task-workflow.md`](docs/task-workflow.md) §Section sub-phasing.
17. **Read the Figma layer tree. The screenshot is BANNED as a code-derivation source.** For every section being built, call `get_metadata` (planning) and `get_design_context` (per-section, fresh — never reuse the top-frame response), walk every layer including all background layers (section fill, gradients, blur blobs, decorative shapes, image fills), and pair each layer with a planned DOM element (kept / inlined / dropped — no silent skips; dropped layers must be listed in the gate report with a reason). The screenshot may be opened ONCE per section as a sanity reference; it may NOT be used to count sections, measure spacing, pick a color, infer a gradient, or decide which layers exist. Any JSX whose values cannot be traced back to a layer property or token is a defect. See [`docs/figma-to-code.md`](docs/figma-to-code.md) §The contract.
18. **Pixel-perfect Figma matching is mandatory, including backgrounds, verified per section on 5 axes.** Enumerate every section as a node ID in phase 0; build one section at a time in phase 5; for each section, walk its layer tree (content + backgrounds) and then verify (a) layer fidelity vs the enumerated layer list — every kept layer rendered, every dropped layer absent, no untraceable wrappers, (b) computed styles vs Figma including section backgrounds, gradient stops + angle + positions, decorative blur blobs, and background images (real exports under `public/images/bg/`, never a CSS gradient substituting for an image fill), (c) RTL mirror, (d) dark mode (every surface incl. background layers from a token with both `:root` and `.dark` values), (e) responsive at 320/768/1280 with hardcoded-coordinate background blobs gated behind `xl:`. See [`docs/figma-to-code.md`](docs/figma-to-code.md) §Pixel-perfect verification.
19. **Every token in `:root` MUST have a `.dark` counterpart in `src/styles/tokens.css`.** No silent skips. Dark mode is verified per section, not at end-of-screen. See [`docs/theming.md`](docs/theming.md) §Rules rule 7.
20. **Mobile-first ALWAYS — every section's base classes target 320 px.** No hardcoded pixel widths/heights on layout containers at the base level (`w-[1200px]`, `h-[622px]`, `max-w-[1440px]` — banned). Desktop Figma pixel sizes appear ONLY behind `md:` / `lg:` / `xl:` variants with a mobile-first base (`w-full`, `min-h-[…]`). Decorative absolute-positioned elements with hardcoded coordinates (`absolute start-[Npx] top-[Npx]`) must be `hidden lg:block`. No `overflow-x-auto` carousels of fixed-width cards — use responsive grids so every card is visible at every breakpoint. Verify at 320 / 768 / 1280 with the assertion script in `docs/responsive-design.md` §Phase-gate responsive verification. See [`docs/responsive-design.md`](docs/responsive-design.md) §Hard rules + §Anti-pattern catalogue.
21. **Icons are the exact SVG export from the Figma node — never redrawn.** Same `viewBox`, same path data, same dimensions. The only allowed edits are replacing hardcoded `fill`/`stroke` with `currentColor`, stripping placeholder `<title>`/`<desc>`, and whitespace reformatting. Filename = Figma node name in kebab-case. If the export looks wrong, fix the Figma file; do not patch the SVG. See [`docs/figma-to-code.md`](docs/figma-to-code.md) §Icons.
22. **Every PR that adds or moves a feature / endpoint / token / icon / env var / shared component MUST ship the matching architecture-doc edit in the same PR.** Doc drift is review-blocking. The phase-gate report names the doc files touched (or "no doc update required" with a reason). See [`docs/doc-maintenance.md`](docs/doc-maintenance.md).

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
