# GitHub Copilot instructions — Bonyad web app

This repo is the Bonyad Next.js 15 App Router web app. Backend is REST.

The folder `website-bonyad/` at the repo root is the **frozen legacy React Native codebase**. It is `.gitignore`'d and never modified. Use it only as read-only reference for backend endpoints, auth flow, role gating, and request/response shapes. **Never copy UI, JSX, components, styling, or design from it.** Designs come from Figma.

## Hard rules when generating code in this repo

1. No `fetch()` outside `src/lib/api-client.ts`. Always go through a TanStack Query hook in `features/<f>/api/`.
2. No endpoint string literal outside `src/config/endpoints.ts` (mirror from `website-bonyad/src/config/api.ts`).
3. No hardcoded colors / hex / RGB / font-family. Use Tailwind utilities backed by tokens in `src/styles/tokens.css`.
4. No physical Tailwind direction utilities (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`). Use logical (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`).
5. No user-facing string in JSX — use `t('namespace.key')`. Keys go in both `src/locales/en.json` and `ar.json`.
6. Features cannot import from other features.
7. No `react-native`, `react-native-web`, `expo-*`, or `nativewind` anywhere.
8. File ≤ 200 lines, function ≤ 50 lines, complexity ≤ 10, nesting ≤ 4.
9. Server Component by default in `src/app/`. `'use client'` only at leaf components that need hooks/state/events.
10. Public pages need SSR + `generateMetadata` + JSON-LD (escaped + CSP nonce).
11. No `process.env.X` outside `src/config/env.ts`.
12. WCAG 2.2 AA: no `outline: none`, every icon-only button has `aria-label`, every form input has a `<label>`.
13. Icons are SVGs exported from Figma to `src/components/icons/` with `currentColor` — never invent icons.
14. Non-trivial tasks use phased execution per `docs/task-workflow.md` (Phase 0 plan → stop → 1 schemas → 2 hooks → 3 assets → 4 components → 5 tests → 6 review).

## Naming and structure

- Files and folders: `kebab-case`.
- Components: `PascalCase` named exports.
- Hooks: `useCamelCase`.
- Query hook (list/single): `useProjects` / `useProject`.
- Mutation hook: `useCreateProject`, `useDeleteBid`.
- Zod schemas: `xxxSchema`. Types via `z.infer`.
- Translation keys: `feature.section.key` matching the feature folder.
- Test files next to source: `xxx.test.ts(x)`.
- E2E specs in `e2e/xxx.spec.ts`.

## Layered imports (enforced by ESLint)

```
app/  → features/  → shared (components, hooks, stores, lib, utils, types, config)
features/A/ cannot import from features/B/
shared cannot import from features/ or app/
```

## When unsure

Read the relevant doc in `docs/` (index at `docs/README.md`). Don't guess endpoint names, token values, or icon shapes.
