# Responsive design

Bonyad supports every screen from 320 px (small phone) to 4K monitors. **Mobile-first** — default classes target the smallest screen; `sm:` / `md:` / `lg:` / `xl:` / `2xl:` scale up.

## Breakpoint scale (Tailwind v4 defaults — do not override)

| Variant | Min width | Typical device          |
| ------- | --------- | ----------------------- |
| (base)  | 0         | small phones (≥ 320 px) |
| `sm:`   | 640 px    | large phones / phablets |
| `md:`   | 768 px    | tablets                 |
| `lg:`   | 1024 px   | small laptops           |
| `xl:`   | 1280 px   | desktops                |
| `2xl:`  | 1536 px   | large monitors          |

## Hard rules

1. **Mobile-first ALWAYS.** Default classes target 320 px. Every layout choice that diverges for tablet/desktop is added behind `sm:`/`md:`/`lg:`/`xl:`. **The first JSX line written for every section is the 320 px layout** — never copy the Figma desktop pixels into base classes and "make it work on mobile later." That ordering produces broken mobile every time. Never write `max-md:` unless absolutely necessary.
2. **Touch targets ≥ 44 × 44 CSS px on mobile** (WCAG 2.5.5). Buttons, icon-only controls, links.
3. **No horizontal scroll, ever.** Test at 320 px in DevTools after every section. Run the assertion `document.documentElement.scrollWidth === window.innerWidth`. If it fails, find the offender via `document.querySelectorAll('*')` and trim it — do NOT mask with `overflow-x-hidden` on `<body>`.
4. **Content has a max-width** so reading lines don't stretch on 4K monitors. `max-w-3xl` for prose, `max-w-7xl` for app shells.
5. **Use `min-h-dvh`, not `min-h-screen`** — `dvh` accounts for mobile browser chrome (URL bar / keyboard).
6. **`text-sm`, not `text-[14px]`** — keeps users' browser zoom usable. Hardcoded `text-[Npx]` is allowed only when an exact Figma value has no closest Tailwind scale match.
7. **Hover is desktop-only.** Anything that depends on `:hover` MUST also work via `:focus-visible` and `:active`.
8. **Bottom-fixed UI uses `pb-[env(safe-area-inset-bottom)]`** so it doesn't clip on notched iPhones.
9. **No hardcoded pixel widths or heights on layout containers.** `w-[1200px]`, `h-[800px]`, `max-w-[1440px]`, `w-[438px]`, `h-[622px]` — banned at the base level. Layout containers (sections, grids, columns, shells, cards, hero panels) must scale via Tailwind's responsive scale, percentage widths (`w-full`), or container queries.
   - `w-[Npx]` is allowed ONLY:
     - on **intrinsically-sized atoms** (icon glyphs `size-4`, a 48 px avatar, a logo with a fixed aspect),
     - or behind a breakpoint variant (`md:w-[518px]`, `lg:h-[622px]`) — with a corresponding mobile-first base value (`w-full` / `min-h-…`).
   - Fixed heights on text-bearing containers (e.g. `h-[48px]` on a `<p>` that holds a translated string) are banned because Arabic text wraps differently and will clip — use `line-clamp-N` or no height at all.
   - The Figma desktop frame is ONE breakpoint; you must build for the others. If the Figma file only ships desktop, ask the designer for mobile + tablet frames before writing JSX — never approximate.
10. **No `overflow-x-auto` carousel hack for "make it fit."** Horizontal scrolling rows of fixed-width cards (`flex gap-4 overflow-x-auto` + `w-[Npx]` children) are banned for the marketing site — they hide content and produce truncated copy. Use responsive grids (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`) so every card is visible at every breakpoint. `overflow-x-auto` is only allowed for genuinely scrollable surfaces like a chat thread or a table — never as a substitute for a real responsive grid.
11. **Decorative absolutely-positioned elements (`absolute start-[Npx] top-[Npx]`) must be hidden below their design breakpoint.** Earnings pills, ellipse markers, hero shapes — these are desktop garnish; on mobile they overflow or clip. Wrap them in `hidden lg:block` (or whichever breakpoint owns them). Functional content is never absolute-positioned with hardcoded coordinates; it lives in the normal flow.
12. **Section padding scales with the viewport.** `py-12 sm:py-16 lg:py-20` (or equivalent) — not a flat `py-20` everywhere. The Figma desktop frame's 80 px section padding is suffocating on a 320 px phone.

### Sub-rule: hero / panel-shaped sections

Hero and full-bleed panels are the most common offenders because the Figma desktop frame has a fixed `1280 × 622` shape that gets copy-pasted into base classes. Use this template:

```tsx
<div className="bg-card relative min-h-[420px] overflow-hidden rounded-xl lg:h-[622px]">
  {/* Decorative shapes — desktop only */}
  <DecorativeShape className="hidden lg:block …" />

  {/* Content stays in flow on mobile, absolutely centered on lg+ */}
  <div className="relative flex flex-col items-center gap-6 px-4 py-12 sm:px-6 lg:absolute lg:inset-0 lg:justify-center lg:py-0">
    …
  </div>
</div>
```

Key moves: `min-h-[…]` not `h-[…]` on mobile, `lg:h-[…]` for the exact desktop pixel; `hidden lg:block` on every desktop-only decoration; content uses normal flow on mobile (`relative … py-12`) and absolute positioning only at `lg:` and above.

## Layout patterns (Facebook / X / LinkedIn style)

### Public marketing (already implemented)

| Screen  | Pattern                                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Mobile  | header collapses to logo + toggles → hamburger drawer for nav → stacked main → multi-column footer collapses to single column |
| Desktop | full header with horizontal nav → centered main (`max-w-7xl`) → 4-column footer                                               |

See `src/components/layout/{header,footer,app-shell}.tsx`. Header already does `hidden md:flex` on nav links; mobile drawer is the next addition when needed.

### Authenticated app surface (future — copy this pattern)

```
Mobile (≤ md):    [sticky top header]
                  [single-column main feed]
                  [sticky bottom tab nav]

Tablet (md–lg):   [sticky header]
                  [2-column: side rail | main]

Desktop (≥ lg):   [sticky header]
                  [3-column: nav | main | right rail]

Wide (≥ 2xl):     same 3-column · content max-w-2xl in center ·
                  sidebars max-w-xs each · gutters absorb the rest
```

This is the canonical pattern Facebook, X, LinkedIn, Reddit, Instagram all use. Don't reinvent it.

## Stacking order for asymmetric columns

When a section has two columns and one column holds a **single item** (a heading + body + CTA block, a single illustration, a single card) while the other holds **multiple items** (a stack of cards, an illustration + floating badges + markers), the single-item column **must come first in source order**. Source order is mobile stacking order — the meaningful content column must lead when the layout collapses to one column on narrow viewports.

```tsx
// ✅ Content (1 block) first, decorative column (wave + badge + marker) second
<div className="flex flex-col lg:flex-row">
  <ContentBlock /> {/* single item — leads on mobile */}
  <IllustrationCluster /> {/* multi-item — follows on mobile */}
</div>
```

```tsx
// ❌ Multi-item column first — pushes the headline below decoration on mobile
<div className="flex flex-col lg:flex-row">
  <IllustrationCluster />
  <ContentBlock />
</div>
```

The same rule applies when the desktop layout is `xl:absolute` (each child absolutely-positioned within a `relative` parent): put the single-item content block first in the JSX so the natural-flow fallback (below the gate) leads with it.

**Gate Figma-pixel offsets behind the breakpoint that matches the Figma frame width — that's `xl:` (1280px) for most Bonyad frames, not `lg:` (1024px).** At `lg` the card is roughly 992px wide and the absolute coordinates designed for 1280 still overflow / overlap. Using `lg:` was a real regression — the wave decoration overlapped the heading text on every viewport from 1024–1279px. Reserve `lg:absolute` only when the Figma frame is authored at lg width.

Real regression: `src/features/home/components/home-start-cta.tsx` (`ProCta`) — the wave decoration was both sourced first AND gated at `lg:`, so on viewports 1024–1279px the wave rendered behind the heading and clipped the Arabic text. Reordering content-first AND raising the gate to `xl:` fixed it. See also [figma-to-code.md](figma-to-code.md) §Pixel-perfect verification axis 4.

## Typography per breakpoint

```tsx
<h1 className="text-3xl sm:text-4xl lg:text-5xl">…</h1>
<h2 className="text-2xl sm:text-3xl">…</h2>
<h3 className="text-xl sm:text-2xl">…</h3>
<p  className="text-base sm:text-lg">…</p>
```

Body copy stays roughly `text-base` (16 px) — bumping it on desktop is feature-specific.

## Spacing per breakpoint

```tsx
<section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:py-24">
```

Padding/gap grows with screen size. Never use `p-12` everywhere — phones can't afford it.

## Grids

1 → 2 → 3 → 4 columns as the viewport grows:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

For sidebars + main, use `grid grid-cols-[16rem_1fr]` or `flex gap-6`.

## Container queries (component-level responsive)

Tailwind v4 supports `@container` natively. Use when a component needs to respond to its OWN width, not the viewport:

```tsx
<aside className="@container">
  <article className="@md:text-base @lg:text-lg text-sm">…</article>
</aside>
```

Solves the "same card looks different in main vs sidebar" problem without prop drilling.

## Images

```tsx
<Image
  src={src}
  alt={alt}
  width={1200}
  height={630}
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
  className="rounded-md object-cover"
/>
```

- Always `next/image` (auto AVIF/WebP, lazy-loaded, prevents CLS).
- `sizes` is **mandatory** for any image that scales with viewport — otherwise the browser pulls the largest variant on every device.

## Per-section test matrix (run before declaring a section done)

Resize the viewport to **320 / 768 / 1280 px** as the per-section gate — these are the floor, the tablet checkpoint, and the desktop checkpoint. Anything past 1280 px is covered by `max-w-*` containers.

| Width   | What to check                                                        |
| ------- | -------------------------------------------------------------------- |
| 320 px  | no horizontal scroll, no clipped text/buttons, touch targets ≥ 44 px |
| 768 px  | tablet layout engaged (2-col grids, drawer collapses, etc.)          |
| 1280 px | desktop layout matches the Figma desktop frame                       |

Repeat the 320 / 768 / 1280 trio in **EN + AR** (mirror correctness) and **light + dark** (token coverage). A section that passes desktop-only is **not** done. See [figma-to-code.md](figma-to-code.md) §Pixel-perfect verification axis 4.

### Per-PR test matrix (full sweep before requesting review)

After every section is gated individually, run the wider matrix on the full screen:

| Width       | Device       | Check                                 |
| ----------- | ------------ | ------------------------------------- |
| 320 × 568   | iPhone SE 1  | nothing clipped, no horizontal scroll |
| 412 × 915   | Pixel 7      | touch targets 44 px+                  |
| 768 × 1024  | iPad         | 2-column layout activates             |
| 1280 × 800  | small laptop | desktop pattern engages               |
| 1920 × 1080 | full HD      | max-w stops growth                    |
| 2560 × 1440 | QHD          | content doesn't stretch               |

Each width in **EN + AR** and **light + dark** (4 variants per width). The RTL flip must mirror cleanly at every breakpoint.

## Common pitfalls

- ❌ `h-screen` for hero — use `min-h-dvh` so mobile chrome doesn't clip.
- ❌ Hardcoded `h-[800px]` — breaks on phones; use `aspect-*` or `min-h-*`.
- ❌ Multi-line buttons without `leading-tight` — wrap weirdly at narrow widths.
- ❌ Sticky elements without `top-[env(safe-area-inset-top)]` padding on iPhones with notch.
- ❌ `overflow-x-hidden` on `<body>` to mask horizontal scroll — fix the root cause instead.
- ❌ Modal that's `90vw` on every screen — make it `max-w-md` on small, `max-w-lg` on `md:`, etc.
- ❌ `hover:` states with no `focus-visible:` fallback — keyboard / mobile users get no feedback.
- ❌ Two-column section that puts the multi-item (decorative) column before the single-item (content) column in source order — content gets pushed below the decoration when the layout collapses on mobile. See §Stacking order for asymmetric columns above.

## Anti-pattern catalogue — real regressions from this codebase

These are the exact mistakes that produced a desktop-only home page on this project. Read them carefully — every entry below was a real bug in `src/features/home/` that had to be unwound.

| ❌ Anti-pattern                                                                                                                | Why it breaks                                                                                                                                                                                                                                                                                                                                               | ✅ Replacement                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className="h-[622px]"` on a hero panel                                                                                        | Locks the hero to a 622 px box at every viewport. On a 480 px tall phone, content overflows; on a 320 px wide phone, layout doesn't reflow.                                                                                                                                                                                                                 | `min-h-[420px] lg:h-[622px]` + content in normal flow on mobile, absolute-positioned only at `lg:`.                                                                                                                                                                                                                                                                                                             |
| `className="w-[847px] flex flex-wrap"` for a bento grid                                                                        | Fixed 847 px row overflows every breakpoint below xl. `flex-wrap` doesn't help because children also have fixed widths.                                                                                                                                                                                                                                     | `grid grid-cols-1 sm:grid-cols-6 lg:w-[847px]` with cards spanning columns (`sm:col-span-2`, `sm:col-span-4`, etc.).                                                                                                                                                                                                                                                                                            |
| `className="flex h-[221px] w-[318px] shrink-0"` on each step card                                                              | Cards exceed the viewport on mobile, then the parent uses `overflow-x-auto` to hide the failure. Users only ever see the first 1.5 cards.                                                                                                                                                                                                                   | `w-full min-h-[180px] sm:min-h-[221px]` + a real grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.                                                                                                                                                                                                                                                                                                              |
| `text-[56px]` on the hero `<h1>`                                                                                               | 56 px headline on a 320 px viewport: 4 words per line max, breaks awkwardly, or overflows the container.                                                                                                                                                                                                                                                    | `text-3xl sm:text-4xl md:text-5xl lg:text-[56px]` — scale into the Figma pixel only at the breakpoint that designed for it.                                                                                                                                                                                                                                                                                     |
| `absolute start-[236px] top-[52px]` on a decorative pill                                                                       | Fixed pixel coordinates assume a 1280 px container. On a 360 px container the pill sits 236 px from start — off-screen or clipped.                                                                                                                                                                                                                          | Either wrap it in `hidden lg:block`, or replace fixed coords with logical positioning (`absolute inset-x-4 bottom-4`).                                                                                                                                                                                                                                                                                          |
| `pe-[150px]` on a 438 px search input                                                                                          | The 150 px right padding for the button is built for the desktop width. At 320 px the input has no room for placeholder text.                                                                                                                                                                                                                               | `pe-[120px] sm:pe-[150px]` (or use a button that doesn't overlay the input on mobile).                                                                                                                                                                                                                                                                                                                          |
| `h-[48px] overflow-hidden` on a translated `<p>`                                                                               | Arabic wraps differently from English — the clamp height that fits 2 EN lines fits 1 AR line and clips the rest, or vice versa.                                                                                                                                                                                                                             | Drop the height; use `line-clamp-2` if a fixed line count is required.                                                                                                                                                                                                                                                                                                                                          |
| `flex gap-4 overflow-x-auto` as the "responsive" pattern                                                                       | This is a horizontal scroller hidden behind a normal-looking section. Users on mobile see ~1.2 cards and never know more exist.                                                                                                                                                                                                                             | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5` — every card visible at every breakpoint.                                                                                                                                                                                                                                                                                                       |
| `<HeroBgShape className="md:block">` (decoration shows on tablet)                                                              | Tablet is too narrow for the 696 px shape — it pokes out of the hero card and causes horizontal scroll at 768 px.                                                                                                                                                                                                                                           | `lg:block` (only above 1024 px) for any decoration sized for desktop.                                                                                                                                                                                                                                                                                                                                           |
| `<Image src=... sizes="378px">` while card is `w-full sm:w-[378px]`                                                            | The `sizes` lies on mobile (card is `100vw`, not 378 px), so the browser pulls the wrong variant and CLS spikes.                                                                                                                                                                                                                                            | `sizes="(max-width: 640px) 100vw, 378px"` — be honest about the responsive width.                                                                                                                                                                                                                                                                                                                               |
| `<DecorativePanel className="hidden xl:flex" />` on a 2-column auth / marketing screen                                         | A **structural** Figma column is treated as a decoration. Below 1280 px (every laptop ≤ 1366 px in Windows scaling, every iPad-class tablet, every phone) the entire left/right half of the design vanishes and the form sits centered in a sea of white. The Figma file's split layout was not optional.                                                   | Stack the columns at smaller breakpoints — `flex-col xl:flex-row` with the panel rendered (not `hidden`) above/below the form on narrow viewports. Hide _individual_ decorative layers (blur blobs, badge ornaments) below `xl:`, never the entire column. If the designer truly wants single-column on mobile, the Figma file must ship a mobile frame that shows what replaces the panel — never approximate. |
| Side-panel built as a single `<Image>` + gradient overlay, ignoring Figma's text / logo / illustration layers inside the panel | The Figma "decorative" column usually contains a brand logo, a slogan, an illustration, and an image fill — multiple stacked layers. Implementing only the bottom image (especially a low-contrast one like a white cityscape on a white page bg) renders the panel **invisible**: viewers see blank space and report "the left column wasn't implemented." | Walk every layer inside the panel node with `get_design_context`, just like a content section. Render each kept layer (logo, headline copy, illustration) as its own DOM element on top of the image fill. The image fill alone is _never_ the whole panel. See [figma-to-code.md](figma-to-code.md) §Per-section: walk the layer tree + §Pixel-perfect verification axis 1.                                    |

## Phase-gate responsive verification (pasteable script)

At the end of every section sub-phase, paste this assertion in the browser console at each width (320 / 768 / 1280):

```js
const w = window.innerWidth;
const dw = document.documentElement.scrollWidth;
console.assert(dw === w, `Horizontal scroll: doc ${dw} > viewport ${w}`);
const offenders = [];
document.querySelectorAll('*').forEach((el) => {
  const r = el.getBoundingClientRect();
  if (r.right > w + 0.5 && r.width <= w * 2)
    offenders.push({
      tag: el.tagName,
      cls: el.className?.toString?.().slice(0, 80),
      right: Math.round(r.right),
    });
});
console.log('overflow offenders:', offenders.slice(0, 5));
```

A clean run produces `[]`. Any offender means a fixed-width element is poking past the viewport — fix it before declaring the sub-phase done.
