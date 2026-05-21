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

For any non-trivial task (new screen, new feature, refactor, integration), run these 6 phases. **At the end of each phase, run gate commands (typecheck/lint/test), produce a gate report, and STOP. Wait for the user to say "next" before continuing.** Do not collapse phases. **Within a single phase, run independent work in parallel** (sibling layer fetches, icon exports, schemas for independent endpoints, test files) — one message, multiple tool calls. Sections themselves NEVER run in parallel.

- **Phase 0 — Plan (cheap).** `get_metadata` on the top frame ONLY. List relevant docs. Enumerate every section with a **tentative** risk score (HIGH/MEDIUM/LOW) derived from metadata signals. Classify each section static vs backend-driven. STOP. No deep `get_design_context`, no token/asset/file lists yet — those come in Phase 0.5.
- **Phase 0.5 — Skeleton scan.** Depth-1 shallow walk per section: one `get_design_context` per section root, **all sections fanned out in a single parallel message** + `get_variable_defs` on the top frame in the same message. Confirm or promote each risk score (truncation, ≥3 variant children, ≥5 background layers at depth 1, state-variant suffixes → auto-promote to HIGH). Lock sub-sub-phase splits. Seed the **background-layer registry**. Produce the lists previously crammed into Phase 0: files to create/touch, endpoints needed, depth-1 assets, missing tokens (with `:root` + `.dark` values), parallel-dispatch plan. Cache section roots in the session `visited_nodes` map. STOP.
- **Phase 1 — Schemas + endpoints.** zod schemas in `features/<f>/schemas/`. Mirror endpoints to `config/endpoints.ts`. Independent endpoints run in parallel.
- **Phase 2 — API hooks + MSW handlers.** One file per endpoint in `features/<f>/api/`. Query-key factories. Sibling test file per endpoint. Independent hooks run in parallel.
- **Phase 3 — Assets.** Export SVG icons from Figma → `src/components/icons/` with `currentColor`. Lottie → `public/animations/`. Missing tokens → `src/styles/tokens.css` (every `:root` value has a `.dark` counterpart). Icon exports run in parallel (one Agent per icon).
- **Phase 4 — Components + route + metadata + animations.** Server Component pages. `<JsonLd>` for public pages. Animations match Figma transition metadata (CSS / Framer Motion / Lottie). **Per section sub-phase: deep recursive BFS layer walk to every leaf + leaf pixel ledger + 5-axis gate** (layer fidelity / pixel-perfect vs ledger / RTL / dark / responsive). The section root is a cache hit from Phase 0.5 — never re-fetched. Sibling fetches at the same depth are MANDATORY parallel — sequential siblings are a defect. Append background layers to the session registry as you find them. The leaf pixel ledger is a flat table of `leaf_id → property → value → source` — every CSS value in the JSX must trace back to a ledger row. Responsive verifies the 12-width matrix: 320 / 375 / 414 / 600 / 768 / 900 / 1024 / 1100 / 1280 / 1366 / 1440 / 1920. Manually verify EN + AR + light + dark + all four states (pending/error/empty/success).
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
2. **Phase 0 (cheap)**: call `get_metadata` on the top frame only — one call. Enumerate every section as a node ID with a **tentative** risk score (HIGH/MEDIUM/LOW) and a static/backend classification. The screenshot is BANNED as a code-derivation source. Produce the Phase 0 plan and STOP.
3. **Phase 0.5 (skeleton scan)** — after the user says "go to phase 0.5": one `get_design_context` per section root + `get_variable_defs` on the top frame, **all fanned out in one parallel message**. Sections + variables resolved in a single round-trip. Confirm or promote each section's risk score from real depth-1 signal (truncation, ≥3 variant children, ≥5 background layers, state-variant suffixes → HIGH). Sub-sub-phase HIGH sections per component variant. Seed the background-layer registry. Cache every response in the session `visited_nodes` map — Phase 4's deep walks reuse these. Produce the file/endpoint/token/asset/parallel-dispatch lists. STOP.
4. **Per Phase 4 sub-phase (one section at a time): deep recursive BFS layer walk to every leaf.** Every non-leaf node (FRAME/GROUP/INSTANCE/COMPONENT/SECTION/BOOLEAN_OPERATION) gets its own fresh `get_design_context` call. Section root is a cache hit from Phase 0.5 — never re-fetched. **Sibling fetches at the same depth are MANDATORY parallel** — one message, multiple tool calls. Sequential siblings are a defect. Maintain `pending_nodes` + `visited_nodes`. The completeness gate (`total_nodes_visited + leaf_count >= metadata.descendant_count`) must pass before any JSX. Treating an `INSTANCE` as a leaf is the most common defect — instances have overridden children; fetch fresh every time.
5. **Produce the leaf pixel ledger** per section before any JSX: a flat per-leaf table of `leaf_id → property → value → source`. **Every CSS value in the JSX must trace back to a ledger row.** This is the pixel-perfect contract; the 5-axis gate's computed-styles check is verified against the ledger, not eyeballed.
6. Pair every visited layer with kept / inlined / dropped — no silent skips; dropped layers listed in the gate report with a reason. **Background layers (section fill, gradients, blur blobs, decorative shapes, image fills) are first-class** — every one appended to the session background-layer registry; Phase 6 audits the registry against the rendered page.
7. List every icon (kebab-case filenames), every animation (with Figma transition duration/easing metadata), every missing token (with both `:root` and `.dark` values).
8. For complex motion not expressible as CSS/Framer, ask the designer for a Lottie export.
9. Produce a Phase 0 plan and stop.

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

Reply with: **"Acknowledged. I'll follow the 16 rules and run phased execution (Phase 0 → 0.5 → 1 → 2 → 3 → 4 → 5 → 6) with the leaf pixel ledger as the pixel-perfect contract. What's the task?"**

Then wait for the task. When the task arrives, produce a **Phase 0 (cheap, metadata-only) plan and stop**.

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
