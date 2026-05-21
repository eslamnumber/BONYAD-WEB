# Figma layer walk — recursive BFS to every leaf

The #1 source of "this section doesn't match Figma" on this project is calling `get_design_context` once on the section root and writing JSX from the partial response. The MCP truncates nested children; the AI infers them from the screenshot; small layers (decorative dots, nested badges, inner gradient stops, deeply-nested icons) get hallucinated.

**The fix: a mandatory recursive BFS that visits every non-leaf node.** Recursion is always-on, not "only on truncation." Truncation is one trigger; the default is recurse-to-leaves regardless.

## Two kinds of walk

The walk runs twice in the lifecycle of a screen, at different depths:

| Walk           | When                          | Depth                                                                                                                                      | Output                                                                                                                |
| -------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Shallow**    | Phase 0.5 (Skeleton scan)     | **Depth 1 only** — one `get_design_context` per section root. No descent into FRAME / GROUP / INSTANCE children at this phase.             | Refined risk scores, sub-sub-phase plan, initial background-layer registry, token list, asset list visible at depth 1 |
| **Deep (BFS)** | Phase 5 sub-phase per section | **All the way to leaves** — recursive across every non-leaf node, sibling-parallel within a depth, parent→child sequential across a chain. | Full layer list, completeness-gate pass, **leaf pixel ledger**, JSX                                                   |

Both walks write to the same session-scoped `visited_nodes` cache, keyed by `node_id`. The deep walk's first action on a section is a cache lookup — the section root was walked in Phase 0.5 and MUST be reused, not re-fetched. Re-fetching a node already in `visited_nodes` is a defect (wasted tokens) unless the cached entry was truncated.

## The deep walk algorithm

For every section in its Phase 5 sub-phase, run this BFS before any JSX is written:

```
visited       = session.visited_nodes        # SHARED across phases. Populated in
                                             # Phase 0.5 (section roots) and grown
                                             # in Phase 5 (descendants).
pending       = [section_root_node_id]       # FIFO queue
non_leaf_kinds = {FRAME, GROUP, INSTANCE, COMPONENT, COMPONENT_SET,
                  SECTION, BOOLEAN_OPERATION}

while pending:
    # Take ALL nodes at the current depth so we can fetch them in parallel.
    depth_batch = list(pending)
    pending.clear()

    # Cache-deduplicate. Already-walked nodes are skipped — no re-fetch.
    fresh_targets = [n for n in depth_batch if n not in visited]

    # PARALLEL fan-out: every fresh target dispatched in ONE message,
    # multiple get_design_context tool calls in that message.
    # Sequential sibling fetches inside this loop are a defect.
    responses = parallel_get_design_context(fresh_targets)

    for node_id, ctx in responses.items():
        visited[node_id] = ctx
        for child in ctx.children or []:
            if child.type in non_leaf_kinds:
                pending.append(child.node_id)
            # leaf nodes (TEXT / VECTOR / RECTANGLE / ELLIPSE / IMAGE) are
            # captured inline in the parent's response — no extra fetch.

# Gate:
#   total_nodes_visited = count(visited[n] for n in section_subtree)
#   leaf_count          = sum(len(ctx.leaf_children) for ctx in visited.values()
#                             where ctx in section_subtree)
#   assert total_nodes_visited + leaf_count >= metadata.descendant_count_for(section_root)
```

**Sibling fetches at the same depth run in parallel — this is mandatory, not advisory.** All fresh targets at one depth go into a single message as multiple `get_design_context` tool calls. Sequential sibling fetches (one call, wait, next call) at the same depth are a defect: they waste wall-clock time and inflate token cost without changing the result. See [parallel-execution.md](parallel-execution.md) §Phase 5.

**Parent → child stays sequential.** A child's node ID is only known after its parent returns. No prefetching down a chain.

**Cache hits skip the call entirely.** If `node_id in visited` (populated by Phase 0.5 or an earlier sub-phase in the same session), reuse the cached response. The exception is a truncated cached entry — those get re-fetched, and the gate report notes the re-fetch.

## What counts as a "visited" non-leaf node

A node must be visited (its own `get_design_context` call) if its `type` is in `non_leaf_kinds` above. Specifically:

- `FRAME` — always visit. Frames hold layout + backgrounds.
- `GROUP` — always visit. Groups can hide decorative shapes.
- `INSTANCE` / `COMPONENT` / `COMPONENT_SET` — always visit. Component instances frequently have overridden children the parent response summarises.
- `SECTION` — always visit.
- `BOOLEAN_OPERATION` — visit unless it's a clearly-leaf vector (rare, judgement call — flag in the gate report).

Leaf kinds that DON'T need a separate call (the parent's response carries them in full):

- `TEXT`, `VECTOR`, `RECTANGLE`, `ELLIPSE`, `POLYGON`, `STAR`, `LINE`, `IMAGE`.

If a leaf's `fills` array references an `IMAGE` asset, the asset URL is already in the parent response — extract it there.

## The completeness gate

The section's gate report MUST include:

```
Layer walk completeness
- section_root: <node_id> (<node_name>)
- cache hits (Phase 0.5 reuse): <H>  (nodes already in visited_nodes; no fetch)
- cache misses (fresh fetches): <F>  (nodes fetched in this sub-phase)
- total_nodes_visited: <N>           (= H + F; every non-leaf got walked)
- leaf_count: <M>                    (every TEXT / VECTOR / RECTANGLE / etc. accounted for)
- metadata.descendant_count_for_section_root: <K>
- assertion: total_nodes_visited + leaf_count >= K  ✅ / ❌
- visited node IDs (full list):
    1:42, 1:43, 1:44, 1:51, 1:52, …
- parallel batches dispatched: <P> batches of avg <S> sibling fetches
- truncated re-fetches: <T>           (cached but truncated; re-fetched fresh)
```

If `total_nodes_visited + leaf_count < K`, the walk is incomplete. Go back and recurse the missing branches — never code from inference.

## Pairing every layer with a DOM element

After the BFS finishes, **pair every layer with a planned DOM element** before writing JSX. For each node in `visited` + each leaf, choose one:

- **kept** — renders as a real `<div>`/`<span>`/`<img>`/`<svg>`/`<button>`/etc.
- **inlined** — becomes a style on the parent (`bg-*`, `shadow-*`, `rounded-*` derived from this layer's fill/effect).
- **dropped** — purely decorative duplicate, or covered by a sibling layer. **Must appear in the gate report** as `dropped: <node_id> <node_name> — <reason>` so a reviewer can challenge.

No silent skips. A layer that's in the walk but not in the JSX AND not in the dropped list is a defect.

## Leaf pixel ledger — the pixel-perfect contract

Pairing layers with kept / inlined / dropped tells you **which** layers render. The leaf pixel ledger tells you **with what values**. It is a flat per-leaf table produced after the BFS finishes and before any JSX is written. **It is the hard gate** — the 5-axis pixel-perfect check (axis 1: computed styles) is verified against the ledger, not eyeballed against Figma.

### Ledger schema

One row per leaf × property. Source the value from the layer's own `get_design_context` response or `get_variable_defs` — never from the screenshot, never inferred from a sibling.

```
leaf_id   | parent_id | node_name      | property         | value                 | source
1:42      | 1:41      | Heading        | font-size        | 32px                  | get_design_context
1:42      | 1:41      | Heading        | line-height      | 40px                  | get_design_context
1:42      | 1:41      | Heading        | font-weight      | 600                   | get_design_context
1:42      | 1:41      | Heading        | color            | --color-text-pri      | get_variable_defs
1:43      | 1:41      | Card-bg        | background-color | --color-card          | get_variable_defs
1:43      | 1:41      | Card-bg        | border-radius    | 16px                  | get_design_context
1:43      | 1:41      | Card-bg        | padding-block    | 24px                  | get_design_context
1:43      | 1:41      | Card-bg        | padding-inline   | 24px                  | get_design_context
1:44      | 1:43      | Icon-frame     | width            | 48px                  | get_design_context
1:44      | 1:43      | Icon-frame     | height           | 48px                  | get_design_context
1:44      | 1:43      | Icon-frame     | box-shadow       | --shadow-card-inner   | get_variable_defs
1:45      | 1:43      | Gradient-veil  | background       | linear-gradient(180deg, #FFF0 0%, #FFF 100%) | get_design_context (fills[0])
…
```

### Properties to capture (minimum)

For every leaf, capture every property below that the layer actually defines:

- **Box model** — `width`, `height`, `padding-block`, `padding-inline`, `margin-block`, `margin-inline`, `gap`
- **Typography** — `font-family`, `font-size`, `line-height`, `font-weight`, `letter-spacing`, `text-align`
- **Color** — `color`, `background-color`, `border-color`, `fill`, `stroke`. Prefer token references over hex.
- **Geometry** — `border-radius` (per corner if asymmetric), `border-width`, `border-style`
- **Effects** — `box-shadow`, `filter` (blur for blur blobs), `opacity`, `backdrop-filter`
- **Background layers** — `background-image` (with the exported asset path), gradient stops + angle, `background-size`, `background-position`

### Ledger → JSX rule

**Every CSS value in the JSX must trace back to a ledger row.** If a developer writes `font-size: 18px` and no ledger row says `font-size = 18px` for that leaf, the value was invented — that's a defect.

The 5-axis gate's computed-style check ([figma-to-code.md](figma-to-code.md) §Pixel-perfect verification axis 1) compares the live DOM's computed style against the ledger. A mismatch on any row is a fail, even by 1px.

### Ledger goes in the gate report

The Phase 5 sub-phase gate report includes:

```
Leaf pixel ledger
- row count: 142 (38 leaves × ~3.7 properties avg)
- properties driven by tokens: 47 (every color/shadow row is a --color-*/--shadow-* reference)
- properties with raw values: 95 (sizes, paddings, weights — Figma doesn't tokenise these)
- JSX values cross-checked against ledger: 142/142 ✅
- mismatches found pre-gate: <list — or "none">
```

A sub-phase whose gate report omits the ledger summary, or whose JSX contains a value with no ledger row, is incomplete.

## Truncation handling

If a `get_design_context` response is truncated (the MCP returns a `…` placeholder or omits `children` on a known non-leaf), the orchestrator must:

1. Identify the truncation point (which child node didn't get expanded).
2. Push that child's `node_id` into `pending` and re-fetch with a fresh call.
3. Repeat until the BFS terminates with no truncated responses.

A truncated response is **not** a leaf, and treating it as one is the original failure mode this rule exists to prevent.

## Background layers are first-class

Section backgrounds (root fill, gradient overlays, blur blobs, decorative shapes, image fills) are **layers**, and every one of them gets walked, paired, and rendered. The BFS doesn't distinguish "content" from "background" — every node is visited. The gate report names every background layer separately:

```
Background layers (4):
  - section root fill (token --color-services-panel) — kept (bg on section <div>)
  - decorative blur blob 320:97 — kept (absolute, hidden lg:block, xl:start-[…])
  - gradient overlay 320:98 — inlined (bg-gradient-to-b on section root)
  - decorative pattern image 320:99 — kept (next/image, public/images/bg/…)
```

A section that ships without one of its Figma background layers is a defect, even if the gate's other axes pass.

## Background-layer registry (session-scoped)

A single ledger of every background layer found across the entire screen. **Phase 0.5 seeds it** from each section's depth-1 walk (root fill, top-level gradients, blur blobs visible at depth 1). **Each Phase 5 sub-phase appends** any deeper background layers discovered in the deep walk. **Phase 7's final review checks the registry** — no entry may be silently dropped from the final DOM.

Registry schema:

```
section | node_id  | node_name           | kind          | treatment                                  | asset path (if image)
5a      | 1:4402   | Hero gradient veil  | LINEAR_GRAD   | inlined (bg-gradient-to-b on section root) | —
5a      | 1:4405   | Hero glow blob      | ELLIPSE       | kept (absolute, hidden xl:block)           | —
5b      | 320:96   | Services pattern    | IMAGE_FILL    | kept (next/image)                          | public/images/bg/services-pattern.png
5b      | 320:97   | Services blur blob  | ELLIPSE       | kept (absolute, hidden lg:block)           | —
5c      | 1:4471   | Pricing decorator   | ELLIPSE       | kept (absolute, hidden lg:block)           | —
…
```

The registry is the audit log. When Phase 7 walks the rendered page, every registry row must correspond to a visible element (or an `inlined` style on a parent). A row with no DOM correspondence is a silent drop and a defect.

The registry doubles as the cross-section sanity check: if two sections claim the same background-blob node_id, one of them is wrong — the layer belongs to one section's tree, not two.

## Anti-patterns

- **Calling `get_design_context` once on the section root and writing JSX from the partial response.** This is the failure mode this entire doc exists to prevent. Recurse, always.
- **Treating `INSTANCE` nodes as leaves** ("it's a button, I know what it looks like"). Instances frequently have overridden text, colour, or hidden children — fetch fresh every time.
- **Inferring nested layers from the screenshot.** The screenshot is banned as a code-derivation source ([figma-to-code.md](figma-to-code.md) §The contract). If you don't have the layer in `visited`, you don't write it.
- **Skipping the completeness gate.** "Looks good visually" is not the gate; `total_nodes_visited + leaf_count >= K` is the gate.
- **Sequential sibling fetches.** Defect, not "slower." Same-depth siblings MUST go in one message as parallel `get_design_context` calls.
- **Skipping the leaf pixel ledger.** A sub-phase that writes JSX without producing the ledger has no defensible source for its CSS values — the screenshot fills the gap, and the section drifts.
- **Re-fetching a node already in the session `visited_nodes` cache.** Phase 0.5 walked every section root; Phase 5's first action is a cache lookup. Re-fetching is wasted tokens and a defect.
- **Walking deeper than depth-1 in Phase 0.5.** The skeleton scan is strictly one `get_design_context` per section root. Recursing during 0.5 collapses the shallow/deep split — risk scoring should be done from depth-1 signal, not full layer trees.
- **Producing the ledger but not cross-checking the JSX against it.** The ledger is the contract — every JSX value must trace back. "I made a ledger" without "every value traces back" is half the work.

## Linked rules

- [figma-to-code.md](figma-to-code.md) — overall Figma → code contract (this doc is the deep-dive on the per-section walk).
- [task-workflow.md](task-workflow.md) — Phase 5 sub-phase structure.
- [section-risk-scoring.md](section-risk-scoring.md) — when a section needs sub-sub-phasing on top of the walk.
- [parallel-execution.md](parallel-execution.md) — how to run sibling fetches in parallel.
