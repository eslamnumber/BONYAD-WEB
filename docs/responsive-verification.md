# Responsive verification matrix — FAANG-tier coverage

The per-section gate in [responsive-design.md](responsive-design.md) used to check 3 widths (320 / 768 / 1280). That misses **every** between-breakpoint bug: Windows laptops at 1366, iPad in landscape at 1180, the 900 px crack between `md` and `lg`, the 1100 px crack between `lg` and `xl`.

This doc defines the full matrix Bonyad sections are verified against — the same density top-tier products (Meta, Linear, Stripe, Vercel) verify at. The matrix applies **per section sub-phase** (and per sub-sub-phase for HIGH-risk sections — see [section-risk-scoring.md](section-risk-scoring.md)), not just per PR.

## The 12-width matrix

| Width    | Class                 | Why this width specifically                                                                                                                                                            |
| -------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **320**  | mobile floor          | iPhone SE 1, smallest Android still in active use. The 44 px touch-target floor must hold here.                                                                                        |
| **375**  | common phone          | iPhone 12 mini / SE 3 / most Android phones in portrait.                                                                                                                               |
| **414**  | large phone           | iPhone Plus / Pro Max in portrait, Pixel Pro.                                                                                                                                          |
| **600**  | between-bp            | Android tablet portrait + foldables unfolded — falls between Tailwind `sm` and `md`.                                                                                                   |
| **768**  | `md` boundary         | iPad portrait. Tablet 2-col layouts engage here.                                                                                                                                       |
| **900**  | between-bp            | Narrow laptops, iPad landscape on smaller models — falls between Tailwind `md` and `lg`.                                                                                               |
| **1024** | `lg` boundary         | iPad Pro landscape, small laptops.                                                                                                                                                     |
| **1100** | between-bp            | Common Chromebook + older laptops — falls between `lg` and `xl`.                                                                                                                       |
| **1280** | `xl` boundary         | Modern laptops, what most Figma frames are authored at.                                                                                                                                |
| **1366** | between-bp (critical) | **Windows laptop standard at 100% scaling** — the single most-common laptop width in the wild. Lands in the `lg` zone but the Figma design is built for `xl`; mismatch causes overlap. |
| **1440** | desktop               | MacBook 14 / standard external monitor.                                                                                                                                                |
| **1920** | wide desktop          | Full HD. `max-w-*` must stop content growth at or before here.                                                                                                                         |
| (2560)   | optional ultrawide    | QHD / ultrawide — content should not stretch; `max-w-7xl` (or designated cap) holds.                                                                                                   |

**Mandatory per-section verification: 12 widths** (320, 375, 414, 600, 768, 900, 1024, 1100, 1280, 1366, 1440, 1920). 2560 optional but recommended for sections with a max-width cap.

## What to check at each width

The per-section gate covers six properties — every width must pass all six before moving on:

| #   | Check                          | Pass criterion                                                                                         |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 1   | **No horizontal scroll**       | `document.documentElement.scrollWidth === window.innerWidth`                                           |
| 2   | **No clipped content**         | Visible text isn't cut off; cards show their full body at the current width                            |
| 3   | **Touch targets ≥ 44 px**      | At widths ≤ 768 px, every button / link / icon-button has a hit area ≥ 44×44                           |
| 4   | **No overlap**                 | Decorative absolute-positioned shapes don't sit on top of content text/icons                           |
| 5   | **Structural columns visible** | A two-column Figma layout stacks below the design's breakpoint — it never disappears via `hidden`      |
| 6   | **Image / media within frame** | Hero illustrations, card images, panel imagery all visible (not clipped, not 0×0) at the current width |

## The script (paste in DevTools at each width)

```js
const w = window.innerWidth;
const dw = document.documentElement.scrollWidth;
console.assert(dw === w, `Horizontal scroll: doc ${dw} > viewport ${w}`);

const offenders = [];
document.querySelectorAll('*').forEach((el) => {
  const r = el.getBoundingClientRect();
  if (r.right > w + 0.5 && r.width <= w * 2) {
    offenders.push({
      tag: el.tagName,
      cls: el.className?.toString?.().slice(0, 80),
      right: Math.round(r.right),
    });
  }
});
console.log('overflow offenders:', offenders.slice(0, 5));

// Touch-target audit (run at widths <= 768)
if (w <= 768) {
  const small = [];
  document.querySelectorAll('button, a, [role="button"]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 44 || r.height < 44) {
      small.push({ tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height) });
    }
  });
  console.log('touch targets < 44px:', small.slice(0, 5));
}
```

Clean output: `overflow offenders: []` and `touch targets < 44px: []`. Any entry = fix before declaring the (sub-)sub-phase done.

## Fluid scaling — when and how

Discrete Tailwind responsive scales (`text-3xl sm:text-4xl lg:text-5xl`) are fine for Figma fidelity AT the named breakpoints, but they jump abruptly between them. Use `clamp()` when:

- A heading visibly jumps at a breakpoint (font goes from 30 → 48 px and looks jarring at 900 px).
- A container goes from `w-full` to a fixed `xl:w-[1200px]` and the in-between widths look weird.
- The Figma file shows fluid intent (the same heading at multiple widths with proportional sizing, not stepped).

```tsx
// Discrete scale (Figma-faithful, may jump between breakpoints)
<h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[56px]">…</h1>

// Fluid (smooth across all widths, use when discrete jumps look bad)
<h1 className="text-[clamp(1.875rem,4.5vw,3.5rem)]">…</h1>
```

**Body copy stays `text-base` — never fluid.** 16 px is the readability floor; scaling hurts comprehension more than it helps aesthetics.

Containers: fluid padding, capped width — `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12`. Media: `aspect-[N/M]` instead of fixed heights.

## Container queries (component-level responsive)

When a component appears in multiple layout contexts (mobile feed + desktop sidebar + main grid), it must respond to **its container's** width, not the viewport's:

```tsx
<aside className="@container">
  <article className="@md:text-base @lg:text-lg text-sm">…</article>
</aside>
```

Don't overuse — viewport-based responsive is simpler and sufficient for most sections.

## Gate report format

The section's gate report names every width verified and the result:

```
Responsive verification (12 widths)
- 320: ✅  375: ✅  414: ✅  600: ✅  768: ✅  900: ✅
- 1024: ✅ 1100: ✅ 1280: ✅ 1366: ✅ 1440: ✅ 1920: ✅
- horizontal scroll: none at any width
- touch targets < 44 px at widths ≤ 768: 0
- structural columns visible at every width: ✅
- fluid scaling decisions: h1 uses discrete scale (Figma-faithful at sm/lg/xl, smooth between)
- container queries used: none (viewport-based suffices)
```

A gate report with fewer than 12 widths is incomplete — go back and verify the missing ones.

## Anti-patterns

- **Verifying only 320 / 768 / 1280.** The original rule, kept for backwards-compat reading — superseded by this matrix.
- **`hidden xl:flex` on a structural column.** See [responsive-design.md](responsive-design.md) §Anti-pattern catalogue. Columns stack, they don't vanish.
- **Fixed pixel widths on layout containers** (`w-[1200px]`, `h-[622px]`) at the base level. See [responsive-design.md](responsive-design.md) §Hard rules.
- **Fluid `clamp()` on body copy.** Hurts readability — keep body at `text-base`.
- **`overflow-x-auto` carousel of fixed-width cards.** Hides content on mobile.

## Linked rules

- [responsive-design.md](responsive-design.md) — core rules + hard bans + anti-pattern catalogue (this doc is the verification matrix).
- [figma-to-code.md](figma-to-code.md) §Pixel-perfect verification axis 4 — responsive is axis 4 of the 5-axis gate.
- [section-risk-scoring.md](section-risk-scoring.md) — HIGH-risk sub-sub-phases run this matrix per component variant.
