# Responsive design

Bonyad supports every screen from 320 px (small phone) to 4K monitors. **Mobile-first** — default classes target the smallest screen; `sm:` / `md:` / `lg:` / `xl:` / `2xl:` scale up.

## Breakpoint scale (Tailwind v4 defaults — do not override)

| Variant | Min width | Typical device |
|---|---|---|
| (base) | 0 | small phones (≥ 320 px) |
| `sm:` | 640 px | large phones / phablets |
| `md:` | 768 px | tablets |
| `lg:` | 1024 px | small laptops |
| `xl:` | 1280 px | desktops |
| `2xl:` | 1536 px | large monitors |

## Hard rules

1. **Mobile-first.** Default styles are for ≤ 640 px. Add `sm:`/`md:`/`lg:` only when scaling up. Never write `max-md:` unless absolutely necessary.
2. **Touch targets ≥ 44 × 44 CSS px on mobile** (WCAG 2.5.5). Buttons, icon-only controls, links.
3. **No horizontal scroll, ever.** Test at 320 px width in DevTools.
4. **Content has a max-width** so reading lines don't stretch on 4K monitors. `max-w-3xl` for prose, `max-w-7xl` for app shells.
5. **Use `min-h-dvh`, not `min-h-screen`** — `dvh` accounts for mobile browser chrome (URL bar / keyboard).
6. **`text-sm`, not `text-[14px]`** — keeps users' browser zoom usable.
7. **Hover is desktop-only.** Anything that depends on `:hover` MUST also work via `:focus-visible` and `:active`.
8. **Bottom-fixed UI uses `pb-[env(safe-area-inset-bottom)]`** so it doesn't clip on notched iPhones.

## Layout patterns (Facebook / X / LinkedIn style)

### Public marketing (already implemented)

| Screen | Pattern |
|---|---|
| Mobile | header collapses to logo + toggles → hamburger drawer for nav → stacked main → multi-column footer collapses to single column |
| Desktop | full header with horizontal nav → centered main (`max-w-7xl`) → 4-column footer |

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
  <article className="text-sm @md:text-base @lg:text-lg">…</article>
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

## Per-PR test matrix

Open Chrome DevTools → Device Toolbar. Check the page renders cleanly at each width:

| Width | Device | Check |
|---|---|---|
| 320 × 568 | iPhone SE 1 | nothing clipped, no horizontal scroll |
| 412 × 915 | Pixel 7 | touch targets 44 px+ |
| 768 × 1024 | iPad | 2-column layout activates |
| 1280 × 800 | small laptop | desktop pattern engages |
| 1920 × 1080 | full HD | max-w stops growth |
| 2560 × 1440 | QHD | content doesn't stretch |

Do each width in **EN + AR** and **light + dark** (4 variants per width). The RTL flip must mirror cleanly at every breakpoint.

## Common pitfalls

- ❌ `h-screen` for hero — use `min-h-dvh` so mobile chrome doesn't clip.
- ❌ Hardcoded `h-[800px]` — breaks on phones; use `aspect-*` or `min-h-*`.
- ❌ Multi-line buttons without `leading-tight` — wrap weirdly at narrow widths.
- ❌ Sticky elements without `top-[env(safe-area-inset-top)]` padding on iPhones with notch.
- ❌ `overflow-x-hidden` on `<body>` to mask horizontal scroll — fix the root cause instead.
- ❌ Modal that's `90vw` on every screen — make it `max-w-md` on small, `max-w-lg` on `md:`, etc.
- ❌ `hover:` states with no `focus-visible:` fallback — keyboard / mobile users get no feedback.
