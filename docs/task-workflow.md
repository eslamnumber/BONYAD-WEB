# Task workflow — phased execution with verification gates

Every non-trivial task (new screen, new feature, refactor, integration) is broken into **phases**. Each phase has a clear deliverable, a verification gate, and an explicit hand-off before the next phase starts. **No phase is skipped, no two phases collapse into one.**

This is mandatory for AI work because skipping phases is the #1 cause of hallucination — symbols invented, types guessed, files referenced that don't exist.

## Why phases

- **Smaller blast radius.** A wrong assumption in phase 2 is caught before phase 3 builds on it.
- **Verifiable handoffs.** Each phase ends with a check the user can re-run.
- **Token efficiency.** The AI loads only the docs and files relevant to the current phase, not the whole world.
- **Sane PR diffs.** Reviewers see logical chunks, not a 2,000-line dump.

## The standard 6 phases

For a typical new-screen task driven by a Figma link:

| #     | Phase                              | Deliverable                                                                                                                                                                                          | Verification gate                                                                                                               |
| ----- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **0** | **Read & plan**                    | (a) Confirm Figma MCP is connected. (b) List relevant `docs/*.md` to consult. (c) List every file to create or touch. (d) List every API endpoint needed. (e) List every asset to export from Figma. | User explicitly says "go to phase 1".                                                                                           |
| **1** | **Schemas + types + endpoints**    | zod schemas in `features/<f>/schemas/`. Endpoint entries in `config/endpoints.ts` mirroring `website-bonyad/src/config/api.ts`.                                                                      | `pnpm typecheck` passes. No `any`.                                                                                              |
| **2** | **API hooks**                      | One file per endpoint in `features/<f>/api/`. Query-key factories.                                                                                                                                   | `pnpm typecheck` + `pnpm lint` pass. MSW handlers added.                                                                        |
| **3** | **Assets**                         | Icons exported from Figma to `src/components/icons/`. Illustrations to `src/components/illustrations/`. Lottie to `public/animations/`. Tokens missing from `tokens.css` added.                      | Every asset filename matches the Figma node name (kebab-case). `currentColor` applied to SVGs.                                  |
| **4** | **Components + route + metadata**  | Screen component in `features/<f>/components/`. Route file under `app/`. `metadata` / `generateMetadata`. JSON-LD if public. Animations wired per Figma metadata.                                    | Screen renders in browser. All four states (pending/error/empty/success) verified. EN + AR + light + dark all checked manually. |
| **5** | **Tests**                          | Unit tests for non-trivial logic + zod schemas. MSW handlers wired in tests. One Playwright spec for the happy path. `vitest-axe` assertion.                                                         | `pnpm test` + `pnpm test:a11y` pass.                                                                                            |
| **6** | **Final review against checklist** | Walk through every box of [new-screen-checklist.md](new-screen-checklist.md). Document any deliberately skipped box in the PR description.                                                           | All 40 boxes checked, or the skip is justified in writing.                                                                      |

## Phase gate — what verification looks like

At the **end of every phase**, Claude must:

1. **Run the gate commands** explicitly (typecheck, lint, test, build — whichever applies to the phase) via Bash and paste the result. No claiming success without running.
2. **Re-check the rules** for that phase against the relevant `docs/*.md`. A short bulleted "verified vs rules: …" list, not a vague claim.
3. **List the files created/modified** in the phase, with one-line summaries.
4. **Stop and wait for the user** to say "next" before starting the following phase. No silent transitions.

Sample phase-gate report Claude must produce:

```
Phase 2 (API hooks) — gate report
- Files: features/projects/api/get-projects.ts, create-project.ts, index.ts
- `pnpm typecheck` ✅
- `pnpm lint`      ✅
- MSW handlers added in src/testing/handlers/projects.ts
- Rules verified:
  - One file per endpoint (state-management.md §3) ✅
  - Query-key factory exported (state-management.md §5) ✅
  - No fetch outside apiClient (api-and-auth.md §1) ✅
  - File size <200 lines (file-size-limits.md) ✅
- Open questions: none.
- Ready for phase 3?
```

## Anti-hallucination guards (run at every phase)

- **Before importing any symbol**, grep for it. If it doesn't exist, stop and decide: create it (and add to the phase plan) or correct the assumption.
- **Before referencing an endpoint**, open `config/endpoints.ts`. The literal must exist.
- **Before using a token**, open `src/styles/tokens.css`. If missing, add it explicitly in this phase, not silently.
- **Before claiming a test passed**, actually run it. Output goes in the gate report.
- **Before quoting a doc rule**, re-read the doc — rules drift, and citing from memory is a hallucination risk.

## Variants

| Task type                                  | Phase set                                                                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| New screen (default)                       | All 6 phases above.                                                                                                                              |
| Tiny UI tweak (≤ 1 file, no schema change) | Phase 0 (plan) → Phase 4 (change + verify) → Phase 6 (re-checklist). Skip 1, 2, 3, 5 if truly N/A — and say so in phase 0.                       |
| Refactor                                   | Phase 0 → Phase 1 (define target shape) → Phase 4 (move) → Phase 5 (tests still pass).                                                           |
| Bug fix                                    | Phase 0 → Phase 5 (failing test first) → Phase 4 (fix) → Phase 6 (regression check).                                                             |
| Backend integration spike                  | Phase 0 (read RN's `website-bonyad/src/config/api.ts` flow) → Phase 1 (mirror endpoints + zod) → Phase 2 (hooks) → stop. No UI in the same task. |

The variant must be declared at phase 0 with a one-line rationale.

## How the user drives this

- **Give Claude the task + the Figma link + any context.**
- **Claude produces the phase 0 plan and stops.**
- **You say "go" (or push back).**
- **Claude executes one phase, produces the gate report, stops.**
- **Repeat until phase 6.**

If Claude tries to skip ahead or collapse phases, push back: "do phase N first". This is the contract.

## Why "stop after each phase"

The doc rules are tight ([file-size-limits.md](file-size-limits.md), [import-boundaries.md](import-boundaries.md), [theming.md](theming.md), [i18n-and-rtl.md](i18n-and-rtl.md), [accessibility.md](accessibility.md), [security-headers.md](security-headers.md), [seo-and-ai-readability.md](seo-and-ai-readability.md)). Even one phase done sloppily breaks downstream phases. The gate is cheaper than a debugging session.
