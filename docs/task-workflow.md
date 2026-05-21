# Task workflow — phased execution with verification gates

Every non-trivial task (new screen, new feature, refactor, integration) is broken into **phases**. Each phase has a clear deliverable, a verification gate, and an explicit hand-off before the next phase starts. **No phase is skipped, no two phases collapse into one.**

This is mandatory for AI work because skipping phases is the #1 cause of hallucination — symbols invented, types guessed, files referenced that don't exist.

## Why phases

- **Smaller blast radius.** A wrong assumption in phase 2 is caught before phase 3 builds on it.
- **Verifiable handoffs.** Each phase ends with a check the user can re-run.
- **Token efficiency.** The AI loads only the docs and files relevant to the current phase, not the whole world.
- **Sane PR diffs.** Reviewers see logical chunks, not a 2,000-line dump.

## The standard phases

For a typical new-screen task driven by a Figma link:

| #       | Phase                                  | Deliverable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Verification gate                                                                                                                                                                                                                                                                                                    |
| ------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0**   | **Read & plan (cheap)**                | (a) Confirm Figma MCP is connected. (b) List relevant `docs/*.md` to consult. (c) **Call `get_metadata` on the top frame ONLY** — no `get_design_context` yet. (d) **Enumerate every section as a Figma node ID** with a **tentative risk score** (`HIGH` / `MEDIUM` / `LOW`) per [section-risk-scoring.md](section-risk-scoring.md) — derive from metadata signals only (descendant_count, child_count, named patterns like "Card 1 / Card 2 / Card 3"). The score is _tentative_ — Phase 0.5 confirms or promotes it with real layer signal. (e) **Classify each section static or backend-driven** per [section-data-classification.md](section-data-classification.md); for backend-driven sections, name the endpoint in `API_ENDPOINTS.<NAMESPACE>.<KEY>` and the RN call site (grep `website-bonyad/src/screens/`). (f) Declare the task variant (new-screen / refactor / bug-fix / spike). | User explicitly says "go to phase 0.5".                                                                                                                                                                                                                                                                              |
| **0.5** | **Skeleton scan**                      | **Per-section shallow walk (depth 1), fanned out in parallel** — see §Skeleton scan below. Outputs (i) refined risk scores (truncation auto-promotes to HIGH; ≥3 variant children promotes to HIGH), (ii) sub-sub-phase plan for HIGH sections, (iii) the file list to create/touch, (iv) the endpoint list (one entry per backend-driven section from Phase 0), (v) the token list (from `get_variable_defs` on the top frame), (vi) the initial **background-layer registry**, (vii) the asset list visible at depth 1 (deeper assets discovered in Phase 5), (viii) the parallel-dispatch plan for later phases, (ix) the doc files to update per [doc-maintenance.md](doc-maintenance.md). Responses cached in a session-wide `visited_nodes` map; Phase 5 reuses them.                                                                                                                        | User explicitly says "go to phase 1".                                                                                                                                                                                                                                                                                |
| **1**   | **Schemas + types + endpoints**        | zod schemas in `features/<f>/schemas/`. Endpoint entries in `config/endpoints.ts` mirroring `website-bonyad/src/config/api.ts`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `pnpm typecheck` passes. No `any`.                                                                                                                                                                                                                                                                                   |
| **2**   | **API hooks**                          | One file per endpoint in `features/<f>/api/`. Query-key factories.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `pnpm typecheck` + `pnpm lint` pass. MSW handlers added.                                                                                                                                                                                                                                                             |
| **3**   | **Assets + tokens**                    | Icons → `src/components/icons/`. Illustrations → `src/components/illustrations/`. Lottie → `public/animations/`. **Every token from phase 0's list added to `tokens.css` with both `:root` and `.dark` values.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Every asset filename matches the Figma node name (kebab-case). `currentColor` on SVGs. No `:root` token without a `.dark` counterpart.                                                                                                                                                                               |
| **4**   | **Route shell + metadata**             | Route file under `app/`. `metadata` / `generateMetadata`. JSON-LD if public. The screen component file exists but is initially empty / placeholder — sections fill it in phase 5.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Route compiles. Metadata returns. The empty shell renders at the URL.                                                                                                                                                                                                                                                |
| **5**   | **Sections — one sub-phase at a time** | The screen component is filled **section by section**, each section as its own sub-phase (5a, 5b, 5c…). Each sub-phase runs the deep recursive BFS layer walk + produces the **leaf pixel ledger** + appends to the background-layer registry. See §Section sub-phasing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Per-sub-phase **5-axis gate**: layer fidelity + pixel-perfect (computed styles vs the ledger, not eyeballed) + RTL + dark + responsive (see [figma-to-code.md](figma-to-code.md) §Pixel-perfect verification). Each sub-phase ends with a gate report; the next sub-phase does not start until the user says "next". |
| **6**   | **Tests**                              | Unit tests for non-trivial logic + zod schemas. MSW handlers wired in tests. One Playwright spec for the happy path. `vitest-axe` assertion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `pnpm test` + `pnpm test:a11y` pass.                                                                                                                                                                                                                                                                                 |
| **7**   | **Final review against checklist**     | Walk through every box of [new-screen-checklist.md](new-screen-checklist.md). Document any deliberately skipped box in the PR description.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | All boxes checked, or the skip is justified in writing.                                                                                                                                                                                                                                                              |

## Skeleton scan (phase 0.5)

Phase 0 is **deliberately cheap** — it works off `get_metadata` and naming heuristics. Phase 0.5 takes the section list and runs a **shallow walk** (one `get_design_context` per section root, no recursion) to confirm risk, surface variants, and enumerate the lists that previously bloated Phase 0 (tokens, assets, files, endpoints, parallel plan).

### The algorithm

1. **Fan out** — all section-root `get_design_context` calls in a single message (sibling-parallel). Also call `get_variable_defs` on the top frame in the same message. See [parallel-execution.md](parallel-execution.md) §Phase 0.5.
2. **Cache** every response in a session-wide `visited_nodes` map keyed by node ID. Phase 5's deep walk MUST consult this cache before re-fetching — a section root walked in 0.5 is reused, not re-called.
3. **Refine the risk score for every section** using observed signal:
   - Truncated response on the section root → auto-promote to **HIGH** (force sub-sub-phasing).
   - ≥3 named child frames that look like variant cards (e.g. `Plan / Default`, `Plan / Featured`, `Plan / Enterprise`) → promote to **HIGH**.
   - ≥5 distinct background layers visible at depth 1 → promote to **HIGH**.
   - State variants present in the component name (`/Hover`, `/Selected`, `/Disabled`) → promote to **HIGH**.
   - All HIGH triggers absent + ≥2 variant children → **MEDIUM**.
   - Otherwise → **LOW** (or the Phase 0 tentative score if it was lower).
4. **Build the initial background-layer registry** — every section's depth-1 background layers (root fill, gradient overlay, decorative shape, image fill) get a row keyed by node ID + section. Phase 5 sub-phases append to it; the registry is the single source of truth for "no background dropped silently."
5. **Emit the Phase 0.5 gate report** (see §Phase gate) listing: refined risk scores, sub-sub-phase plan for HIGH sections, file list, endpoint list, token list, asset list (depth-1), background registry, doc-update list, parallel-dispatch plan for Phases 1–5. **STOP.**

### What Phase 0.5 does NOT do

- **No deep recursion.** Only the section root is walked. The full recursive BFS lives in each Phase-5 sub-phase, on demand.
- **No JSX, no schemas, no asset exports.** Those are Phases 1–4.
- **No leaf pixel ledger.** That's a per-section artifact built in Phase 5 from the deep walk.

### Why this is the right split

- **Phase 0 stays seconds-cheap** — one metadata call. The user can challenge the section list and risk scores before any real work.
- **Phase 0.5 is bounded** — `N` section-root calls in parallel where `N` is the section count. No nested fan-out, no truncation risk.
- **Risk scores get confirmed before Phase 1** — the schema/hook work in Phase 1 already knows which endpoints back which sections, and the sub-sub-phase plan is locked in before code is written.
- **Phase 5 starts hot** — the section root is already in cache; the deep walk only fetches descendants.

## Section sub-phasing (phase 5)

**The single biggest hallucination risk in this project** is building a whole multi-section screen in one phase. The Figma MCP truncates large `get_design_context` responses, so sections at the end of a long frame get inferred or skipped — backgrounds disappear, decorative blobs are dropped, and content gets stitched together from memory of the screenshot. To prevent this, phase 5 is split, and the split is strict.

### Grouping rule — solo is the default

**Default: one section, one sub-phase.** Every named child frame in the top-frame `get_metadata` output is its own sub-phase (5a, 5b, 5c, …) unless it meets the strict bundling exception below. If you can't decide, the answer is solo.

- **Solo sub-phase (the default)** — every section gets its own sub-phase. Hero, services grid, pricing cards, testimonial carousel, feature matrix, signup form, multi-column feature row, blog list, trust strip, FAQ, footer, anything with a background of its own, anything with one or more children — solo.
- **Bundled sub-phase (rare exception)** — allowed ONLY when ALL of the following are true: (a) each candidate section is a pure separator band with a single layer and no interactive content (e.g. a 1-line divider, a single-image strip, a horizontal rule); (b) the candidates are immediately adjacent in the layer tree; (c) together they fit in a single `get_design_context` response with room to spare; (d) none has its own background image, gradient, or decorative shape. Bundling more than 2 such bands is forbidden.

**Hard ban:** never build two non-trivial sections in one sub-phase, even if both feel small, even if the user asks for "just finish the next one too". A bundled sub-phase that runs into MCP truncation, surprise content, or its own background fill must be re-split immediately — never code an inferred section.

### Sub-sub-phasing — when a section needs to be split further

HIGH-risk sections ([section-risk-scoring.md](section-risk-scoring.md)) are split into **sub-sub-phases** per component variant. Triggers (any one): ≥3 cards with different content per card, nested complex components (card → tabs → tab content), MCP truncation on the section root, Figma state variants (default / hover / selected / disabled), ≥5 distinct background layers. Each sub-sub-phase (5a.1, 5a.2 …) re-fetches `get_design_context` for its component node, runs its own deep walk + leaf pixel ledger, builds the variant, and runs the 5-axis gate **at the component level** before the next sub-sub-phase starts. MEDIUM-risk sections stay in one sub-phase but loop the gate per variant. LOW-risk sections stay in one sub-phase with a single gate. The score is **tentative in Phase 0 and locked in Phase 0.5** — the user can challenge at either checkpoint.

### Backend-driven section sequencing

A Phase 5 sub-phase for a section classified as **backend-driven** in Phase 0 ([section-data-classification.md](section-data-classification.md)) MUST NOT start until Phases 1 and 2 are complete for that section's endpoint: zod request schema (if any) + permissive response TS type in `features/<f>/schemas/`, fetcher + hook in `features/<f>/api/`, and the sibling `*.test.ts` covering happy path + 4xx + every branch (CLAUDE.md hard rule 1). Hardcoding a "placeholder" array in the section so the UI can be built before the API is wired is treated as a defect, not a shortcut — the placeholder almost always leaks into production. If you discover mid-sub-phase that the endpoint isn't wired yet, stop the sub-phase, go back to Phase 1, and resume the sub-phase only when the fetcher is consumable.

### Per-sub-phase contract

For each sub-phase (5a, 5b, …):

1. **Look up the section root in the session `visited_nodes` cache** (populated by Phase 0.5). If hit, reuse the cached response — re-fetching a node already walked is wasted tokens. If miss (rare — only when a sub-sub-phase descended past Phase 0.5's depth), call `get_design_context` on the exact node ID. Never work from the top-frame response, and never derive a value from the screenshot ([figma-to-code.md](figma-to-code.md) §What the screenshot may and may not be used for).
2. **Run the recursive BFS layer walk to every leaf** per [figma-layer-walk.md](figma-layer-walk.md). Every non-leaf node (FRAME / GROUP / INSTANCE / COMPONENT / SECTION / BOOLEAN_OPERATION) gets its own `get_design_context` call — recursion is always-on, not "only on truncation." Cache hits in `visited_nodes` are reused; cache misses fetch fresh and write back. Sibling fetches at the same depth run in **parallel in one message** per [parallel-execution.md](parallel-execution.md) — sequential sibling fetches are a defect. Produce the flat layer list (id, name, type, dimensions, auto-layout, fills, strokes, radii, text, effects, **including every background layer**). Pair every layer with a planned DOM element (kept / inlined / dropped) — no silent skips. The completeness gate (`total_nodes_visited + leaf_count >= metadata.descendant_count`) must pass before any JSX.
3. **Produce the leaf pixel ledger** per [figma-layer-walk.md](figma-layer-walk.md) §Leaf pixel ledger — a flat table of `leaf_node_id → property → value → source` covering every leaf's font-size, line-height, color, padding, gap, border-radius, fills, strokes, shadows, and dimensions. **Every CSS value in the JSX must trace back to a ledger row** — this is the pixel-perfect contract. The ledger is the artifact the 5-axis gate's "computed styles" axis (axis 1) is checked against — not "vs Figma" abstractly.
4. **Call `get_variable_defs` on the node** to pick up section-specific tokens, and confirm they exist in `tokens.css` (both `:root` and `.dark`). If a token is missing, stop the sub-phase, add it in phase 3 style (with both values), then resume.
5. **Export any new background images** (image fills, photographic backgrounds, pattern overlays) to `public/images/bg/` with the Figma node name in kebab-case. **Append every background layer (root fill, gradient, blur blob, image, decorative shape) to the session background-layer registry** started in Phase 0.5 — the registry is the audit log that catches silently dropped backgrounds. Never substitute a CSS gradient for a real image fill.
6. **Build only this section.** Do not touch sections that belong to other sub-phases. Use the layer list from step 2 + the ledger from step 3 as a checklist — every entry must be addressed in code. If you find yourself editing another section's component file, stop — that is scope creep and is treated as a defect.
7. **Run the 5-axis gate** ([figma-to-code.md](figma-to-code.md) §Pixel-perfect verification): layer fidelity (including backgrounds) / pixel-perfect (verified against the ledger, not eyeballed) / RTL / dark / **responsive (12-width matrix per [responsive-verification.md](responsive-verification.md): 320 / 375 / 414 / 600 / 768 / 900 / 1024 / 1100 / 1280 / 1366 / 1440 / 1920)**. HIGH-risk sub-sub-phases run the gate at the component level, not the whole section. If a sub-phase covers an empty/loading/error state, verify each state in the gate.
8. **Produce the gate report** (see §Phase gate below) and **STOP**. The report lists ledger row count, ledger entries that drove non-token CSS, background-registry rows appended this sub-phase, and the parallel-dispatch summary. Do not start the next sub-phase until the user says "next". Auto-continuing into the next section is the most common phase-gate violation on this project and is itself a defect.

### Why this works

- Each sub-phase fits in one Figma MCP call → no truncation → no inference.
- Each sub-phase is verified in dark + RTL + responsive _at the moment it's built_, not weeks later — drift can't accumulate.
- The user can redirect after any sub-phase; the rest of the screen is still untouched.
- The screen component file grows incrementally and stays under the 200-line cap — sections that exceed the cap get extracted into their own component within their sub-phase.

## Phase gate — what verification looks like

At the **end of every phase**, Claude must:

1. **Run the gate commands** explicitly (typecheck, lint, test, build — whichever applies to the phase) via Bash and paste the result. No claiming success without running.
2. **Re-check the rules** for that phase against the relevant `docs/*.md`. A short bulleted "verified vs rules: …" list, not a vague claim.
3. **List the files created/modified** in the phase, with one-line summaries.
4. **List the doc files updated** in this phase, per [doc-maintenance.md](doc-maintenance.md). New feature folder → `folder-structure.md` + `README.md`. New endpoint → `api-and-auth.md`. New token → confirm `:root` and `.dark` both set in `tokens.css`. New icon → barrel update. New env var → `deployment-and-env.md`. If no doc edit was required, say so explicitly with the reason — silent skips are a defect.
5. **Stop and wait for the user** to say "next" before starting the following phase. No silent transitions.

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

Sample Phase 0.5 gate report (skeleton scan):

```
Phase 0.5 (skeleton scan) — gate report
- Top frame: 1:4400 (home/index)
- Sections (depth-1 shallow walk, all 7 fanned out in parallel in one message):
  - 5a) Hero — LOW (single banner, 1 CTA) — root 1:4401, 3 children, 0 variants
  - 5b) Services grid — MEDIUM (3 identical-structure cards, varying styling) — root 1:4432
  - 5c) Pricing — HIGH (auto-promoted: 3 variant card names "Plan/Default", "Plan/Featured", "Plan/Enterprise") — split into 5c.1 / 5c.2 / 5c.3 — root 1:4470
  - 5d) Testimonials — MEDIUM — root 1:4501
  - 5e) FAQ — HIGH (truncated at root → auto-promote) — split into 5e.1 … 5e.5 — root 1:4540
  - 5f) CTA strip — LOW — root 1:4590
  - 5g) Footer — LOW — root 1:4600
- visited_nodes cache: 7 section roots cached (Phase 5 will reuse, not re-fetch)
- get_variable_defs on top frame: 12 tokens; 2 missing in tokens.css (--color-pricing-featured-bg, --color-pricing-featured-fg) — added to Phase 3 list
- Background-layer registry (initial, depth-1 only — Phase 5 appends deeper):
  - 1:4400 root fill — token --color-page-bg
  - 5a hero gradient overlay 1:4402
  - 5c pricing decorative blur blob 1:4471
  - 5g footer top divider 1:4601
- Endpoint list (one per backend-driven section from Phase 0):
  - 5c) API_ENDPOINTS.SUBSCRIPTIONS.CATEGORIES (RN call site: website-bonyad/src/screens/Pricing.tsx)
  - 5d) API_ENDPOINTS.TESTIMONIALS.LIST (RN: website-bonyad/src/screens/Home.tsx:142)
  - 5e) API_ENDPOINTS.CONTENT.FAQ (RN: website-bonyad/src/screens/Faq.tsx)
- File list to create/touch: features/home/components/{hero,services,pricing,testimonials,faq,cta-strip,footer}.tsx (+ 3 sub-sub-phase variants under pricing/, 5 under faq/); api/ entries for the 3 endpoints; schemas/ for the 3 endpoints
- Doc updates anticipated: folder-structure.md (new feature subdirs), api-and-auth.md (3 new endpoints)
- Parallel dispatch plan:
  - Phase 1: 3 schema files in parallel (independent endpoints)
  - Phase 2: 3 hook files + 3 MSW handlers in parallel
  - Phase 3: ~14 icon exports in parallel
  - Phase 5 sub-phases: sibling layer fetches in parallel within each deep walk
- STOPPING — awaiting "go to phase 1".
```

Sample section sub-phase gate report (phase 5):

```
Phase 5b (home / services grid) — gate report
- Node: 1:4432;320:42 (services section)
- Risk score: MEDIUM (confirmed in Phase 0.5 — 3 identical-structure cards with varying styling; no sub-sub-phasing)
- Screenshot used for code derivation: ❌ never (layer tree only)
- Layer walk completeness (per figma-layer-walk.md):
  - cache hits: 1 (section root already in visited_nodes from Phase 0.5 — not re-fetched)
  - cache misses (fresh fetches): 20 (every FRAME/GROUP/INSTANCE inside the root)
  - total_nodes_visited: 21
  - leaf_count: 38 (TEXT/VECTOR/RECTANGLE counted in parent responses)
  - metadata.descendant_count_for(section_root): 59
  - assertion 21 + 38 >= 59 ✅
  - parallel batches: 4 batches of avg 3 sibling fetches (saved ~9s wall-clock vs sequential)
- Leaf pixel ledger: 38 rows (one per leaf), 142 property entries; every CSS value in the JSX traces to a ledger row ✅
- Layer pairing:
  - Background layers appended to session registry (3 new rows): section root fill (token --color-services-panel), decorative blur blob 320:97 (hidden lg:block, hardcoded coords behind xl:), gradient overlay 320:98 (inlined as bg-gradient-to-b)
  - Content layers (14): root frame, heading, sub-heading, 3 feature rows × 3 children, CTA panel, CTA button
  - 2 inlined into parent styles (icon container shadow → tailwind shadow-* token)
  - 2 dropped (duplicate decorative blur shapes — node 320:99, 320:100; reason: overlap with body bg blob, already covered by 320:97)
- Assets exported: public/images/bg/services-pattern.png (from Figma image fill on node 320:96)
- get_variable_defs reconciled: 2 new tokens added in tokens.css (--color-services-panel light + dark)
- File: features/home/components/home-services.tsx (152 lines, under cap)
- 5-axis verification:
  - Layer fidelity: every kept layer (incl. backgrounds) has a matching DOM node ✅; no extra wrappers ✅; no Figma layer missing from DOM ✅
  - Pixel-perfect (light, en): padding ✅, gap ✅, radius ✅, font ✅, icon size ✅, section bg fill ✅, gradient stops + angle ✅, blur blob position ✅
  - RTL (ar): mirrors ✅, no -end where -start was needed ✅, decorative bg blob mirrors via logical positioning ✅
  - Dark: every surface (incl. bg + blob) from a token with .dark value ✅
  - Responsive (12-width matrix): 320 ✅ 375 ✅ 414 ✅ 600 ✅ 768 ✅ 900 ✅ 1024 ✅ 1100 ✅ 1280 ✅ 1366 ✅ 1440 ✅ 1920 ✅. No horizontal scroll at any width. Touch targets ≥ 44 px at ≤ 768. Decorative absolute bg layers gated behind xl: ✅
- Data classification: backend-driven (endpoint API_ENDPOINTS.SUBSCRIPTIONS.CATEGORIES, fetched in RSC at src/app/(main)/for-pros/page.tsx, passed as `plans` prop). States rendered: error → empty fallback `t('tech.pricing.noPlans')` ✅, empty ✅, success ✅. No hardcoded fallback array ✅. Localised fields (nameEn / nameAr) read via LOCALE_DIRECTION ✅. (Omit this block on static sections — and say "data classification: static" in one line so reviewers see you considered it.)
- Docs updated: src/components/icons/index.ts (1 new icon barrel entry). No `docs/` edit required.
- Open questions: none.
- STOPPING — awaiting "next" before starting 5c.
```

## Anti-hallucination guards (run at every phase)

- **Before importing any symbol**, grep for it. If it doesn't exist, stop and decide: create it (and add to the phase plan) or correct the assumption.
- **Before referencing an endpoint**, open `config/endpoints.ts`. The literal must exist.
- **Before using a token**, open `src/styles/tokens.css`. If missing, add it explicitly in this phase, not silently.
- **Before claiming a test passed**, actually run it. Output goes in the gate report.
- **Before quoting a doc rule**, re-read the doc — rules drift, and citing from memory is a hallucination risk.

## Variants

| Task type                             | Phase set                                                                                                                                                                                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New screen (default)                  | All phases above (0 → 0.5 → 7), with phase 5 split into sub-phases per section.                                                                                                                                                                                            |
| Tiny UI tweak (≤ 1 file, one section) | Phase 0 (plan) → Phase 0.5 ONLY IF the section's risk score is non-LOW (depth-1 walk on the single section; otherwise skip and go straight to 5) → Phase 5 (single sub-phase + 5-axis gate) → Phase 7 (re-checklist). Skip 1, 2, 3, 4, 6 if truly N/A — say so in phase 0. |
| Refactor                              | Phase 0 → Phase 0.5 (depth-1 walk per touched component) → Phase 1 (define target shape) → Phase 5 (move, one sub-phase per touched component) → Phase 6 (tests still pass).                                                                                               |
| Bug fix                               | Phase 0 → Phase 6 (failing test first) → Phase 5 (fix, one sub-phase) → Phase 7 (regression check). Skip Phase 0.5 — no new Figma frames involved.                                                                                                                         |
| Backend integration spike             | Phase 0 (read RN's `website-bonyad/src/config/api.ts` flow) → Phase 1 (mirror endpoints + zod) → Phase 2 (hooks) → stop. No UI in the same task. Skip Phase 0.5 — no Figma frames.                                                                                         |

The variant must be declared at phase 0 with a one-line rationale.

## How the user drives this

- **Give Claude the task + the Figma link + any context.**
- **Claude produces the phase 0 plan and stops** — cheap pass: top-frame metadata + tentative risk scores + static/backend classification. No deep walks.
- **You say "go to phase 0.5" (or push back on the section list).**
- **Claude runs the skeleton scan and stops** — depth-1 walk per section in parallel; produces refined risk scores + sub-sub-phase plan + file/endpoint/token/asset lists + initial background registry.
- **You say "go to phase 1" (or challenge a risk score / sub-sub-phase split).**
- **Claude executes one phase (or one sub-phase, in phase 5), produces the gate report, stops.**
- **Repeat through phase 7.**

If Claude tries to skip ahead, collapse phases, build multiple sections in one sub-phase, walk deeper than depth-1 in Phase 0.5, or skip a verification axis, push back: "do phase N first" / "split section X into its own sub-phase" / "run the dark-mode check" / "Phase 0.5 is depth-1 only — stop and produce the gate report". This is the contract.

## Why "stop after each phase / sub-phase"

The doc rules are tight ([file-size-limits.md](file-size-limits.md), [import-boundaries.md](import-boundaries.md), [theming.md](theming.md), [i18n-and-rtl.md](i18n-and-rtl.md), [responsive-design.md](responsive-design.md), [accessibility.md](accessibility.md), [security-headers.md](security-headers.md), [seo-and-ai-readability.md](seo-and-ai-readability.md)). Even one phase done sloppily breaks downstream phases — and one section built without the 4-axis gate produces a hallucinated layout that only surfaces in code review or, worse, production. The gate is cheaper than a debugging session.
