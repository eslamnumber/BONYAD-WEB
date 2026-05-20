# Doc maintenance — keep architecture docs in sync with the code

**Binding rule:** every PR that adds a new feature, file, endpoint, token, icon, route, or schema MUST also update the matching architecture doc in the same PR. Doc drift is a review-blocking defect, not a follow-up task.

This works because the docs are the contract Claude (and humans) read before writing code. A doc that lies wastes more tokens and produces more bugs than no doc at all.

## What to update when

| You added or moved…                                | Update these doc(s)                                                                                                                                                                                                          |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A new **feature folder** under `src/features/`     | [folder-structure.md](folder-structure.md) §Top-level layout (feature list) **and** the index in [README.md](README.md) if the feature warrants its own row.                                                                 |
| A new **route** under `src/app/`                   | [folder-structure.md](folder-structure.md) §Top-level layout if it's a new route group; otherwise add to `src/config/routes.ts` (no doc edit required).                                                                      |
| A new **endpoint** in `src/config/endpoints.ts`    | [api-and-auth.md](api-and-auth.md) endpoints table (if the doc lists them) **and** confirm it mirrors `website-bonyad/src/config/api.ts`.                                                                                    |
| A new **zod schema** under `features/<f>/schemas/` | [forms-validation.md](forms-validation.md) example list, only if the schema represents a new pattern (e.g. file upload, nested object). One-off schemas don't need a doc edit.                                               |
| A new **design token** in `src/styles/tokens.css`  | [theming.md](theming.md) §Rules — confirm the new token has BOTH `:root` and `.dark` values. No doc edit needed for routine additions; required only if the token introduces a new category (e.g. motion timing, elevation). |
| A new **icon** in `src/components/icons/`          | The barrel re-export in `src/components/icons/index.ts`. No `docs/` edit needed unless you add a whole new icon family.                                                                                                      |
| A new **shared component** in `src/components/`    | [components.md](components.md) §3-tier hierarchy if it introduces a new pattern; the barrel re-export in `src/components/<bucket>/index.ts` always.                                                                          |
| A new **shared hook** in `src/hooks/`              | The barrel `src/hooks/index.ts`. Add to [components.md](components.md) only if it's a generally-applicable hook (debounce, media query, etc.).                                                                               |
| A new **env var**                                  | [deployment-and-env.md](deployment-and-env.md) env-var table AND the zod schema in `src/config/env.ts`. No silent additions.                                                                                                 |
| A new **public page** (auth-less route)            | [seo-and-ai-readability.md](seo-and-ai-readability.md) page list + [seo-operational-checklist.md](seo-operational-checklist.md) (sitemap entry + crawler note).                                                              |
| Anything that changes a **hard rule**              | [CLAUDE.md](../CLAUDE.md) §Non-negotiable hard rules AND the originating topic doc. Mismatch between CLAUDE.md and the topic doc is itself a bug.                                                                            |

## Where this gets enforced

1. **Phase 0 plan must list expected doc edits** alongside file edits ([task-workflow.md](task-workflow.md) §The standard phases, phase 0(g) was tokens — the same list must call out every doc that needs updating).
2. **Every phase-gate report ends with a "Docs updated" line** naming the doc files touched, or stating "No doc update required" with a one-line reason.
3. **The new-screen checklist** ([new-screen-checklist.md](new-screen-checklist.md)) carries a final "Docs in sync" box that must be ticked.
4. **PR description** has a "Doc updates" section that mirrors the gate report. Reviewers reject PRs that add a feature folder, endpoint, or env var without the matching doc edit.

## Why this rule exists

- Architecture docs are the source of truth Claude reads at session start. A stale doc means Claude makes decisions against a fictional architecture.
- New contributors (human or AI) onboard from the docs, not from code spelunking.
- Drift is cheap to prevent (one edit at the moment of change) and expensive to repair (someone has to reverse-engineer the truth weeks later).

## What does NOT count as a doc update

- Touching unrelated typos while editing a doc — keep doc edits scoped to the actual change.
- Adding a `// TODO: document this` comment instead of editing the doc.
- "Will do in a follow-up PR." There is no follow-up PR for doc drift; if it doesn't ship with the change, it doesn't ship.
