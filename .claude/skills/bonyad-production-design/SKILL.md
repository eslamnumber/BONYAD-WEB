---
name: bonyad-production-design
description: Implements or redesigns production Bonyad web interfaces using the existing Bonyad identity, fonts, icons, assets, components, architecture, API integration, i18n, Arabic RTL, responsive rules, accessibility requirements, and business logic. Use whenever creating, redesigning, styling, or visually improving any Bonyad frontend page, layout, component, form, dashboard, or user flow.
argument-hint: '<page, route, feature, or component>'
---

# Bonyad Production Design

You are implementing **production-ready frontend code directly inside the existing Bonyad
Next.js app**. **The design is generated in-house — you never fetch it from Figma.** Skip
every Figma-fetch step (`get_metadata`, `get_design_context`, `get_screenshot`,
`get_variable_defs`, layer walks, the `visited_nodes` cache, the leaf pixel ledger, Figma
icon/asset export). Those run **only** if the user explicitly hands over a Figma link and
asks to import it. You take a design requirement and ship real, integrated, tested UI that
matches Bonyad's existing identity. **Skipping the Figma fetch is the only deviation** — the
phased workflow, every non-Figma rule, and the mandatory end-of-task rule gate (below) all
apply in full.

**The design is your own.** Compose it from the Bonyad identity contract + `frontend-design`
judgment. **Never use the legacy RN app (`website-bonyad/`) or the iOS app (`bonayd-ios/`) as
a visual / UI / design reference** — not their screens, layout, composition, or component
styling. Both the RN and iOS apps are _backend-integration_ references only (endpoints / auth
/ shapes) — never visual ones. Tracing or "matching" another Bonyad app's look is a defect —
create the web design fresh within the shared identity.

> **Scope note.** These design rules apply **only when the task is to generate, redesign,
> restyle, or visually improve a design**. This skill produces _the design layer_. Every
> other project rule (architecture, API, business logic, auth, forms, validation, state,
> i18n file organization, testing, naming) continues to apply unchanged for all work.

## Required identity and companion skill

For every page, component, layout, or frontend design task, read and apply:

1. `/CLAUDE.md`
2. `/docs/design/BONYAD_DESIGN_IDENTITY.md`
3. `/.claude/skills/frontend-design/SKILL.md`
4. Existing project architecture and feature rules
5. Existing implementation of the requested route
6. Existing shared components
7. Existing i18n and RTL implementation
8. Existing API integration and business logic

The `frontend-design` skill controls:

- Visual composition
- Typography quality
- Hierarchy
- Spacing precision
- Interaction polish
- Responsive visual quality
- Avoidance of templated AI-generated design

The Bonyad identity contract controls:

- Existing fonts
- Existing icon library
- Existing logo and assets
- Existing brand colors
- Existing design tokens
- Existing component patterns
- Saudi construction identity
- Arabic RTL
- English LTR
- Bonyad-specific visual consistency

The existing project rules control:

- Folder structure
- Architecture
- API integration
- Business logic
- Authentication and authorization
- Forms and validation
- State management
- i18n file organization
- Testing
- Naming and coding conventions

## Instruction priority

When instructions conflict, follow this order:

1. Security, business rules, and API contracts
2. `CLAUDE.md` and mandatory project rules
3. Existing production behavior
4. Existing approved Bonyad identity and assets
5. `docs/design/BONYAD_DESIGN_IDENTITY.md`
6. The Bonyad production-design skill
7. The general frontend-design skill

## Restrictions

The frontend-design skill may improve execution quality, but it must not:

- Replace Bonyad's fonts
- Import arbitrary new fonts
- Replace Bonyad's icon library
- Introduce a second icon library
- Replace Bonyad's logo
- Invent a new color palette
- Introduce a new design system
- Ignore existing components
- Ignore project folder rules
- Hardcode visible text
- Replace the i18n system
- Break Arabic RTL
- Modify API contracts
- Change business logic for visual reasons
- Generate Figma files
- Create standalone mockups
- Create a separate prototype application
- Mirror, trace, or "match" the RN app (`website-bonyad/`) or the iOS app (`bonayd-ios/`) — their screens, layout, composition, and component styling are NOT a design reference (both are backend-integration references only)

## Production design workflow (replaces the previous Figma-generation phase)

```
Understand requirements
→ inspect existing Bonyad identity
→ apply frontend-design quality principles
→ implement directly in production
→ integrate real state and APIs
→ add or reuse translations
→ verify RTL and LTR
→ verify responsive behavior
→ run the mandatory end-of-task rule gate
```

Do **not** generate Figma files, Figma prompts, static mockups, design-only HTML, or
separate prototypes — unless the user explicitly asks for Figma/mockups in their request.

### What each step means here

1. **Understand requirements** — what page/component/flow, which role(s), which states
   (loading / empty / error / success). If unclear, ask; don't guess.
2. **Inspect existing Bonyad identity** — read [`docs/design/BONYAD_DESIGN_IDENTITY.md`](../../../docs/design/BONYAD_DESIGN_IDENTITY.md):
   tokens, fonts, icons, shared components, assets. Reuse before inventing.
3. **Apply frontend-design quality principles** — composition, hierarchy, spacing,
   typography, motion, restraint — _within_ the Bonyad identity (its tokens, fonts,
   icons, palette). The frontend-design skill raises execution quality; it never
   overrides the identity contract or project rules.
4. **Implement directly in production** — real files in `src/app/` (routes only) and
   `src/features/<f>/` / `src/components/`. Server Component by default; `'use client'`
   only at the leaf that needs it. Respect file/function size caps.
5. **Integrate real state and APIs** — backend-driven content is never hardcoded.
   Fetch via the TanStack Query hook in `features/X/api/` (or in the RSC for
   public/SEO pages). No `fetch()` outside `src/lib/api-client.ts`; no endpoint
   literal outside `src/config/endpoints.ts`. Ship the sibling `*.test.ts`.
   See [`docs/api-and-auth.md`](../../../docs/api-and-auth.md), [`docs/state-management.md`](../../../docs/state-management.md),
   [`docs/section-data-classification.md`](../../../docs/section-data-classification.md).
6. **Add or reuse translations** — every string via `t('namespace.key')`; add keys to
   both `src/locales/en.json` and `ar.json`. No hardcoded JSX text.
7. **Verify RTL and LTR** — logical utilities only; remember the inverted mapping
   (`en → rtl`, `ar → ltr`); check both directions. See [`docs/i18n-and-rtl.md`](../../../docs/i18n-and-rtl.md).
8. **Verify responsive behavior** — mobile-first from 320px; check the 12-width matrix
   (320 / 375 / 414 / 600 / 768 / 900 / 1024 / 1100 / 1280 / 1366 / 1440 / 1920).
   See [`docs/responsive-design.md`](../../../docs/responsive-design.md) + [`docs/responsive-verification.md`](../../../docs/responsive-verification.md).
9. **Run the mandatory end-of-task rule gate** — see below. This is the single required
   gate; there are no per-phase stops.

## Mandatory end-of-task rule gate (non-negotiable)

Every generated design ends with **one** verification pass. Run it and post a summary before
reporting the task done — do not skip it, do not claim green without output. Full template:
[`docs/task-workflow.md`](../../../docs/task-workflow.md) §Generated-design end-of-task gate.

1. **Commands — run and paste real output:** `pnpm lint`, `pnpm typecheck`, the relevant
   `pnpm test`, `pnpm build`.
2. **Five axes** (observe if a session/preview exists, otherwise reason explicitly and _say
   which_): layer→DOM fidelity (no untraceable wrappers, nothing dropped) · values trace to a
   **token + the stated design intent** (no eyeballed-arbitrary numbers) · **RTL _and_ LTR**
   (logical utilities, inverted `en→rtl` mapping, `dir="auto"` on dynamic/punctuated copy
   only) · **dark** (every surface incl. glow/background layers from a token with a `.dark`
   pair) · **responsive** (mobile-first; 12-width matrix 320…1920; no horizontal scroll;
   touch targets ≥ 44px ≤ 768).
3. **Cross-cutting rules:** tokens-only · i18n keys in both `en.json` + `ar.json` ·
   file/function caps · a11y AA · data classification with all states rendered · per-endpoint
   tests if an endpoint was added.
4. **Docs:** name the files touched per `doc-maintenance.md`, or write "no doc update
   required" with the reason.

> **Verification honesty.** Authenticated screens usually have no preview session (the preview
> hits the real backend, no browser MSW), so you'll _reason_ about RTL/dark/responsive rather
> than _observe_ them. Say so in the report — never present reasoned axes as rendered-and-seen.

## Hard identity guardrails (non-negotiable for design tasks)

- **Tokens only** — no hex/rgb/hsl or font-family literals outside `src/styles/tokens.css`
  (the one tolerated exception is an arbitrary `shadow-[…rgba…]`, since shadows are not
  tokenized — see the identity contract §3).
- **Fonts:** Inter Tight (Latin) + Noto Sans Arabic (Arabic), loaded only in
  `src/lib/fonts.ts`. Never import a new font.
- **Icons:** SVG exports in `src/components/icons/` (via `@svgr/webpack`), `currentColor`;
  `lucide-react` only for matching system glyphs. No invented icons, no second icon lib.
- **Logo:** `src/components/icons/logo.svg` (`LogoIcon`). Don't replace or recolor.
- **Components:** reuse `src/components/ui/*` and `src/components/layout/*` before building
  new ones. Features can't import from other features — lift shared code to `src/components/`.
- **A11y:** WCAG 2.2 AA — labels, `aria-label` on icon-only buttons, visible focus,
  ≥44px touch targets.

## Production-ready, and explicitly Bonyad — add color depth (don't ship flat)

Every output is **production-ready** (real APIs/state, translations, RTL+LTR, responsive,
a11y, tests/build) **and visibly Bonyad** — not a generic template. Give pages on-brand
color depth using Bonyad's **signature decorative color ellipse / glow blobs**
(identity contract §11): soft, blurred, low-opacity colored ellipses behind hero/section
content, plus the ready-made ellipse/blob SVGs in `public/images/`.

- Colors come **only from the glow tokens** — `bg-deco-blob-blue-light` / `-green` /
  `-purple`, `bg-pillar-blob`, the `step-section-*` gradient stops, `bg-about-accent`.
  **Never `bg-[#…]`** — the new ESLint rule fails the build on hardcoded colors.
- Use the canonical inert pattern (`pointer-events-none absolute inset-0` + `rounded-full`
  - `opacity-10…25` + `blur-[60–120px]`), desktop-gate large blobs (`hidden sm:flex` /
    `lg:block`), mirror decorative SVGs with `rtl:-scale-x-100`, and confirm a `.dark` pair.
- **Restraint:** one signature glow per section (per the `frontend-design` skill) — depth,
  not clutter. See [`docs/design/BONYAD_DESIGN_IDENTITY.md`](../../../docs/design/BONYAD_DESIGN_IDENTITY.md) §11 for the exact pattern.

## Where the rest of the rules live

This skill governs the design layer only. For everything else read the focused docs via
[`docs/README.md`](../../../docs/README.md):
[`folder-structure.md`](../../../docs/folder-structure.md) ·
[`components.md`](../../../docs/components.md) ·
[`forms-validation.md`](../../../docs/forms-validation.md) ·
[`theming.md`](../../../docs/theming.md) ·
[`accessibility.md`](../../../docs/accessibility.md) ·
[`testing.md`](../../../docs/testing.md) ·
[`naming.md`](../../../docs/naming.md) ·
[`file-size-limits.md`](../../../docs/file-size-limits.md).
