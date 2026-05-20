# Bonyad Web — Architecture Docs

Single source of truth for how the new Next.js app at `web/` is built. Every rule is binding; break one only with a justifying comment and a PR discussion.

Inspired by [bulletproof-react](https://github.com/alan2207/bulletproof-react), adapted for this project.

## How to use these docs

- **Any non-trivial task?** Start with [task-workflow.md](task-workflow.md) — phased execution is mandatory.
- **Adding ANYTHING that lives in `src/` or `config/`?** Read [doc-maintenance.md](doc-maintenance.md) — every new feature, endpoint, token, env var, route, or shared component ships with the matching doc edit in the same PR.
- Implementing a Figma frame? Read [figma-to-code.md](figma-to-code.md) for the Figma MCP workflow, icons, and animations.
- Adding a new screen? Start with [new-screen-checklist.md](new-screen-checklist.md).
- Adding a public/marketing page? Also read [seo-and-ai-readability.md](seo-and-ai-readability.md) + [caching-and-runtime.md](caching-and-runtime.md).
- Touching styles? Read [theming.md](theming.md) + [responsive-design.md](responsive-design.md).
- Touching data? Read [api-and-auth.md](api-and-auth.md) + [state-management.md](state-management.md).
- Touching headers, cookies, CSP, JSON-LD injection? Read [security-headers.md](security-headers.md).
- Anything user-facing? Read [accessibility.md](accessibility.md).
- Deploying or adding an env var? Read [deployment-and-env.md](deployment-and-env.md).
- Reviewing a PR? Use [new-screen-checklist.md](new-screen-checklist.md) as the review checklist.

## Index

1. [tech-stack.md](tech-stack.md) — Locked versions and what's forbidden in this app.
2. [folder-structure.md](folder-structure.md) — Top-level layout, feature folders, hard folder rules.
3. [components.md](components.md) — 3-tier hierarchy (primitive/shared/feature) and SOLID applied.
4. [state-management.md](state-management.md) — Server state (TanStack Query) vs UI state (Zustand/useState/URL).
5. [forms-validation.md](forms-validation.md) — react-hook-form + zod patterns.
6. [import-boundaries.md](import-boundaries.md) — Strict layered imports, ESLint-enforced.
7. [naming.md](naming.md) — Every file, folder, symbol, and key naming convention.
8. [theming.md](theming.md) — CSS-variable tokens, no hardcoded colors/fonts, dark mode.
9. [i18n-and-rtl.md](i18n-and-rtl.md) — i18next init-once, `dir="rtl"` for Arabic, logical Tailwind utilities.
10. [error-handling.md](error-handling.md) — Single `ApiError` type, four layers of handling.
11. [api-and-auth.md](api-and-auth.md) — `apiClient`, endpoints, JWT auth mirroring the RN app.
12. [testing.md](testing.md) — Vitest + RTL + Playwright + MSW.
13. [file-size-limits.md](file-size-limits.md) — Hard limits on file/function size and complexity.
14. [new-screen-checklist.md](new-screen-checklist.md) — 32-step gate for every new screen.
15. [migration-notes.md](migration-notes.md) — What to copy / not copy from the legacy RN web app.
16. [seo-and-ai-readability.md](seo-and-ai-readability.md) — SSR, metadata, JSON-LD, AI crawler policy, GEO/AEO rules for public pages.
17. [seo-operational-checklist.md](seo-operational-checklist.md) — What a sitemap is + every non-code task (Search Console, Bing, IndexNow, GBP, weekly/monthly maintenance).
18. [security-headers.md](security-headers.md) — CSP with per-request nonce, HSTS, CSRF, rate limiting, safe JSON-LD injection.
19. [caching-and-runtime.md](caching-and-runtime.md) — Static/ISR/dynamic/streaming decision tree, `revalidateTag`, edge vs Node, `metadataBase`.
20. [accessibility.md](accessibility.md) — WCAG 2.2 AA target, route announcer, focus/keyboard rules, axe/pa11y in CI.
21. [deployment-and-env.md](deployment-and-env.md) — Hosting target, environments, env-var schema, CI/CD pipeline, rollback.
22. [figma-to-code.md](figma-to-code.md) — Figma MCP workflow, asset folder structure, SVG icon rules, animation tiers (CSS / Framer / Lottie).
23. [task-workflow.md](task-workflow.md) — Phased execution with verification gates (anti-hallucination). Mandatory for every non-trivial task.
24. [ai-onboarding.md](ai-onboarding.md) — Paste-ready bootstrap for ad-hoc chats (web Claude, ChatGPT, etc.). Self-contained — every hard rule + the phased workflow inline.
25. [responsive-design.md](responsive-design.md) — Mobile-first breakpoints, layout patterns per screen tier (Facebook/X/LinkedIn style), container queries, touch targets, image `sizes`, per-PR device-matrix tests.
26. [doc-maintenance.md](doc-maintenance.md) — Binding rule that every new feature/file/endpoint/token/icon/env-var ships with the matching architecture-doc edit in the same PR.

## AI assistant orientation

Working with Claude Code, Cursor, or another AI tool? The repo has helper files designed for token efficiency:

- [`../CLAUDE.md`](../CLAUDE.md) — Auto-loaded by Claude Code. Lists hard rules and routes you to the right topic doc.
- `src/features/README.md`, `src/components/README.md`, `src/lib/README.md` — Per-folder orientation, ≤30 lines each.

The pattern: **AI reads `CLAUDE.md` once, then only the topic doc relevant to the current task** — far cheaper than re-reading the whole `docs/` folder per session.

## Doc rules

- Each doc stays under ~150 lines. If it grows past that, split into a follow-up doc.
- Each doc covers **one** topic. No "miscellaneous" sections.
- Code examples are short and complete — copy-pasteable.
- If a rule changes, update the doc _and_ mention it in the PR description so reviewers re-read.
