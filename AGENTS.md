# AGENTS.md — Bonyad web app (Next.js 15 App Router)

This file is the cross-tool equivalent of [`CLAUDE.md`](CLAUDE.md) — many AI coding agents (OpenAI Codex, Cline, Aider, generic agents) look for `AGENTS.md` at the repo root. Content is aligned with `CLAUDE.md`.

## What this repo is

The Bonyad Next.js 15 App Router web app. A marketplace connecting customers with verified construction/service technicians in Saudi Arabia. Backend is REST.

## The `website-bonyad/` folder (frozen legacy)

The folder `website-bonyad/` at the repo root holds the **frozen legacy React Native + Expo codebase** that pre-dated this rewrite. It is **`.gitignore`'d** and **never modified again**.

Use it ONLY as read-only reference for:

- Backend endpoints (`website-bonyad/src/config/api.ts`)
- Auth flow shape (login → validate-token → refresh-token)
- Request/response shapes
- Role gating logic
- Existing translation key inventory

**Never copy UI, JSX, components, styling, design tokens, or visual decisions from `website-bonyad/`.** Designs come from Figma — see [`docs/figma-to-code.md`](docs/figma-to-code.md).

## How to start any task in this repo

1. Open [`CLAUDE.md`](CLAUDE.md) at the repo root — it lists all 16 hard rules and routes to topic docs.
2. Open [`docs/task-workflow.md`](docs/task-workflow.md) — **phased execution is mandatory for any non-trivial task.**
3. Read only the topic doc(s) under [`docs/`](docs/) relevant to the current task. Index: [`docs/README.md`](docs/README.md). For any visual work, also consult [`docs/responsive-design.md`](docs/responsive-design.md) (mobile-first breakpoints, layout patterns, device-matrix tests).
4. If the user gives a Figma link, read [`docs/figma-to-code.md`](docs/figma-to-code.md) and confirm the Figma MCP is connected before doing anything.

## Phased execution (anti-hallucination contract)

Every non-trivial task runs as **6 phases** with a verification gate at the end of each (see [`docs/task-workflow.md`](docs/task-workflow.md)):

- **Phase 0**: Read & plan. List files to touch, endpoints, Figma assets, missing tokens. **Stop, wait for "go".**
- **Phase 1**: zod schemas + mirror endpoints from `website-bonyad/src/config/api.ts`.
- **Phase 2**: API hooks + MSW handlers.
- **Phase 3**: Assets — icons from Figma → `src/components/icons/` with `currentColor`. Lottie → `public/animations/`. Missing tokens → `src/styles/tokens.css`.
- **Phase 4**: Components + route + metadata + JSON-LD + animations.
- **Phase 5**: Tests (Vitest + RTL + MSW + Playwright + `vitest-axe`).
- **Phase 6**: Walk through the 40-step new-screen-checklist.

After each phase: run `pnpm typecheck && pnpm lint && pnpm test` and produce a phase-gate report. **Then stop and wait for "next".** Do not collapse phases.

## For ad-hoc chats

Open [`docs/ai-onboarding.md`](docs/ai-onboarding.md), paste it into the chat, then start the task.
