# Figma → code workflow

Figma is the **single source of truth** for visuals: layout, spacing, colors, typography, icons, illustrations, and motion. This doc covers the workflow, the asset folder structure, and what Claude (or any AI assistant) can/can't read from a Figma link.

**The target is pixel-perfect.** Every spacing value, font size, radius, color, breakpoint, **and background** (fill, gradient, blur blob, decorative shape, hero image, pattern overlay) comes from Figma — no eyeballing, no rounding, no "looks close enough." If your code produces something that doesn't match the Figma node 1:1, the code is wrong.

## Rules

1. **Every screen starts from a Figma frame link.** No "we'll design later". If a frame is missing, ask the designer before writing JSX.
2. **Tokens come from Figma variables, never from the dev's head.** Pull via the Figma MCP (`get_variable_defs`) and reconcile with `src/styles/tokens.css`. If a value is missing, add it as a token first.
3. **Icons are SVGs exported from Figma.** Never hand-draw, never use a generic icon font, never invent an icon. The Figma frame is the contract.
4. **Illustrations and product imagery come from Figma**, exported to the right resolution. No stock images sneaking in unless the designer approves.
5. **Animations come from Figma prototype interactions** when simple, or **Lottie exports** when complex. Never invent motion that wasn't in the design.
6. **No section is "approximate."** If you can't read a layer because the MCP response was truncated or the frame is huge, call `get_design_context` on the child node directly. Never write JSX for a section you haven't read.
7. **Backgrounds are layers, not afterthoughts.** Every section's background — solid fills, gradients, decorative blur blobs, behind-content imagery, pattern overlays, glow shapes — must be enumerated in the per-section layer walk and reproduced from the Figma node's fill / image / vector data. Never type a `bg-*` class from memory or eyeball a gradient from a screenshot. If Figma has a background image, export it; if Figma has a gradient, copy the stops and angle exactly; if Figma has a decorative blur shape behind the content, render it (typically as an `absolute` element hidden below `xl:`).
8. **One section per sub-phase. Always.** Never build two sections — or "just finish the small one below" — in a single round. See [task-workflow.md](task-workflow.md) §Section sub-phasing. Building multiple sections in one pass is the single largest hallucination source on this project and is treated as a defect, not a shortcut.
9. **Every section is classified as static or backend-driven before any JSX is written.** Subscription plans, service categories, featured technicians, success stories, blog posts, FAQ entries, stat counters — anything the backend owns — are backend-driven and MUST fetch from `src/config/endpoints.ts` (mirrored from `website-bonyad/src/config/api.ts`) via a TanStack Query hook or an RSC fetch + typed prop. Hardcoding the array because "Figma shows three plans" is a defect, even as a placeholder. See [section-data-classification.md](section-data-classification.md).

## The contract — read the layer tree. The screenshot is BANNED as a code-derivation source.

**The canonical input is the Figma layer tree, not the screenshot.** A screenshot is a flat image — Claude infers structure from pixels, misses small layers, hallucinates the parts that fall off the visible area, and can't distinguish a real frame from a decorative shadow. The layer tree, returned by the Figma MCP, is the exhaustive list of named nodes — every frame, group, text, vector, image, background blob, decorative shape — with their exact properties.

**Hard rule:** for every section being built, Claude MUST enumerate and inspect every layer in that section's node tree via `get_design_context`. Writing JSX from "what the screenshot looks like" is the #1 cause of "this section never got created", "this card has the wrong padding", and "the gradient background just disappeared" — all real regressions seen on this project.

### What the screenshot may and may not be used for

| Use                                                                         | Allowed?                                            |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| Sanity-checking that the layer tree you walked matches a human's eye        | ✅ once per section                                 |
| Confirming a designer's intent on which element is decorative vs structural | ✅ once per section                                 |
| Counting sections in a frame                                                | ❌ — use `get_metadata`                             |
| Measuring padding, gap, or font size                                        | ❌ — use `get_design_context`                       |
| Picking a color, gradient stop, or shadow                                   | ❌ — use `get_variable_defs` + `get_design_context` |
| Deciding which layers exist or "look skippable"                             | ❌ — walk the tree, every layer must be paired      |
| Reproducing a background (fill, gradient, blob, image, glow, pattern)       | ❌ — pull the fill/image data from the layer node   |

If you wrote a line of JSX whose values trace back to a screenshot rather than a layer property or a token, that line is a defect. Delete it and re-derive from the layer.

### Per section, one round-trip — never batch

Phase 5 ([task-workflow.md](task-workflow.md) §Section sub-phasing) explicitly bans building more than one section in a sub-phase. The layer walk described below MUST happen fresh for each section: do not reuse a top-frame `get_design_context` response across sections, do not "continue with the next section while we're at it", do not infer the next section's structure from the current one. One `get_design_context` round-trip → one section → one gate report → stop.

## What Claude can read from a Figma link

| Asset                                                      | Tool / source                                         | Role                                                                                                            |
| ---------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Node hierarchy / layer tree of a frame**                 | Figma MCP `get_metadata`                              | **Primary.** Returns the full child node ID tree — the section list lives here.                                 |
| **Layout, spacing, color, typography per node**            | Figma MCP `get_design_context`                        | **Primary.** Call it on EVERY layer of EVERY section being built — not just the section root.                   |
| **Variables (tokens)**                                     | `get_variable_defs`                                   | **Primary.** Reconcile each layer's fill/stroke/text token with `tokens.css`.                                   |
| Static screenshot of a frame                               | `get_screenshot`                                      | Visual reference only. Open once per section to confirm intent. Never used to derive structure or measurements. |
| Component instance → code mapping                          | `get_code_connect_map` + `send_code_connect_mappings` | Used when a Figma component already maps to a shadcn primitive.                                                 |
| Prototype transition: type, duration, easing, target frame | Figma API / MCP                                       | Required for animation tier decisions.                                                                          |
| Smart Animate pairings between frames                      | Figma API / MCP                                       | Start + end states + metadata.                                                                                  |
| Frame-by-frame Lottie / video motion                       | —                                                     | ❌ Reads static start/end, not interpolation. Export Lottie.                                                    |
| Hand-drawn paths, particle effects, complex easing         | —                                                     | ❌ Same. Lottie or describe in plain English.                                                                   |

**The Figma MCP is the canonical bridge.** When you share a Figma link with Claude, the chat must have the Figma MCP server connected (the `mcp__f497b47f-…__use_figma` toolset). Without it, Claude only sees the URL — it can't read the design.

## Asset folder structure

```
web/
├── public/
│   ├── images/                  # Raster product imagery (jpg/png/webp/avif)
│   │   ├── hero/
│   │   ├── services/
│   │   └── technicians/
│   ├── animations/              # Lottie JSON files
│   │   ├── empty-state.json
│   │   └── …
│   ├── og/                      # Static OG images (1200×630)
│   ├── icons-static/            # Favicons, apple-touch, manifest icons
│   └── llms.txt, robots.txt, llms-full.txt
│
└── src/
    ├── components/icons/        # SVG icons as React components (SVGR)
    │   ├── chat.svg
    │   ├── bid.svg
    │   ├── verified-badge.svg
    │   ├── index.ts             # Barrel re-export
    │   └── …
    └── components/illustrations/  # Larger named SVG illustrations
        ├── empty-projects.svg
        └── …
```

Naming: `kebab-case.svg` for files, `PascalCase` for the exported React component (`ChatIcon`, `EmptyProjectsIllustration`). Folder grouping follows feature names (`icons/projects/...`) only when ≥3 icons share a feature.

## Icons — strict rules

1. **Every icon is the exact SVG export from the Figma node.** Same `viewBox`, same path data, same dimensions, same group structure. **Never redraw an icon by hand and never let Claude generate one from scratch** — even if the icon looks simple. If the Figma export looks wrong, ask the designer to fix the Figma file; do not "clean it up" in code.
2. **Filename = Figma node name in kebab-case.** A node called `Icon / Verified Badge` exports to `verified-badge.svg`. The mapping must be 1:1 so it's auditable later.
3. **Icons live under** `src/components/icons/` (small UI icons) or `src/components/illustrations/` (large named graphics).
4. **Icons are React components** generated by SVGR at import time:
   ```ts
   // next.config.ts
   const config: NextConfig = {
     webpack(config) {
       config.module.rules.push({ test: /\.svg$/, use: ['@svgr/webpack'] });
       return config;
     },
   };
   ```
   ```tsx
   import ChatIcon from '@/components/icons/chat.svg';
   <ChatIcon className="text-foreground size-5" aria-hidden />;
   ```
5. **The only edits allowed on an exported SVG are:** (a) replacing hardcoded `fill`/`stroke` color attributes with `currentColor` so the icon picks up theme tokens, (b) stripping `<title>`/`<desc>` placeholders, (c) reformatting whitespace. **Nothing else** — no path simplification, no viewBox changes, no removing groups, no "I think the designer meant…". The Figma node is the contract.
6. **`aria-hidden` on decorative icons, `aria-label` on standalone icon buttons.** Already a [components.md](components.md) rule.
7. **No `lucide-react` for icons that exist in Figma.** lucide is only allowed for system glyphs (chevron, x, check) and only when the design uses the default lucide form as-is.
8. **One icon per file**, even if two designs look identical. Future-proofing.
9. **Every new icon is added to the barrel** `src/components/icons/index.ts` in the same PR ([doc-maintenance.md](doc-maintenance.md)).
10. **`SaudiRiyalIcon` is the canonical SAR currency glyph** — sourced from the official Saudi Riyal SVG standard asset (not Figma). Use it in every context displaying a Saudi Riyal amount: subscription plan prices, service rates, bid amounts, and any other monetary value in SAR. Never substitute plain text ("SAR", "ر.س", "﷼") as the visible currency marker — use the icon + an `aria-hidden` attribute on it, paired with a `.sr-only` span containing the text "SAR" for screen readers. This rule overrides the Figma-source-only rule for this one specific icon; all other icons must still come from Figma.

### Verification

After exporting an icon, place the Figma frame screenshot side-by-side with the rendered icon in the browser. They must match pixel-for-pixel at the same size. If they don't, the export is wrong (or the wrong node was exported) — re-export, don't patch.

## Illustrations and raster imagery

- **Large named SVGs** (empty states, hero illustrations) → `src/components/illustrations/`, same SVGR pattern.
- **Raster product imagery** (photos, technician portfolio thumbnails) → served via `next/image` from `public/images/` or the backend CDN. Always with descriptive `alt`.
- **No raster icons.** If Figma exports a PNG icon, it's a bug — ask the designer for an SVG.

## Asset export integrity — every new asset is verified on disk AND in the browser

The Figma MCP `get_design_context` response embeds asset URLs (`figma.com/api/mcp/asset/...`) for every layer with an image fill or vector frame. Those URLs are **not always trustworthy** — observed failure modes on this project include:

- An SVG node returned with `opacity="0"` on its root group (renders invisibly even when the file loads).
- An SVG with `viewBox="0 0 32 32"` while the actual `<path>` coordinates extend to ~190 (only a clipped sliver renders).
- An asset served with `Content-Type: image/svg+xml` but saved to disk under a `.png` extension (`next/image`'s optimizer reads as PNG, fails silently, renders a 0×0 `<img>` element that passes every existing gate).

These bugs all share one property: the asset is technically _present_ — file exists, `<img>` element exists, DOM tree matches Figma — but renders nothing visible. The existing rules ("every kept layer has a matching DOM node ✅") tick green while the user sees an empty card.

**Hard rule:** every new asset under `public/images/`, `src/components/icons/`, or `src/components/illustrations/` must pass **both** checks below in the phase-3 (assets) gate:

1. **On-disk integrity** — run `file <path>` and confirm the printed format matches the extension. `step-c1.png: SVG Scalable Vector Graphics image` is a defect, not a warning; rename to `.svg` or re-export as the correct format. The phase-3 gate report must include the `file` output for every newly added asset.
2. **Visual integrity** — open the asset in isolation in the browser (`http://localhost:3000/<asset path>`) and confirm it actually renders something visible at the expected dimensions. A 0×0 `<img>`, an SVG with opacity:0, or an SVG with a wrong viewBox all pass step 1 but fail this step. If the MCP-served asset is broken, ask the designer to manually export the node from Figma at 2× the rendered size (PNG/WebP for illustrations, SVG for icons) — never patch a broken export in code; the next re-export will reintroduce the bug.

## Animations — three tiers

| Complexity                                                                            | Where it lives             | How to implement                                                                    |
| ------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------- |
| **Simple state transitions** (hover, focus, open/close, theme switch)                 | Inline                     | Tailwind `transition-*` + `motion-safe:` variants. Reads Figma transition metadata. |
| **Mid-complexity orchestrated motion** (staggered list, page transition, modal entry) | A feature component        | `framer-motion` (only when justified). Map Figma duration/easing 1:1.               |
| **Brand / custom motion** (loaders, illustrations, success animations)                | `public/animations/*.json` | Lottie via `lottie-react`, lazy-loaded with `next/dynamic`.                         |

Rules:

1. **Match Figma's `transitionDuration` and `transitionEasing` exactly.** Don't round; map from Figma → Tailwind/`framer-motion` config.
2. **Respect `prefers-reduced-motion`** ([accessibility.md](accessibility.md)). Lottie should fall back to a static SVG frame.
3. **No animation longer than 400ms for UI feedback.** Anything longer needs design rationale.
4. **Lottie JSONs are tree-shakeable per file.** Don't bundle all of them — `next/dynamic` per usage site.
5. **Tokens drive timing too.** Add `--motion-fast`, `--motion-base`, `--motion-slow` to `tokens.css` if the Figma file uses named timings.

## When you give Claude a Figma link — the layer-first workflow

Paste the link in the chat. Claude must then, **in this order**:

1. **Confirm the Figma MCP server is connected** (the `mcp__f497b47f-…__use_figma` toolset is listed in available tools). If not connected, stop and ask the user to enable it — do not proceed.
2. **Call `get_metadata` on the top frame** to retrieve the full node tree. The output is the canonical section list — every named child frame is a section. Save the node IDs.
3. **Call `get_variable_defs`** to reconcile design tokens with `tokens.css`. Flag any missing tokens; they must be added (with both `:root` and `.dark` values) in phase 3 before any section is built.
4. **Open `get_screenshot` on the top frame at most ONCE** as a sanity reference. It may NOT be used to count sections, derive measurements, infer structure, pick a color, read a gradient, or decide which layers exist — `get_metadata` and `get_design_context` are the only authoritative inputs. If you find yourself looking at the screenshot to decide what to write, close it and call the layer-tree API instead.
5. **Enumerate every section as a node ID** and write them down. Each section becomes its own solo phase-5 sub-phase per [task-workflow.md](task-workflow.md) §Section sub-phasing — bundling is the rare exception, not the default. Each section node will, in its sub-phase, be expanded into its own complete layer list via a fresh `get_design_context` call.
   5a. **Classify every section as static or backend-driven** ([section-data-classification.md](section-data-classification.md)). For each backend-driven section, name the endpoint (`API_ENDPOINTS.<NAMESPACE>.<KEY>`) and the RN call site (grep `website-bonyad/src/screens/`); if the endpoint is missing on the web side, add the mirror to `src/config/endpoints.ts` from `website-bonyad/src/config/api.ts` in Phase 1. Phases 1 + 2 (schema + fetcher + sibling test) must complete BEFORE that section's Phase 5 sub-phase begins — the section consumes a fetched array, never a hardcoded one.
6. **List every icon and asset that needs exporting**, with exact filenames matching the [icon naming rules](#asset-folder-structure). Filenames must mirror Figma node names in kebab-case so the mapping is auditable.
7. **For each prototype interaction in the frame**, list transition metadata and propose the implementation tier (CSS / Framer / Lottie).
8. **Ask the designer for Lottie exports** if any motion is complex.

Only after this is code written. See [task-workflow.md](task-workflow.md) for the phase structure.

### Per-section: walk the layer tree, not the picture

When a section's sub-phase starts (phase 5a, 5b, …), Claude must:

1. **Call `get_design_context` on that exact section node.** The response is the layer tree rooted at the section. Do not reuse a previous response from the top frame — call fresh on the section node.
2. **Walk every layer in the response and record:** node ID, node name, type (`FRAME`/`TEXT`/`VECTOR`/`INSTANCE`/`RECTANGLE`/`ELLIPSE`/etc.), dimensions (`width`/`height`/`x`/`y`), auto-layout (`layoutMode`, `padding`, `itemSpacing`, `primaryAxisAlignItems`, `counterAxisAlignItems`), fills (with token references — solid, linear gradient, radial gradient, image), strokes, corner radii, text content + text style, opacity, blend mode, effects (drop shadows, inner shadows, layer blurs, background blurs).
3. **Background layers count.** The section root's fill, any sibling decorative shapes positioned behind the content (blur blobs, glow ellipses, pattern rectangles, image fills), and any gradient overlays must each appear in the enumerated list. A section background is never "implied" — if Figma has it, it gets a row in your walk and a planned DOM element.
4. **Pair every Figma layer with a planned DOM element** before writing any JSX. For each layer choose one: **keep** (as `<div>`/`<span>`/`<img>`/`<svg>`), **inline** into a parent style (e.g., a layer that becomes a `bg-*` / `shadow-*` class on its parent), or **drop** as purely decorative. **Never silently skip a layer.** Every dropped layer must appear in the gate report as `dropped: <node id> <node name> — <reason>` so a reviewer can challenge the decision.
5. **If `get_design_context` returns truncated**, recurse: call `get_design_context` on each non-leaf child node individually. Truncation is the cause of "this section never got built" — always re-call rather than infer the missing tail.
6. **Only after every layer is enumerated and paired** do you write JSX for that section. If you catch yourself writing a class whose value you can't trace back to a specific Figma layer property or token, stop — you're hallucinating; go back to step 1.

## Pixel-perfect verification (per section, before declaring done)

After building each section, **read the rendered DOM**, don't trust the screenshot. Tools like `mcp__Claude_Preview__preview_inspect` (or browser DevTools) return computed styles — that's the ground truth.

**This is a hard gate.** A section is not done until all five sub-checks below pass. If any fail, fix before moving on — drift accumulates and a later section will inherit it.

### 0. Layer fidelity vs Figma

Reconcile the enumerated layer list (from the §"Per-section: walk the layer tree" step) against the rendered DOM **and the rendered pixels**:

- **Every Figma layer that was planned to render in code must have a matching DOM element.** Use `mcp__Claude_Preview__preview_snapshot` or the accessibility tree to confirm.
- **Every layer marked "dropped: …" in the plan must NOT appear in the DOM.** If a dropped layer leaked through, the implementation diverged silently.
- **No extra DOM elements that don't trace back to a Figma layer.** Stray wrapper `<div>`s often hide implementation shortcuts; if a wrapper exists, the gate report must explain why.
- **Visual side-by-side with the Figma frame is mandatory, not optional.** Call `mcp__Claude_Preview__preview_screenshot` on the section in the browser AND `mcp__f497b47f…__get_screenshot` on the same Figma node, then place both images side-by-side and confirm each enumerated layer has the visual mass Figma shows. `preview_snapshot` alone is **not sufficient** — it confirms the `<img>`, `<svg>`, or text node exists, but cannot detect a 0×0 broken image, an SVG with `opacity:0`, a clipped illustration, a token that resolves to `transparent` in the current theme, or any other failure mode where the layer is present in the DOM but invisible to the user. The gate report names the two screenshot URLs and a one-line verdict per planned layer ("`step-c1` illustration: peeks in from left edge of card ✅" / "❌ — empty white box; investigate before declaring done").

This axis runs first because it catches "section incompletely built" — including silent-invisible exports and theme-token gaps — before the pixel-level comparison even matters.

### 1. Computed styles vs Figma (light mode, `en`)

| Property                                         | How to compare                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container width / max-w                          | Figma frame width vs. computed `width` on the section's outer div                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Padding / gap                                    | Figma auto-layout spacing vs. computed `padding` / `gap`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Font size, line-height                           | Figma text style vs. computed `font-size`, `line-height`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Color (text / bg)                                | Figma fill variable vs. computed `color` / `background-color`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Radius                                           | Figma corner radius vs. computed `border-radius`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Icon size                                        | Figma icon frame vs. computed icon bounding box                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Section background**                           | Figma section-root fill + every decorative background layer vs. computed `background`, layered `::before`/absolute children, and `box-shadow` / `filter: blur(...)` on background blobs. Gradients must match stop colors, positions, and angle exactly.                                                                                                                                                                                                                                                                        |
| **Background image (if any)**                    | Figma image fill / image node vs. the actual exported asset under `public/images/bg/` referenced via `next/image` or a Tailwind background-image utility. No CSS gradient substituting for a real image.                                                                                                                                                                                                                                                                                                                        |
| **Background-image visibility against the page** | Open the exported asset on its own and place the rendered DOM next to the Figma frame at the same zoom. The image must be **visually distinguishable from the surrounding page background** at every supported theme. A light-on-light export (e.g., a white-cityscape render on `bg-login-bg` which is also near-white) renders technically but reads as "the column wasn't implemented." If contrast is missing, the fix is in Figma (different fill, tint, gradient overlay) — never compensate with an invented CSS filter. |
| **Side-panel content layers**                    | If the section is a split-screen panel (auth, marketing hero, onboarding), the panel column is **not** just an image fill. Enumerate every child layer inside the panel node — logo, slogan / brand copy, illustration, badge marks, gradient veil — and render each one. A panel that ships as a single `<Image>` + gradient when Figma has 4 layers inside it fails this axis.                                                                                                                                                |

If a value differs by more than rounding (e.g., 1px on a 60px container), it's a bug.

### 2. RTL mirror (`ar` locale)

Toggle the `bonyad-lang` cookie to `ar` and reload. `<html dir>` must be `rtl`; the section's content must mirror to the opposite physical side. If a region stays anchored on the same physical side across `en` and `ar`, you used `-end` where you needed `-start` (or a physical `left-*`/`right-*` slipped through). See [i18n-and-rtl.md](i18n-and-rtl.md) §Common mistake.

### 3. Dark mode

Open the theme toggle and switch to dark. Inspect every surface in the section — backgrounds, text, borders, icons, hover states. **Every color must come from a token that has a `.dark` value defined in [src/styles/tokens.css](../src/styles/tokens.css)**. If you see a washed-out card, a black-on-black icon, or text that disappears, the token is missing its `.dark` override — add it before moving on. **No new token may ship without both `:root` and `.dark` values** ([theming.md](theming.md) §Rules).

### 4. Responsive matrix

Resize the viewport to 320 / 768 / 1280 px (the floor, tablet, and desktop checkpoints). The section must render cleanly at each, with no horizontal scroll, no clipped content, and touch targets ≥ 44 px on the 320 floor. Hardcoded pixel widths like `w-[1200px]` are forbidden on layout containers — see [responsive-design.md](responsive-design.md) §Hard rules. If the Figma frame only shows one breakpoint, ask the designer for the others before approximating.

**Structural columns may never disappear via `hidden` at a lower breakpoint.** A two-column Figma frame is a structural choice, not a decoration. Below the desktop checkpoint the columns **stack** (`flex-col xl:flex-row`) — they do not vanish. `hidden xl:flex` / `hidden xl:block` is reserved for _individual_ decorative layers (a blur blob, an ornament badge), never for an entire column of the design. Catching this is part of axis 0 (layer fidelity) as well: a column tagged `hidden` below `xl:` shows up in the DOM only above 1280px, so a 1024 / 1366 laptop viewer sees a layer the plan said would render. See [responsive-design.md](responsive-design.md) §Anti-pattern catalogue (`<DecorativePanel className="hidden xl:flex" />`).

**Pixel-perfect Figma offsets must be gated behind the breakpoint that matches the Figma frame width — `xl:` (1280px) for most Bonyad frames, not `lg:` (1024px).** Any `absolute`, fixed `h-[N]` / `w-[N]`, or `start-[N]` / `end-[N]` value lifted straight from a 1280px Figma frame will overflow and overlap on every viewport below 1280px — including `lg` (1024–1279). Gate those utilities behind `xl:` (`xl:absolute`, `xl:h-[N]`, `xl:w-[N]`, `xl:start-[N]`) and pair them with a stacked flex/grid layout for smaller viewports. Only drop to `lg:` when the Figma frame is genuinely authored at 1024px width. When the desktop layout uses `xl:absolute`, put the single-item content block **first in the JSX** so the natural-flow fallback below `xl` leads with it — see [responsive-design.md](responsive-design.md) §Stacking order for asymmetric columns.

Run all five checks **per section** before moving to the next one. Do not batch them at end-of-screen — by then the drift is too expensive to fix.

## What NOT to do

- Don't use `lucide-react` for a custom-designed icon that exists in Figma.
- Don't approximate colors from a screenshot — pull from variables.
- Don't write a custom `keyframes` block when the same motion exists in Tailwind or Figma's transition spec.
- Don't ship a screen without confirming the animation in the browser. Static screenshots lie about motion.
