# Parallel execution within a phase

Phased execution ([task-workflow.md](task-workflow.md)) is sequential **across sections** — one section per sub-phase, one gate at a time, no exceptions. But **within a single phase**, independent work can — and should — run in parallel. This doc lists what is parallel-safe, what must stay sequential, and how to dispatch.

The goal is speed without giving up the no-hallucination guarantee. Sections stay solo because they need a fresh layer-tree call and a 5-axis gate. Everything that's read-only or operates on independent files can run concurrently.

## Parallel-safe (same message, multiple tool calls)

| Phase                   | Parallel-safe work                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0 — Plan**            | `get_metadata` on the top frame (single call — `get_variable_defs` and section-root fetches are deferred to Phase 0.5 by design)                                                                                                                                                                                                   |
| **0.5 — Skeleton scan** | **All section-root `get_design_context` calls in one message + `get_variable_defs` on the top frame in the same message.** The skeleton scan is the biggest single parallel fan-out in the lifecycle — one tool call per section root plus one for variable defs, all in the first message. See §Concrete dispatch examples below. |
| **1 — Schemas**         | Schema files for **independent** endpoints (no cross-dependency)                                                                                                                                                                                                                                                                   |
| **2 — API hooks**       | Hook files for independent endpoints; MSW handlers for unrelated endpoints                                                                                                                                                                                                                                                         |
| **3 — Assets**          | Icon exports (each is a separate file); asset `file <path>` integrity checks; Lottie downloads                                                                                                                                                                                                                                     |
| **5 — Layer walk**      | `get_design_context` on **sibling** child nodes at the same depth (mandatory parallel — sequential siblings are a defect). The section root itself is a cache hit from Phase 0.5 — never re-fetched. See [figma-layer-walk.md](figma-layer-walk.md).                                                                               |
| **6 — Tests**           | Test files for unrelated features                                                                                                                                                                                                                                                                                                  |

How to dispatch:

- **Multiple tool calls in one message** when the orchestrator can run them itself (typical for `get_design_context` siblings, `Read` calls, `Bash` checks).
- **Multiple `Agent` tool calls in one message** when the work needs its own context window — e.g. exporting 8 icons (`Agent` × 8 with `subagent_type: general-purpose`), or fetching design context across an entire branch of the layer tree (`Agent` × N with `subagent_type: Explore`).

The orchestrator (this assistant) **collects all results, deduplicates, and writes the consolidated gate report**. Parallel work doesn't bypass the gate — it just lets the gateable work arrive faster.

## Must stay sequential

| Work                                                              | Why                                                                                                                                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 5 across sections                                           | One section per sub-phase; the next section's layer walk depends on the prior section's gate result. Never two sections in parallel.                            |
| Schema → hook → UI for the **same** endpoint                      | UI needs the hook signature; hook needs the schema.                                                                                                             |
| A sub-sub-phase's verification gate before the next sub-sub-phase | Component B's variant might re-use Component A's primitives — gate A first.                                                                                     |
| Layer walk inside a single section, parent → child                | A child's `node_id` is only known after its parent's `get_design_context` returns. Sibling fetches at the same depth ARE parallel (see above).                  |
| Cross-section work                                                | Bundling sections is already banned by [task-workflow.md](task-workflow.md) §Section sub-phasing. Parallel sections are the same defect with a different label. |
| Writes to the same file                                           | Two agents editing `tokens.css` simultaneously is undefined behaviour. One agent owns the file per phase.                                                       |

## The merge step (mandatory after every parallel dispatch)

After a parallel batch finishes, the orchestrator must:

1. **Collect every sub-result** into a single list. No silent drops — if 8 agents were dispatched and 7 returned, the 8th is investigated, not ignored.
2. **Deduplicate.** Sibling layer walks often re-fetch the same shared component (a `Button` instance used in 3 cards) — keep one copy in the consolidated layer list.
3. **Confirm the dependency graph holds.** If Agent A's output was supposed to feed Agent B, and A failed, B's result is suspect — re-run B with A's now-known output.
4. **Write the gate report from the consolidated result**, not from any individual agent's report. The phase gate is the orchestrator's gate, not the sub-agents'.

If the merge can't be done cleanly (results conflict, agents wrote different values for the same node), the parallel dispatch failed — drop back to sequential for that work and document why in the gate report.

## Concrete dispatch examples

**Phase 0, top-frame metadata (1 tool call):**

```
get_metadata(top_frame_id)
```

Phase 0 is deliberately minimal — section IDs + tentative risk scores come from this one response. Variable defs, screenshots, and section-root walks are deferred to Phase 0.5.

**Phase 0.5, skeleton scan (1 + N tool calls in one message — the big fan-out):**

```
get_variable_defs(top_frame_id)
get_design_context(section_a_root)
get_design_context(section_b_root)
get_design_context(section_c_root)
get_design_context(section_d_root)
…
get_design_context(section_n_root)
```

For a screen with 8 sections, that's 9 tool calls in a single message. All responses go into the session-wide `visited_nodes` cache; Phase 5's deep walks reuse the section-root entries.

**Phase 3, asset export (4 Agent calls in one message):**

```
Agent(prompt: "Export icon X from Figma node X, save to src/components/icons/x.svg, run file check")
Agent(prompt: "Export icon Y …")
Agent(prompt: "Export icon Z …")
Agent(prompt: "Download Lottie animation W …")
```

**Phase 5, sibling layer walks within a section (N tool calls in one message):**

```
get_design_context(child_node_1)
get_design_context(child_node_2)
get_design_context(child_node_3)
…
```

After each batch, the orchestrator consolidates and runs the phase gate.

## Anti-patterns

- **Parallel agents writing into the same file.** One agent owns the file. If two agents would touch it, queue them.
- **Parallel sections.** Sections are sequential, always. "I'll do 5a and 5b in parallel" is a defect — both fail the layer-walk completeness check because the orchestrator's context can't hold two fresh layer trees coherently.
- **Skipping the merge step.** "All 8 agents reported success ✅" is not the gate; the gate is the consolidated result.
- **Parallel work to compensate for a missing dependency.** If a parallel batch needs the prior phase's output and the prior phase isn't done, the parallel batch is premature.
- **Parallel `get_design_context` calls down a parent→child chain.** Children are only addressable after the parent returns. Siblings parallel, lineage sequential.

## How to declare parallelism in the gate report

Every gate report names what ran in parallel and what didn't:

```
Phase 3 (assets) — parallel dispatch summary
- 6 icons exported in parallel (1 Agent each): step-a.svg, step-b.svg, …
- 1 Lottie download in parallel: empty-state.json
- Merged: 7 assets total, all passed file-integrity check.
- Sequential follow-up: barrel file src/components/icons/index.ts (single writer)
```

A gate report that doesn't mention parallel dispatch is presumed sequential — which is fine, but slower than it could be.
