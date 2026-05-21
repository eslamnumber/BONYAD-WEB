# Section risk scoring — when to sub-sub-phase

Phase 5 is sub-phased one section at a time ([task-workflow.md](task-workflow.md) §Section sub-phasing). But some sections are simple (one hero, one separator) and some are complex (three plan cards with different content, a card with nested tabs). Treating both identically is the wrong tradeoff: simple sections shouldn't pay a 5-step verification toll, complex sections shouldn't be built in one sloppy pass.

This doc defines **risk-based sub-sub-phasing**. Every section gets a HIGH / MEDIUM / LOW score that is:

- **Tentative in Phase 0** — derived from `get_metadata` only (descendant_count, child_count, named patterns like `Card 1 / Card 2`). Cheap to produce; the user can challenge before any deeper work.
- **Confirmed or promoted in Phase 0.5** ([task-workflow.md](task-workflow.md) §Skeleton scan) — the depth-1 shallow walk on each section root reveals truncation, variant children, and background-layer count. These signals can only **raise** the score (LOW → MEDIUM → HIGH), never lower it.
- **Locked before Phase 1** — once the Phase 0.5 gate report is approved, sub-sub-phase splits are fixed.

## The scoring table

A section is **HIGH risk** if **any** of these is true:

| Trigger                                                                                                               | Why it's high-risk                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥3 cards/items with DIFFERENT content per card (plans, testimonials, FAQ items, feature tiles, success stories)       | Sonnet builds the first card faithfully then copy-pastes for the rest, missing per-card variant differences (different icons, different feature bullets, different CTAs). |
| Nested complex component (card → tabs → tab content, accordion with rich content per item, modal with multiple steps) | The nested branch is the deepest part of the layer tree — most truncation-prone, most hallucination-prone.                                                                |
| MCP `get_design_context` truncated on the section root                                                                | Truncation = inference = drift. Force sub-splitting to keep responses small enough to be complete.                                                                        |
| Figma has state variants for the same component (default / hover / selected / disabled / loading)                     | Each state has subtle style overrides that get missed in a single pass.                                                                                                   |
| Section has ≥5 distinct background layers (root fill + 2 gradients + 2 blur blobs + image)                            | The more layers, the easier one is to drop silently.                                                                                                                      |

A section is **MEDIUM risk** if **any** of these is true (and none of the HIGH triggers fire):

| Trigger                                                                                                      | Why it's medium-risk                                                    |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 2 variant cards (e.g. "Customer" vs "Pro" plan cards on one row)                                             | One variant gets built well, the other inherits the first's properties. |
| Section with 3–4 background layers but no nested components                                                  | Backgrounds get dropped; content stays clean.                           |
| Repeating cards with identical layer structure but varying styling (different colours per card from an enum) | Layer fidelity holds but tokens may be mis-mapped.                      |

A section is **LOW risk** if **all** of these are true:

| Signal                                                                                                                                              | Why it's low-risk                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Single hero / banner / CTA with title + body + ≤1 button                                                                                            | Linear layer tree, no repetition.                                 |
| Separator band, divider, trust strip (single layer)                                                                                                 | One Figma layer = one DOM element.                                |
| Repeating list where every card is IDENTICAL (only data fields differ — confirmed via the layer walk in [figma-layer-walk.md](figma-layer-walk.md)) | Build one, replicate via `.map()`. No per-card variation to lose. |
| Footer with link groups (no nested components per group)                                                                                            | Repetitive but flat.                                              |

If the section matches none of these or you can't decide, score it **MEDIUM** (the cautious default).

## Phase 0.5 promotion triggers

The Phase 0 score is tentative because `get_metadata` doesn't expose layer-level signal. Phase 0.5's shallow walk gives the first real look at each section root. **Any of the following promotes the section's score** in the Phase 0.5 gate report:

| Observed in Phase 0.5 depth-1 response                                                            | Promotion                                                                                         |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Truncated `get_design_context` response on the section root                                       | → **HIGH** (force sub-sub-phasing — truncation = inference risk)                                  |
| ≥3 child frames with variant-like names (`Plan/Default`, `Plan/Featured`, `Plan/Enterprise`)      | → **HIGH**                                                                                        |
| ≥5 distinct background layers visible at depth 1 (root fill + 2 gradients + 2 blur blobs + image) | → **HIGH**                                                                                        |
| Component-state suffixes in child names (`/Hover`, `/Selected`, `/Disabled`, `/Loading`)          | → **HIGH**                                                                                        |
| 2 variant children + a nested component instance among the children                               | → **MEDIUM** (if not already HIGH)                                                                |
| Section root resolves to a single `INSTANCE` with one or two children                             | (no promotion — but flag in the gate report; the deep walk will explore the instance's overrides) |

Promotions are **never reversed in Phase 5** — once HIGH, always HIGH for this screen. If Phase 5's deep walk reveals the section was simpler than the depth-1 signal suggested, note it for next time but do not retroactively merge the sub-sub-phases.

## Treatment by score

| Score      | Treatment                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIGH**   | **Sub-sub-phase per variant** (5a.1, 5a.2, …). Each sub-sub-phase: re-fetch `get_design_context` for that specific card/variant node, walk its layer tree, build it, run a per-component 5-axis gate. The next variant doesn't start until the prior one's gate passes. |
| **MEDIUM** | **One sub-phase, per-variant verification at the gate.** Build all variants in the same sub-phase but the gate's "layer fidelity" + "pixel-perfect" + "dark" checks loop over each variant separately. The gate report names each variant and confirms it individually. |
| **LOW**    | **One sub-phase, single gate.** Standard 5-axis verification on the whole section.                                                                                                                                                                                      |

## Phase 0 declaration (tentative) and Phase 0.5 confirmation (final)

**Phase 0** lists each section with its tentative score, deriving signal from `get_metadata` only:

```
[Phase 0 — tentative, metadata-only]
5a) Hero — LOW (1 child frame, descendant_count 12)
5b) Pricing cards — HIGH (3 child frames named "Plan/Default", "Plan/Featured", "Plan/Enterprise")
5c) Trust strip — LOW (1 layer, descendant_count 1)
5d) Why-us bento — MEDIUM (4 child frames, identical names "Card 1".."Card 4" — variant signal unclear from metadata)
5e) Testimonial carousel — MEDIUM (3 identical "Card" children)
5f) FAQ accordion — MEDIUM (5 identical "Item" children — nested content unknown from metadata)
5g) Footer — LOW (4 link-group children, flat)
```

**Phase 0.5** confirms or promotes each score using the depth-1 shallow walk:

```
[Phase 0.5 — confirmed, depth-1 walk]
5a) Hero — LOW (confirmed: 3 leaves, no variants, 1 background layer)
5b) Pricing cards — HIGH (confirmed) — split into 5b.1 / 5b.2 / 5b.3
5c) Trust strip — LOW (confirmed: single shape leaf)
5d) Why-us bento — HIGH (promoted: depth-1 reveals 4 cards with different icon nodes + different gradient fills per card) — split into 5d.1 / 5d.2 / 5d.3 / 5d.4
5e) Testimonial carousel — MEDIUM (confirmed: 3 identical-structure cards, varying styling)
5f) FAQ accordion — HIGH (promoted: response truncated on item-3 — force sub-sub-phasing) — split into 5f.1 … 5f.5
5g) Footer — LOW (confirmed)
```

The user can challenge any score at **either** declaration. "Split 5e into per-card" or "5d.4 is identical to 5d.3, merge them" are valid pushbacks. Once Phase 0.5 is approved, scores and sub-sub-phase splits are locked.

## The per-component gate (HIGH-risk sub-sub-phases)

Each sub-sub-phase under a HIGH-risk section runs the same 5-axis gate as a full section ([figma-to-code.md](figma-to-code.md) §Pixel-perfect verification), but scoped to the component:

- **Layer fidelity** vs the component's enumerated layer list (not the whole section's).
- **Pixel-perfect** computed styles for this component only.
- **RTL mirror** at the component level — the card mirrors, not just the section.
- **Dark mode** every surface of this component from a token with a `.dark` value.
- **Responsive** at the 12-width matrix ([responsive-verification.md](responsive-verification.md)).

The sub-sub-phase ends with a gate report and a STOP. The next variant only starts on "next".

## What about backend-driven HIGH-risk sections?

If a HIGH-risk section is backend-driven ([section-data-classification.md](section-data-classification.md)), the sub-sub-phases build the **component variants**, not the data items. The component (one variant) consumes the fetched array; the variants are stylistic / structural differences (e.g. "highlighted plan card" vs "default plan card"), not data instances.

Example: `SUBSCRIPTIONS.CATEGORIES` returns 3 plans. There may be **2 component variants** (a "default" card and a "featured" card with a banner). That's 2 sub-sub-phases, not 3 — the third plan reuses the default card with different data.

## Anti-patterns

- **Sub-sub-phasing a LOW-risk section.** Builds friction with no gain. If the score is LOW, build it in one sub-phase.
- **Skipping sub-sub-phases on a HIGH-risk section.** "I'll build all 4 cards in one go, they're similar" — this is exactly the failure mode. Split.
- **Scoring without observable signals.** "It feels complex" → MEDIUM. The signals in this doc are concrete; use them.
- **Re-using a prior card's layer walk for the next card.** Each sub-sub-phase re-fetches `get_design_context` for its own node. No reuse.
- **Bundling two HIGH-risk sub-sub-phases** ("5b.1 and 5b.2 are both small, I'll do them together"). Same defect as bundling sections — bundling defeats the purpose of the split.

## Linked rules

- [task-workflow.md](task-workflow.md) — Phase 5 sub-phasing (this doc adds the sub-sub-phase concept).
- [figma-layer-walk.md](figma-layer-walk.md) — every sub-sub-phase runs its own BFS layer walk.
- [section-data-classification.md](section-data-classification.md) — backend-driven sections still need Phase 1+2 before any sub-sub-phase starts.
- [responsive-verification.md](responsive-verification.md) — the 12-width matrix applies per sub-sub-phase, not just per section.
