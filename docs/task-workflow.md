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

| #     | Phase                                  | Deliverable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Verification gate                                                                                                                                                                                                                                 |
| ----- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0** | **Read & plan**                        | (a) Confirm Figma MCP is connected. (b) List relevant `docs/*.md` to consult. (c) **Enumerate every section of the screen as a Figma node ID** and decide which sections are bundled vs solo (see §Section sub-phasing). (c1) **For each enumerated section, classify it as static or backend-driven** per [section-data-classification.md](section-data-classification.md). For every backend-driven section name (i) the endpoint constant in `API_ENDPOINTS.<NAMESPACE>.<KEY>` (mirrored from `website-bonyad/src/config/api.ts`), (ii) the RN call site found by grep in `website-bonyad/src/screens/`, and (iii) whether the section is fetched in the RSC + passed as a prop (public/SEO page default) or via a TanStack Query hook (interactive/authenticated page). If you can't decide static vs backend-driven, the answer is backend-driven. (d) List every file to create or touch. (e) List every API endpoint needed — this list MUST include every endpoint named in (c1) and nothing else. (f) List every asset to export from Figma. (g) List every token that will need adding to `tokens.css` (with both `:root` and `.dark` values). (h) List every architecture-doc file that will need updating per [doc-maintenance.md](doc-maintenance.md). | User explicitly says "go to phase 1".                                                                                                                                                                                                             |
| **1** | **Schemas + types + endpoints**        | zod schemas in `features/<f>/schemas/`. Endpoint entries in `config/endpoints.ts` mirroring `website-bonyad/src/config/api.ts`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `pnpm typecheck` passes. No `any`.                                                                                                                                                                                                                |
| **2** | **API hooks**                          | One file per endpoint in `features/<f>/api/`. Query-key factories.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `pnpm typecheck` + `pnpm lint` pass. MSW handlers added.                                                                                                                                                                                          |
| **3** | **Assets + tokens**                    | Icons → `src/components/icons/`. Illustrations → `src/components/illustrations/`. Lottie → `public/animations/`. **Every token from phase 0's list added to `tokens.css` with both `:root` and `.dark` values.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Every asset filename matches the Figma node name (kebab-case). `currentColor` on SVGs. No `:root` token without a `.dark` counterpart.                                                                                                            |
| **4** | **Route shell + metadata**             | Route file under `app/`. `metadata` / `generateMetadata`. JSON-LD if public. The screen component file exists but is initially empty / placeholder — sections fill it in phase 5.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Route compiles. Metadata returns. The empty shell renders at the URL.                                                                                                                                                                             |
| **5** | **Sections — one sub-phase at a time** | The screen component is filled **section by section**, each section as its own sub-phase (5a, 5b, 5c…). See §Section sub-phasing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Per-sub-phase gate: pixel-perfect + RTL + dark + responsive (4 axes, see [figma-to-code.md](figma-to-code.md) §Pixel-perfect verification). Each sub-phase ends with a gate report; the next sub-phase does not start until the user says "next". |
| **6** | **Tests**                              | Unit tests for non-trivial logic + zod schemas. MSW handlers wired in tests. One Playwright spec for the happy path. `vitest-axe` assertion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `pnpm test` + `pnpm test:a11y` pass.                                                                                                                                                                                                              |
| **7** | **Final review against checklist**     | Walk through every box of [new-screen-checklist.md](new-screen-checklist.md). Document any deliberately skipped box in the PR description.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | All boxes checked, or the skip is justified in writing.                                                                                                                                                                                           |

## Section sub-phasing (phase 5)

**The single biggest hallucination risk in this project** is building a whole multi-section screen in one phase. The Figma MCP truncates large `get_design_context` responses, so sections at the end of a long frame get inferred or skipped — backgrounds disappear, decorative blobs are dropped, and content gets stitched together from memory of the screenshot. To prevent this, phase 5 is split, and the split is strict.

### Grouping rule — solo is the default

**Default: one section, one sub-phase.** Every named child frame in the top-frame `get_metadata` output is its own sub-phase (5a, 5b, 5c, …) unless it meets the strict bundling exception below. If you can't decide, the answer is solo.

- **Solo sub-phase (the default)** — every section gets its own sub-phase. Hero, services grid, pricing cards, testimonial carousel, feature matrix, signup form, multi-column feature row, blog list, trust strip, FAQ, footer, anything with a background of its own, anything with one or more children — solo.
- **Bundled sub-phase (rare exception)** — allowed ONLY when ALL of the following are true: (a) each candidate section is a pure separator band with a single layer and no interactive content (e.g. a 1-line divider, a single-image strip, a horizontal rule); (b) the candidates are immediately adjacent in the layer tree; (c) together they fit in a single `get_design_context` response with room to spare; (d) none has its own background image, gradient, or decorative shape. Bundling more than 2 such bands is forbidden.

**Hard ban:** never build two non-trivial sections in one sub-phase, even if both feel small, even if the user asks for "just finish the next one too". A bundled sub-phase that runs into MCP truncation, surprise content, or its own background fill must be re-split immediately — never code an inferred section.

### Backend-driven section sequencing

A Phase 5 sub-phase for a section classified as **backend-driven** in Phase 0 ([section-data-classification.md](section-data-classification.md)) MUST NOT start until Phases 1 and 2 are complete for that section's endpoint: zod request schema (if any) + permissive response TS type in `features/<f>/schemas/`, fetcher + hook in `features/<f>/api/`, and the sibling `*.test.ts` covering happy path + 4xx + every branch (CLAUDE.md hard rule 1). Hardcoding a "placeholder" array in the section so the UI can be built before the API is wired is treated as a defect, not a shortcut — the placeholder almost always leaks into production. If you discover mid-sub-phase that the endpoint isn't wired yet, stop the sub-phase, go back to Phase 1, and resume the sub-phase only when the fetcher is consumable.

### Per-sub-phase contract

For each sub-phase (5a, 5b, …):

1. **Re-call `get_design_context` on the exact node ID** for this section (or each node, for the rare bundled sub-phase). Do not work from the top-frame response, even if it was successful — it was for planning, not for code. Do not derive any value from the screenshot (see [figma-to-code.md](figma-to-code.md) §What the screenshot may and may not be used for).
2. **Walk every layer in the section's tree** ([figma-to-code.md](figma-to-code.md) §Per-section: walk the layer tree, not the picture). Produce a flat list of every node: id, name, type, dimensions, auto-layout, fills, strokes, radii, text, effects — **including every background layer** (section-root fill, gradient overlays, blur blobs, decorative shapes, image fills). **Pair every layer with a planned DOM element** (kept / inlined / dropped) — no silent skips. If the response is truncated, recurse into the missing branches; never code from inference.
3. **Call `get_variable_defs` on the node** to pick up section-specific tokens, and confirm they exist in `tokens.css` (both `:root` and `.dark`). If a token is missing, stop the sub-phase, add it in phase 3 style (with both values), then resume.
4. **Export any new background images** (image fills, photographic backgrounds, pattern overlays) to `public/images/bg/` with the Figma node name in kebab-case, and add them to the asset list in the gate report. Never substitute a CSS gradient for a real image fill.
5. **Build only this section.** Do not touch sections that belong to other sub-phases. Use the layer list from step 2 as a checklist — every entry must be addressed in code. If you find yourself editing another section's component file, stop — that is scope creep and is treated as a defect.
6. **Run the 5-axis gate** ([figma-to-code.md](figma-to-code.md) §Pixel-perfect verification): layer fidelity (including backgrounds) / pixel-perfect / RTL / dark / responsive (320 / 768 / 1280). If a sub-phase covers an empty/loading/error state, verify each state in the gate.
7. **Produce the gate report** (see §Phase gate below) and **STOP**. Do not start the next sub-phase until the user says "next". Auto-continuing into the next section is the most common phase-gate violation on this project and is itself a defect — the gate exists because the next section needs a fresh layer-tree call, not because the user enjoys typing "next".

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

Sample section sub-phase gate report (phase 5):

```
Phase 5b (home / services grid) — gate report
- Node: 1:4432;320:42 (services section)
- Screenshot used for code derivation: ❌ never (layer tree only)
- get_design_context called on this exact node: ✅ (no inference, no truncation)
- Layer tree walked: 21 layers enumerated.
    - Background layers (3): section root fill (token --color-services-panel), decorative blur blob 320:97 (hidden lg:block, hardcoded coords behind xl:), gradient overlay 320:98 (rendered as ::before via bg-gradient-to-b utility)
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
  - Responsive: 320 ✅ / 768 ✅ / 1280 ✅, no horizontal scroll, touch targets ≥ 44 px, decorative absolute bg layers gated behind xl: ✅
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

| Task type                             | Phase set                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| New screen (default)                  | All phases above (0 → 7), with phase 5 split into sub-phases per section.                                                                        |
| Tiny UI tweak (≤ 1 file, one section) | Phase 0 (plan) → Phase 5 (single sub-phase + 4-axis gate) → Phase 7 (re-checklist). Skip 1, 2, 3, 4, 6 if truly N/A — say so in phase 0.         |
| Refactor                              | Phase 0 → Phase 1 (define target shape) → Phase 5 (move, one sub-phase per touched component) → Phase 6 (tests still pass).                      |
| Bug fix                               | Phase 0 → Phase 6 (failing test first) → Phase 5 (fix, one sub-phase) → Phase 7 (regression check).                                              |
| Backend integration spike             | Phase 0 (read RN's `website-bonyad/src/config/api.ts` flow) → Phase 1 (mirror endpoints + zod) → Phase 2 (hooks) → stop. No UI in the same task. |

The variant must be declared at phase 0 with a one-line rationale.

## How the user drives this

- **Give Claude the task + the Figma link + any context.**
- **Claude produces the phase 0 plan and stops.** The plan must include the section enumeration with each section labelled solo or bundled.
- **You say "go" (or push back).**
- **Claude executes one phase (or one sub-phase, in phase 5), produces the gate report, stops.**
- **Repeat through phase 7.**

If Claude tries to skip ahead, collapse phases, build multiple sections in one sub-phase, or skip a verification axis, push back: "do phase N first" / "split section X into its own sub-phase" / "run the dark-mode check". This is the contract.

## Why "stop after each phase / sub-phase"

The doc rules are tight ([file-size-limits.md](file-size-limits.md), [import-boundaries.md](import-boundaries.md), [theming.md](theming.md), [i18n-and-rtl.md](i18n-and-rtl.md), [responsive-design.md](responsive-design.md), [accessibility.md](accessibility.md), [security-headers.md](security-headers.md), [seo-and-ai-readability.md](seo-and-ai-readability.md)). Even one phase done sloppily breaks downstream phases — and one section built without the 4-axis gate produces a hallucinated layout that only surfaces in code review or, worse, production. The gate is cheaper than a debugging session.
