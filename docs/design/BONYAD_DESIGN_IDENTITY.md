# Bonyad Design Identity — production identity contract

> **What this is.** The single source of truth for Bonyad's _visual identity_ — fonts,
> colors, tokens, icons, assets, shared components, i18n, and RTL — extracted from the
> **real codebase**, not invented. Any production-design task (new page, redesign, UI/UX
> polish, new component) MUST read this file and use only the values below.
>
> **What this is NOT.** It does not redefine architecture, folder structure, API
> integration, business logic, auth, forms, validation, testing, or coding standards —
> those live in [`/CLAUDE.md`](../../CLAUDE.md) and [`docs/`](../README.md) and stay
> binding. This contract only governs the _look and feel_.
>
> **The design is Claude's own.** Every generated design is composed from this contract +
> the `frontend-design` skill — **never copied, traced, or "matched" from the legacy RN app
> (`website-bonyad/`) or the iOS app (`bonayd-ios/`)**. Those are not visual references (both
> are backend-integration references only).
>
> **Scope rule (important).** These design rules apply **only when a task asks you to
> generate / redesign / restyle a design**. They produce the design layer. Every other
> project rule continues to apply unchanged for everything else.
>
> **Sources of truth (do not contradict):**
>
> - Tokens → [`src/styles/tokens.css`](../../src/styles/tokens.css)
> - Fonts → [`src/lib/fonts.ts`](../../src/lib/fonts.ts)
> - Icons → [`src/components/icons/`](../../src/components/icons) (+ `index.ts`)
> - Shared UI → [`src/components/ui/`](../../src/components/ui)
> - i18n / RTL → [`src/types/locale.ts`](../../src/types/locale.ts), [`src/locales/`](../../src/locales)
> - Theming rules → [`docs/theming.md`](../theming.md) · Responsive → [`docs/responsive-design.md`](../responsive-design.md) · i18n/RTL → [`docs/i18n-and-rtl.md`](../i18n-and-rtl.md)

---

## 1. Typography

### Fonts (from `src/lib/fonts.ts`)

| Role                | Family               | Loader                                                          | CSS variable                                                      | Tailwind utility |
| ------------------- | -------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------- |
| **English / Latin** | **Inter Tight**      | `next/font/google` → `Inter_Tight` (`subsets: ['latin']`)       | `--font-sans-primary` → `--font-sans-stack` → `--font-sans`       | `font-sans`      |
| **Arabic**          | **Noto Sans Arabic** | `next/font/google` → `Noto_Sans_Arabic` (`subsets: ['arabic']`) | `--font-arabic-primary` → `--font-arabic-stack` → `--font-arabic` | `font-arabic`    |
| Mono (data/code)    | system mono stack    | —                                                               | `--font-mono-stack` → `--font-mono`                               | `font-mono`      |

- **Import location (the ONLY place a font is named):** `src/lib/fonts.ts`. Swap fonts there; never add a `@font-face`, Google `<link>`, or new `next/font` call anywhere else.
- **Font stacks (defined in `src/styles/tokens.css`):**
  - `--font-sans-stack: var(--font-sans-primary), system-ui, -apple-system, sans-serif;`
  - `--font-arabic-stack: var(--font-arabic-primary), system-ui, sans-serif;`
  - `--font-mono-stack: ui-monospace, 'SF Mono', Menlo, monospace;`
- **Auto-switch:** `globals.css` sets `:lang(ar) body { font-family: var(--font-arabic); }` — Arabic content uses Noto Sans Arabic automatically; you do not branch on locale for fonts.

### Available font weights (from `src/lib/fonts.ts`)

| Family             | Weights loaded                    |
| ------------------ | --------------------------------- |
| Inter Tight (sans) | `400`, `500`, `600`, `700`        |
| Noto Sans Arabic   | `300`, `400`, `500`, `600`, `700` |

> Do not use a weight that is not in this list — it will not load.

### Type scale

- **No bespoke type scale** — use **Tailwind v4 defaults** (`text-xs … text-9xl`). Confirmed: `tailwind.config.ts` has no `fontSize` override and `tokens.css` defines no size tokens.
- **Body copy stays `text-base`** (never fluid) per [`docs/responsive-design.md`](../responsive-design.md) rule 20.
- **Headings only** may use `clamp()` when discrete scale jumps look bad.
- `text-sm`, not `text-[14px]` — hardcoded `text-[Npx]` only when an exact Figma value has no Tailwind match.

---

## 2. Color

> Tokens are **OKLCH** values in `src/styles/tokens.css`. Hex values below are the
> Figma-matched references recorded in that file's comments — use the **token / Tailwind
> utility**, never the raw hex or oklch. Every `:root` token has a `.dark` counterpart
> (hard rule 19); dark mode is `class`-based (`tailwind.config.ts: darkMode: 'class'`).

### Brand colors

| Token / utility                                            | Light hex ref | Meaning                                                        |
| ---------------------------------------------------------- | ------------- | -------------------------------------------------------------- |
| `--primary` / `bg-primary text-primary-foreground`         | `#00549b`     | Primary brand blue — primary buttons & CTAs                    |
| `--brand-navy` / `text-brand-navy`                         | ~`#00549b`    | Search buttons, browse links                                   |
| `--brand-dark-navy` / `text-brand-dark-navy`               | `#003867`     | "Bonyad" wordmark navy, headings, legal badge                  |
| `--job-accent` / `--about-accent`                          | `#005DAC`     | Vivid blue accent — links, badges, timeline, dashboard accents |
| `--detail-action` / `--status-done-bg` / `--notif-icon-bg` | `#1a6db4`     | Action blue (message buttons, icon circles)                    |
| `--trust-blue-mid`                                         | `#4d8ec5`     | Mid blue (trust cells, logo middle facet)                      |

> ⚠️ **Documented inconsistency** — the brand has **several closely-related blues**
> (`#00549b`, `#005DAC`, `#1a6db4`, `#4d8ec5`, `#003867`). Strongest production patterns:
> **`--primary` (#00549b) for primary actions**, **`--job-accent`/`--about-accent`
> (#005DAC) for links & accents**. Reuse those two; do not introduce a new blue.

### Semantic / state colors

| Token                               | Hex ref              | Use                                     |
| ----------------------------------- | -------------------- | --------------------------------------- |
| `--destructive`                     | red `#ea4335`-family | Errors, destructive actions             |
| `--success`                         | green                | Success states                          |
| `--warning`                         | amber                | Warnings                                |
| `--info`                            | blue                 | Informational                           |
| `--status-approved`                 | `#22c55e`            | Status: approved                        |
| `--status-progress`                 | `#da8a00`            | Status: in-progress                     |
| `--status-offer`                    | `#4d8ec5`            | Status: offer sent                      |
| `--status-rejected`                 | `#ea4335`            | Status: rejected                        |
| `--status-pending` / `--status-bid` | `#8a38f5`            | Status: pending / bid-received (purple) |
| `--status-contract`                 | `#00549b`            | Status: contract signing                |

Many additional **screen-scoped surface tokens** exist (dashboard, notifications, chat,
pricing, blog badges, payment, wizard, etc.) — they are all in `tokens.css`. **Always
search `tokens.css` for an existing token before adding one.**

### Background & surface colors

| Token                                  | Light                           | Dark                         | Use                       |
| -------------------------------------- | ------------------------------- | ---------------------------- | ------------------------- |
| `--background` / `bg-background`       | white                           | near-black `oklch(0.14 0 0)` | Page background           |
| `--card` / `bg-card`                   | white                           | `oklch(0.18 0 0)`            | Card surface              |
| `--popover`                            | white                           | `oklch(0.18 0 0)`            | Popover/menu surface      |
| `--muted` / `--secondary` / `--accent` | light neutral `oklch(0.96 0 0)` | `oklch(0.24 0 0)`            | Subtle fills              |
| `--field-surface`                      | `#f8fafc`                       | dark                         | Form fields, chips, tiles |
| `--dashboard-panel`                    | `#f2f4f5`                       | `oklch(0.18 …)`              | App sidebar / panel       |

---

## 3. Spacing, layout, shape, motion

### Spacing scale

- **Tailwind v4 default 4px scale** (`p-2` = 8px, `gap-4` = 16px, …). No custom spacing tokens. Use the scale; avoid arbitrary `p-[13px]`.

### Container widths (from `docs/responsive-design.md` + real usage)

| Width                     | Use                                           |
| ------------------------- | --------------------------------------------- |
| `max-w-7xl`               | App shells / wide page sections (most common) |
| `max-w-6xl`               | Wide content blocks                           |
| `max-w-3xl` / `max-w-2xl` | Prose / reading columns                       |

- **Content always has a max-width** so lines don't stretch on 4K (responsive rule 4). Use `min-h-dvh`, not `min-h-screen`.

### Breakpoints (Tailwind v4 defaults — **do not override**)

| Variant | Min width  | Device         |
| ------- | ---------- | -------------- |
| (base)  | 0 (≥320px) | small phones   |
| `sm:`   | 640px      | large phones   |
| `md:`   | 768px      | tablets        |
| `lg:`   | 1024px     | small laptops  |
| `xl:`   | 1280px     | desktops       |
| `2xl:`  | 1536px     | large monitors |

- **Verification matrix** (per [`docs/responsive-verification.md`](../responsive-verification.md)): 320 / 375 / 414 / 600 / 768 / 900 / 1024 / 1100 / 1280 / 1366 / 1440 / 1920.
- **Mobile-first ALWAYS.** First line of every section targets 320px. No hardcoded pixel widths/heights on layout containers at base.

### Borders

- Default border color is applied globally: `globals.css` sets `border-color: var(--color-border)` on `*, ::before, ::after`.
- `--border` / `--input`: `oklch(0.92 0 0)` light, `oklch(0.28 0 0)` dark. `--ring`: focus ring.
- Use `border`, `border-border`, `border-input`. Never a hardcoded border color.

### Border radius (from `--radius` in `tokens.css`)

- Base token `--radius: 0.5rem` → `--radius-sm` (calc −4px), `--radius-md` (−2px), `--radius-lg` (=radius), `--radius-xl` (+4px) → utilities `rounded-sm/md/lg/xl`.
- **Most-used in production:** `rounded-full` (pills/avatars/chips), `rounded-lg`, `rounded-xl`, `rounded-md`, `rounded-2xl`.
- ⚠️ **Documented inconsistency** — arbitrary radii (`rounded-[8px]`, `rounded-[6px]`, `rounded-[12px]`, `rounded-[16px]`) appear alongside the scale. **Prefer the named scale**; use an arbitrary radius only to match an exact Figma value with no scale equivalent.

### Shadows

- ⚠️ **Documented inconsistency** — **shadows are NOT tokenized.** `tokens.css` defines no shadow tokens. Production uses a mix of Tailwind `shadow-sm` (most common), `shadow-md/lg/xl`, and arbitrary soft shadows, e.g. `shadow-[0px_4px_10px_rgba(0,0,0,0.03)]`, `shadow-[0px_2px_20px_0px_rgba(0,0,0,0.1)]`, `shadow-[0px_12px_24px_rgba(0,0,0,0.1)]`.
- **Strongest approved pattern:** `shadow-sm` for resting cards; reuse one of the existing arbitrary soft shadows above for elevated surfaces rather than inventing a new one. (Arbitrary rgba in a `shadow-[…]` utility is the one tolerated exception to the no-raw-color rule, since there is no shadow token to use.)

### Motion (from `tokens.css`)

| Token                   | Value                           | Utility          |
| ----------------------- | ------------------------------- | ---------------- |
| `--motion-fast`         | `150ms`                         | `duration-fast`  |
| `--motion-base`         | `250ms`                         | `duration-base`  |
| `--motion-slow`         | `400ms`                         | `duration-slow`  |
| `--motion-easing`       | `cubic-bezier(0.16, 1, 0.3, 1)` | `ease-out-quint` |
| `--motion-easing-decel` | `cubic-bezier(0.2, 0, 0, 1)`    | `ease-decel`     |

- Animation libs available: **`framer-motion`** and **`lottie-react`** (in `package.json`). Respect `prefers-reduced-motion` (already enforced in `globals.css`).

---

## 4. Iconography

- **Library:** local SVGs exported from Figma, living in [`src/components/icons/`](../../src/components/icons) and re-exported as React components from `src/components/icons/index.ts`. (~87 icon files.)
- **Mechanism:** `@svgr/webpack` (configured in `next.config.ts`) turns `*.svg` imports into components: `import { LogoIcon } from '@/components/icons'`.
- **System glyphs:** **`lucide-react`** (`package.json`) is allowed ONLY for system glyphs whose default form matches the design (hard rule 15).
- **Color:** icon SVGs use `currentColor` so they inherit text color. Never hardcode icon fills/strokes.
- **Standard sizes (from usage):** `size-4` (16px, default — buttons auto-apply `[&_svg]:size-4`), `size-5` (20px), `size-6` (24px), `size-10` (40px, icon buttons). Match the Figma node size.
- **Directional icons:** one `ChevronRight` + a single flip class (`ltr:-scale-x-100` for forward, `rtl:-scale-x-100` for inward) — never a `dir === 'rtl' ? … : …` conditional (hard rule 4, [`docs/i18n-and-rtl.md`](../i18n-and-rtl.md)).
- **No invented icons** — exact Figma export, same `viewBox`/path data; only edit is hardcoded fill/stroke → `currentColor` (hard rule 21).

---

## 5. Logo & approved assets

### Logo

- **Primary mark:** [`src/components/icons/logo.svg`](../../src/components/icons/logo.svg) → exported as `LogoIcon` (104×40 viewBox).
- **App icon:** `src/app/apple-icon.tsx`.
- **Sidebar logout glyph:** `src/components/icons/sidebar-logout.svg`.
- ⚠️ **Documented inconsistency** — `logo.svg` uses **hardcoded brand hexes** (`#005DAC`, `#00549B`, `#4D8EC5`) instead of `currentColor`. This is acceptable for a multi-color brand mark (an explicit exception to the currentColor rule) — **do not "fix" it to currentColor.**

### Approved image paths (under `public/images/`)

Organized by area — reuse these, do not pull external imagery:

- `public/images/bg/` — page backgrounds (about-hero, how-it-works-hero, customer-dashboard-skyline, success-bg-\*.svg, contact-blob.svg, about-pillar-vision.jpg)
- `public/images/hero/` — hero art (bg-shapes, cta-bg.svg, feature, trust-badge-icon, absher/nafath)
- `public/images/how-it-works/` — step illustrations & blobs (step-_, blob-_, ellipse-\*)
- `public/images/technicians/` — card-1..3.webp
- `public/images/browse/` — service icons + card accents
- `public/images/trust/`, `public/images/services/`, `public/images/blog/`, `public/images/team/`, `public/images/common/`, `public/images/contact/`, `public/images/messages/`, `public/images/signing/` (absher.jpg, nafath.png), `public/images/login/bg.png`
- **Illustrations:** [`src/components/illustrations/`](../../src/components/illustrations) (component SVGs, e.g. payment-success ticks).
- **Brand context:** Bonyad is a **Saudi construction / verified-technician marketplace** — imagery reflects Saudi construction, skylines, and trust/verification cues (Absher/Nafath). Keep that identity; do not substitute generic stock.

---

## 6. Shared components (reuse before building)

- **Primitives:** [`src/components/ui/`](../../src/components/ui) — `Button` (+ `buttonVariants`), `Card` (+ `CardHeader/Content/Footer/Title/Description`), `Input`, `Textarea`, `Label`, `FieldHint`, `Modal` (+ `ModalHeader/Footer`), `Separator`, `Skeleton`. Import from `@/components/ui`.
  - `Button` variants: `default | secondary | destructive | outline | ghost | link`; sizes: `sm | md | lg | icon`; base radius `rounded-md`.
- **Layout:** [`src/components/layout/`](../../src/components/layout) — header, footer, sidebar, nav, etc.
- **Other shared:** `src/components/feedback/`, `src/components/seo/`, `src/components/illustrations/`, `src/components/avatar.tsx`.
- **Utility:** `cn()` from `@/lib/utils` for class merging (clsx + tailwind-merge).
- **Rule:** features cannot import from other features (hard rule 6). Lift shared code to `src/components/`. **Reuse an existing component before creating a new one.**

---

## 7. i18n (internationalization)

- **Stack:** `react-i18next` + `i18next` (`package.json`).
- **Locale files:** [`src/locales/en.json`](../../src/locales/en.json), [`src/locales/ar.json`](../../src/locales/ar.json). Locales: `['en', 'ar']` (`src/types/locale.ts`).
- **Usage:** every user-facing string is `t('namespace.key')` — **no hardcoded JSX text** (hard rule 5). Server-side strings via `getTranslations(locale)` (`src/lib/get-translations`).
- **Adding copy:** add the key to **both** `en.json` and `ar.json` in the same change. Empty states use locale copy, never a hardcoded fallback array.
- Full rules: [`docs/i18n-and-rtl.md`](../i18n-and-rtl.md).

---

## 8. RTL / LTR (direction)

- **Inverted mapping (product decision)** — `src/types/locale.ts`:
  - `LOCALE_DIRECTION = { en: 'rtl', ar: 'ltr' }`
  - `LOCALE_TAG = { en: 'en', ar: 'ar-SA' }`
- **Never read `locale === 'ar'` for layout** — go through `LOCALE_DIRECTION[locale]` or logical CSS.
- **Logical Tailwind utilities only** — `ms-*/me-*/ps-*/pe-*/start-*/end-*/text-start/text-end`. Physical (`ml/mr/pl/pr/left/right/text-left/text-right`) are banned (hard rule 4). **Default to `-end`** for card/content alignment.
- **Custom variants** (`tokens.css`): `@custom-variant rtl (&:where([dir=rtl], …))` / `ltr` are keyed on `<html dir>` only, so `rtl:` fires in **en** and `ltr:` in **ar**.
- **Visuals mirror by default in `en`** — raster images + decorative SVGs carry `rtl:-scale-x-100`; opt out only for logos, text-bearing graphics, faces, oriented maps.
- **`dir="auto"`** is opt-in for **dynamic/user content** or **punctuated translated copy** only — never on static UI labels (the most-repeated bidi mistake). See [`docs/i18n-and-rtl.md`](../i18n-and-rtl.md) and the project memory.
- **Verify both directions** every design task.

---

## 9. Accessibility & quality floor (always on)

- WCAG 2.2 AA target (hard rule 13): no `outline: none` (global `:focus-visible` ring already set), every icon-only button has `aria-label`, every input has a real `<label>`, touch targets ≥ 44×44px on mobile.
- Server Component by default; `'use client'` only at the leaf that needs it (hard rule 9).
- Dark mode verified per section (every surface from a token with both `:root` and `.dark` values).

---

## 10. Inconsistencies found in the existing system (and the chosen canonical pattern)

| #   | Inconsistency                                                                                         | Canonical pattern to follow (do NOT add a third)                                                                      |
| --- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | **Shadows are not tokenized** — mix of `shadow-sm/md/lg` and arbitrary `shadow-[…rgba…]`.             | `shadow-sm` for resting cards; reuse an existing arbitrary soft shadow for elevation. Don't invent new shadow values. |
| 2   | **Radii** — named scale (`rounded-lg/xl/full`) coexists with arbitrary `rounded-[8px/6px/12px/16px]`. | Prefer the named scale; arbitrary radius only for an exact Figma match.                                               |
| 3   | **Multiple near-identical brand blues** — `#00549b`, `#005DAC`, `#1a6db4`, `#4d8ec5`, `#003867`.      | `--primary` (#00549b) for primary actions; `--job-accent`/`--about-accent` (#005DAC) for links/accents.               |
| 4   | **`logo.svg` uses hardcoded hex** instead of `currentColor`.                                          | Intentional exception for the multi-color brand mark — leave as-is.                                                   |
| 5   | **No bespoke type/spacing scale** — relies on Tailwind defaults.                                      | Use Tailwind defaults; body `text-base`; headings may `clamp()`.                                                      |

> When the codebase shows competing patterns, **pick the strongest, most-repeated,
> approved one above** and stay consistent. Never introduce a new third visual pattern.

---

## 11. Signature decorative element — color ellipse / glow blobs

Bonyad's production design is **not flat**. The recurring on-brand "signature" that gives
pages color depth is the **soft color ellipse glow** (a large, heavily-blurred, low-opacity
colored circle behind content) plus **decorative ellipse/blob SVGs**. Use these to add
color richness — **always from existing tokens and assets, never a new hardcoded color**
(the no-hardcoded-color ESLint rule now enforces this).

### Glow-color tokens (each has a `:root` + `.dark` pair)

| Token / utility                                 | Glow color                                                  |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `bg-deco-blob-blue-light`                       | soft blue (the default, most-used glow)                     |
| `bg-deco-blob-green`                            | soft emerald glow                                           |
| `bg-deco-blob-purple`                           | violet glow (e.g. the project-detail "Ellipse 27" top glow) |
| `bg-pillar-blob`                                | very light blue cloud (top of Value/Mission cards)          |
| `from-step-section-from` → `to-step-section-to` | section gradient wash (how-it-works steps)                  |
| `bg-about-accent` / `bg-job-accent`             | vivid `#005DAC` accent for small dots/markers               |

### Canonical glow pattern (mirror this exactly — from `tech-success-stories.tsx`)

```tsx
{
  /* Decorative color-ellipse glow — behind content, never interactive */
}
<div className="pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex">
  <div className="bg-deco-blob-blue-light h-[500px] w-[500px] rounded-full opacity-20 blur-[80px]" />
</div>;
```

### Ready-made decorative ellipse / blob assets (under `public/images/`)

- `how-it-works/ellipse-left.svg` · `ellipse-right.svg` · `blob-1.svg` · `blob-2.svg`
- `bg/success-bg-1…4.svg` · `bg/contact-blob.svg` · `hero/cta-bg.svg` · `hero/bg-shapes.webp`

### Rules for decorative ellipses (non-negotiable)

1. **Color from a token only** — `bg-deco-blob-*` / `bg-pillar-blob` / gradient stop tokens. Never `bg-[#…]` (lint error).
2. **Behind content, inert** — `pointer-events-none absolute inset-0`, low `opacity-10…25`, large `blur-[60px…120px]`, `rounded-full`.
3. **Desktop-gated** — hardcoded-coordinate / large fixed-size blobs are `hidden sm:flex` or `hidden lg:block` (responsive rule 20); they must never cause horizontal scroll at 320px.
4. **Mirror in `en`** — decorative SVG/image ellipses carry `rtl:-scale-x-100` (fires in `en` under the inverted mapping) so the composition mirrors with the layout.
5. **Dark mode** — only use glow tokens that have a `.dark` pair (all the ones above do); verify the glow still reads on the dark surface.
6. **Restraint** (per the `frontend-design` skill) — one signature glow moment per section, kept quiet; don't scatter blobs everywhere or it reads as AI-generated.
