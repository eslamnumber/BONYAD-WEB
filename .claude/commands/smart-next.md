---
description: Low-token, production-quality task workflow for this Next.js + TS app
argument-hint: <the specific task to do>
---

# /smart-next — surgical task execution

Task: **$ARGUMENTS**

Do this with the **fewest tokens** and **no repo mapping**. Follow the steps in order; never skip the report.

## 0. Constraints (always on)

- **Mapping is a committed lookup, never a live scan** — obey [`docs/mapping-protocol.md`](../../docs/mapping-protocol.md). Before any broad search / `Explore` / "get oriented", read the committed map and open only the `file:line` it points to.
- Conventions live in `docs/` — per CLAUDE.md rule 24, read the one relevant topic doc (via `docs/README.md`) instead of grepping for how the repo does something.
- Read **2–5 files max**, narrow `offset`/`limit` ranges, not whole files.
- Search **exact only**: `rg -n "Symbol"`, `fd -t f name`. Never read `node_modules .next out dist build coverage .turbo .git logs playwright-report test-results`.
- Never read `.env*` (real env) or secrets. `.env.example` is allowed for var names.

## 1. Understand

Restate the task in 1–2 lines: the change, the expected outcome, the ambiguity. If genuinely blocked on a decision, ask — don't guess.

## 2. Locate (mapping gate — `docs/mapping-protocol.md`)

- **Where it lives** → `docs/repo-map.md` (routes / features / endpoints / components). Don't `Explore`.
- **Backend shape (RN/iOS)** → `docs/rn-call-site-index.md` / `docs/ios-call-site-index.md` → open only the mapped `file:line` ±15.
- **Symbol / type** → `rg -n "export (function|const|class) Name"` (definition), `rg -n "Name\(|<Name"` (usages), `fd -t f name` (file), `pnpm typecheck` (exact type error + file:line). This is "go to definition" — no LSP MCP is wired up, so `tsc` + exact `rg` is the code intelligence.
- **Not in any map?** One narrow `rg` (add `--no-ignore` only for the reference apps), else **one `Explore` subagent** returning only `file:line` + a ≤15-line snippet — then persist the row.

## 3. Name the files (and why)

List the **2–5** files to open/edit, one-line reason each. If the list exceeds 5, narrow the task first.

## 4. Edit only what's necessary

- Match surrounding style. Respect the hard rules (tokens-only, logical RTL utils, `t()` strings, file ≤200 / fn ≤50, no `fetch` outside `api-client`, no endpoint literals outside `config/endpoints.ts`).
- Smallest diff that fully solves it. No drive-by refactors.

## 5. Cheapest useful check (run only what the change can break)

- types touched → `pnpm typecheck`
- lint-prone edit → `pnpm lint` (or `eslint` the file)
- logic / behavior → nearest `pnpm test` (target the file, not the suite)
- route / SSR / config / build → `pnpm build`

Paste the real output. Don't claim green without it.

## 6. Report

- **Changed files** — path + one line each.
- **What changed** — 2–4 bullets.
- **Checks run** — command + result (pass/fail + key line).
- **Risks / follow-ups** — anything unverified or deferred.
