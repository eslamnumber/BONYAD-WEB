# Mapping protocol — learn the codebase without burning tokens

**Mapping is a one-time, committed artifact — never a per-task live scan.**
Any time you want to "map", "get oriented", "see how X works", or "find where Y
lives" across more than ~3 files, STOP and follow this. Live recursive reading,
broad grep, or multi-agent fan-out to understand structure is a defect.

## The one rule

Look up a committed map → if missing, build it ONCE → commit → never map again.

## Which map answers your question

| You need to know…                                    | Read THIS (don't scan)                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Where a route / feature / endpoint / component lives | [`repo-map.md`](repo-map.md), [`folder-structure.md`](folder-structure.md)                |
| A convention / pattern (this Next app)               | the one topic doc via [`README.md`](README.md) (rule 24) — never grep "how we do X"       |
| An RN backend shape (endpoint, request/response)     | [`rn-call-site-index.md`](rn-call-site-index.md) → open only the mapped `file:line` ±15   |
| An iOS backend shape (Service method, Codable field) | [`ios-call-site-index.md`](ios-call-site-index.md) → open only the mapped `file:line` ±15 |

Read the map **narrowly** — `rg` the index for your symbol and open the one row,
never load a whole map file into context. That is what keeps the savings real.

## If no committed map covers it — stop at the first that works

1. **One narrow exact search.** `rg -n "ExactSymbol"` / `rg -l "endpointPath"` / `fd -t f name`.
   The reference apps are gitignored, so `fd`/`rg` skip them — add `--no-ignore` **only here,
   only for the one query**.
2. **One `Explore` subagent** (not general-purpose). State the contract in the prompt:
   _"Return ONLY `file:line` + a ≤15-line snippet/struct per hit. Never paste whole files.
   Read the relevant `docs/` topic first."_ One agent — fan out only if the work is
   independent AND large (each agent re-pays the base-context tax).
3. **Persist it.** If you'll need it again, add the row to the relevant index (or re-run its
   generator) so the next lookup is free.

## Never

- Recursive folder reads or reading whole files "to understand".
- Repo-wide grep "to see how it's usually done" (rule 24 — it's in `docs/`).
- Re-mapping what a committed map already covers.
- Reading reference apps (`website-bonyad/`, `bonayd-ios/`) for anything but backend
  shapes, and only via their index.

## Regenerating maps (deterministic, no LLM tokens)

| Command              | Output                        | Covers                                           |
| -------------------- | ----------------------------- | ------------------------------------------------ |
| `pnpm gen:repo-map`  | `docs/repo-map.md`            | routes / features / endpoint groups / components |
| `pnpm gen:rn-index`  | `docs/rn-call-site-index.md`  | RN endpoint constant → call-site `file:line`     |
| `pnpm gen:ios-index` | `docs/ios-call-site-index.md` | iOS Service method + Model type → `file:line`    |

The reference folders are frozen → their indexes never drift. Re-run `gen:repo-map`
after adding a route or feature (rule 22 — ships in the same PR).
