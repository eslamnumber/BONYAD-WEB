# AI onboarding — paste-ready bootstrap for any chat

**Purpose:** copy-paste this entire file into any AI chat (web Claude, ChatGPT, Gemini, raw Claude/OpenAI API, etc.) before giving the AI a task. It tells the AI everything it needs to follow the architecture without prior context.

Skip this file when using Claude Code locally — `CLAUDE.md` and memory handle it automatically. Use it for ad-hoc chats only.

---

# BEGIN COPY-PASTE BELOW THIS LINE

You are now working on the **Bonyad** web app — a Next.js 15 App Router marketplace connecting Saudi customers with verified construction/service technicians. Backend is REST, shared with a legacy React Native app.

Before doing anything, you must follow these rules. They are binding.

## Project context

- The repo is the Bonyad Next.js 15 web app (App Router, React 19, TypeScript strict, Tailwind v4 with CSS-variable tokens, shadcn/ui, TanStack Query v5, Zustand, react-hook-form + zod, i18next, next-themes, Vitest + RTL + Playwright + MSW).
- A frozen legacy React Native codebase lives at `website-bonyad/` in the same directory tree. It is **`.gitignore`'d and never modified** — backend-integration reference ONLY. Read it to understand endpoints, auth flow, role gating, and request/response shapes. **Never copy UI, JSX, components, styling, or design decisions.** Visuals come from Figma.
- Backend API base URL: `https://bonyad-app-nyayeditqq-ww.a.run.app/api`. Endpoints are defined in `website-bonyad/src/config/api.ts` and must be mirrored exactly in `src/config/endpoints.ts`. Never invent endpoints.
- Both English and Arabic are required, full RTL. Dark mode required. No hardcoded colors/fonts.

## The 16 hard rules

1. No `fetch()` outside `src/lib/api-client.ts`. Always go through a TanStack Query hook in `features/<f>/api/`.
2. No endpoint string literal outside `src/config/endpoints.ts`. Mirror from the RN app.
3. No hardcoded colors / hex / RGB / font-family. Use Tailwind utilities backed by tokens in `src/styles/tokens.css`.
4. No physical Tailwind direction utilities (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`). Use logical: `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`.
5. No user-facing string in JSX. Always `t('namespace.key')`. Keys go in both `src/locales/en.json` and `ar.json`.
6. Features cannot import from other features. Lift shared code to `src/components/`, `src/hooks/`, `src/utils/`, `src/types/`.
7. No `react-native`, `react-native-web`, `expo-*`, or `nativewind` anywhere in this repo.
8. File ≤ 200 lines, function ≤ 50 lines, cyclomatic complexity ≤ 10, nesting ≤ 4.
9. Server Component by default. `'use client'` only at leaf components needing hooks/state/events.
10. Every public page needs SSR + `generateMetadata` + JSON-LD with the right schema.org type.
11. JSON-LD must be HTML-escaped before `dangerouslySetInnerHTML` (escape `<`, `>`, `&`) and carry a CSP nonce.
12. No `process.env.X` outside `src/config/env.ts` (zod-validated).
13. WCAG 2.2 AA: no `outline: none`, every icon-only button has `aria-label`, every form input has a real `<label>`, focus rings use the `--color-ring` token.
14. Legacy RN app is backend-integration reference ONLY. Never copy UI/JSX/styling. Designs come from Figma.
15. No invented icons. Every icon is an SVG exported from Figma to `src/components/icons/` with `currentColor` fills/strokes. `lucide-react` only for system glyphs whose default form matches the design.
16. **Every non-trivial task runs as 6 phases with verification gates.** See below — this is the most important rule.

## Phased execution (mandatory)

For any non-trivial task (new screen, new feature, refactor, integration), run these 6 phases. **At the end of each phase, run gate commands (typecheck/lint/test), produce a gate report, and STOP. Wait for the user to say "next" before continuing.** Do not collapse phases.

- **Phase 0 — Plan.** List relevant docs, files to create/touch, endpoints needed, Figma assets to export (icons + Lottie), missing tokens to add, animation strategy, open questions. STOP.
- **Phase 1 — Schemas + endpoints.** zod schemas in `features/<f>/schemas/`. Mirror endpoints to `config/endpoints.ts`.
- **Phase 2 — API hooks + MSW handlers.** One file per endpoint in `features/<f>/api/`. Query-key factories.
- **Phase 3 — Assets.** Export SVG icons from Figma → `src/components/icons/` with `currentColor`. Lottie → `public/animations/`. Missing tokens → `src/styles/tokens.css`.
- **Phase 4 — Components + route + metadata + animations.** Server Component pages. `<JsonLd>` for public pages. Animations match Figma transition metadata (CSS / Framer Motion / Lottie). Manually verify EN + AR + light + dark + all four states (pending/error/empty/success).
- **Phase 5 — Tests.** Vitest + RTL + MSW + Playwright + `vitest-axe`.
- **Phase 6 — Review against the 40-step new-screen-checklist.**

## Folder structure

```
src/
├── app/                  Routes only — no logic.
├── components/           Shared (≥2 features). ui/ = shadcn primitives.
├── features/<name>/      Vertical slice with api/, components/, hooks/,
│                         schemas/, stores/, types/, utils/, index.ts.
├── lib/                  api-client, query-client, i18n, sentry, etc.
├── config/               env (zod), endpoints (mirror), routes, constants.
├── hooks/ stores/ types/ utils/  Shared.
├── styles/tokens.css     Every design token as a CSS variable.
└── locales/{en,ar}.json  Translation keys.
```

## Naming

- Files/folders: `kebab-case`. Components: `PascalCase` named exports. Hooks: `useCamelCase`.
- Query hook: `useProjects` (list) / `useProject` (single). Mutation: `useCreateProject`.
- Zod: `xxxSchema`. Types via `z.infer`. Props: `<Name>Props`.
- Translation keys: `feature.section.key`. Test files: `xxx.test.ts(x)` next to source.

## Layered imports (ESLint enforced)

```
app/ → features/ → shared (components, hooks, stores, lib, utils, types, config)
features/A/ cannot import from features/B/
shared cannot import from features/ or app/
```

## Figma workflow

When the user gives a Figma link, do **not** start coding. Instead:

1. Confirm the Figma MCP server is connected (in Claude Code: `mcp__…__use_figma` tool). Without it you can only guess.
2. Call `get_design_context`, `get_variable_defs`, `get_screenshot` on the frame.
3. List every icon (kebab-case filenames), every animation (with Figma transition duration/easing metadata), every missing token.
4. For complex motion not expressible as CSS/Framer, ask the designer for a Lottie export.
5. Produce a Phase 0 plan and stop.

## What you can NOT do (common hallucinations)

- Invent an endpoint not in `src/config/api.ts`.
- Invent a token value or color — only use what's in `tokens.css`.
- Invent an icon — use only Figma exports.
- Copy JSX or components from `website-bonyad/src/` (legacy RN).
- Use a `lucide-react` icon when the design specifies a custom one.
- Skip a phase or merge two phases.
- Claim a gate (typecheck/lint/test) passed without running the command and pasting the result.
- Use `style={{ color: '#000' }}` or any hardcoded hex/RGB.
- Use physical Tailwind direction utilities.
- Put a user-facing string directly in JSX.

## Acknowledge before starting

Reply with: **"Acknowledged. I'll follow the 16 rules and run phased execution. What's the task?"**

Then wait for the task. When the task arrives, produce a Phase 0 plan and stop.

# END COPY-PASTE ABOVE THIS LINE

---

## How to use this file

1. Open any AI chat (web Claude / ChatGPT / Gemini / your own API call).
2. Copy everything between the `BEGIN` and `END` lines above.
3. Paste it as the first message.
4. Wait for the "Acknowledged" reply.
5. Give your task (e.g. "implement this Figma frame: <link>").

For deeper context the AI can request specific docs from `docs/` — you'd paste them on demand. If the AI has tool access to read files (Claude Code, Cursor agent mode), it can fetch them itself.

## Where this lives

- Repo: `website-bonyad/docs/ai-onboarding.md`
- Travels with `git clone`, so works on any machine.
- Also referenced from `website-bonyad/CLAUDE.md` and `AGENTS.md` so any agent that lands at the repo root finds it.
