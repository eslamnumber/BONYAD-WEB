# i18n and RTL

## Direction mapping — inverted (product decision)

This project uses an **inverted** locale → direction mapping. The single source of truth is `LOCALE_DIRECTION` in `src/types/locale.ts`:

| Locale | `<html dir>` |
| ------ | ------------ |
| `en`   | `rtl`        |
| `ar`   | `ltr`        |

This is intentional. The Figma designs are RTL-first (Arabic primary market) and the layouts are authored visually with content anchored to the **right edge**. By keeping `<html dir="ltr">` in Arabic mode, the logical CSS utilities `-end` / `end-*` / `pe-*` / `me-*` resolve to the **right side** — which matches what Figma shows. When the locale toggles to English, `<html dir="rtl">` flips every logical utility so the same code mirrors automatically.

**Rule:** never read the locale name directly to make a layout decision. Always go through `LOCALE_DIRECTION[locale]` (or rely on logical CSS / Tailwind utilities). The locale → direction map is the single point that can change; everything downstream must read from it.

### `rtl:` / `ltr:` are overridden to be `dir`-only — do not revert

Tailwind's stock `rtl:` / `ltr:` variants match on **both** `[dir]` **and** language (`:lang(ar)`, `:lang(he)`, …). That is fatal here: `ar` renders as `lang="ar-SA"` (an RTL language) but `dir="ltr"`, so the stock `rtl:` would fire in `ar` via `:lang(ar)` **and** in `en` via `[dir=rtl]` — i.e. every direction flip fires in **both** locales and becomes a visual no-op (the two locales look identical). [src/styles/tokens.css](../src/styles/tokens.css) overrides both variants to key on `[dir]` only:

```css
@custom-variant rtl (&:where([dir=rtl], [dir=rtl] *));
@custom-variant ltr (&:where([dir=ltr], [dir=ltr] *));
```

With this in place `rtl:` fires **only in `en`** (`<html dir="rtl">`) and `ltr:` **only in `ar`** (`<html dir="ltr">`) — which is what every `rtl:` / `ltr:` rule in this doc assumes. If you ever see a flip (chevron, mirrored image) applying in _both_ locales, this override was removed or shadowed. Verify in the compiled CSS that `.rtl\:…:where([dir="rtl"], …)` has **no** `:lang(` in the selector.

## Setup — initialized once

- i18next is initialized **exactly once** in `src/lib/i18n.ts`, mirroring the RN app's pattern.
- The init reads the language preference from a cookie (`bonyad-lang`) so SSR can render the right `<html lang dir>` on first paint.
- `<I18nextProvider>` wraps the app in `app/layout.tsx`.

## Translation rules

1. **No user-facing string lives in JSX or in code.** Every string goes in `locales/en.json` + `locales/ar.json` and is read via `t('namespace.key')`.
2. **Translation keys are namespaced by feature.** `auth.login.title`, `projects.list.emptyState`. Match the feature folder name.
3. **No string concatenation for translations.** Use ICU-style placeholders:
   ```json
   { "greeting": "Hello, {{name}}" }
   ```
   ```tsx
   t('greeting', { name });
   ```
4. **Both `en.json` and `ar.json` must have the same keys.** A CI lint step (or `i18next-parser`) verifies this. Missing keys in either file fail the build.
5. **Date, number, currency formatting** goes through `Intl` APIs wired to the current locale, never manual string building. Helpers live in `src/utils/format.ts`.
6. **The language is changed via `useLocaleStore().setLocale('ar')`** which:
   - calls `i18n.changeLanguage`
   - sets the cookie
   - updates `<html lang dir>`

## RTL rules

`dir="rtl"` is applied on `<html>` only. Components must adapt via logical properties.

1. **Logical Tailwind utilities only.** Use:
   - `ms-*`, `me-*` (margin-start/end) — not `ml-*`, `mr-*`
   - `ps-*`, `pe-*` — not `pl-*`, `pr-*`
   - `start-*`, `end-*` — not `left-*`, `right-*`
   - `text-start`, `text-end` — not `text-left`, `text-right`
   - `rounded-s-*`, `rounded-e-*` for direction-aware corners
2. **Direction-aware icons** (arrows, chevrons, back buttons) live in a `<DirectionalIcon />` wrapper that flips when `dir="rtl"` via `scaleX(-1)`. Non-directional icons (search, settings, user) do not flip.
3. **No conditional `language === 'ar' ? … : …` in components.** The `dir` attribute + logical properties handle everything. If you find yourself writing that conditional, the bug is in the styling.
4. **Inputs `dir="auto"` for user content** (names, addresses, descriptions). The browser detects the script and aligns text correctly even in a mixed-language UI.
5. **`type="tel" | "email" | "number" | "url" | "search"` inputs lie about their direction — the browser UA stylesheet hard-codes `direction: ltr` on them, even when `<html dir="rtl">`.** Inheritance is silently broken: `getComputedStyle(input).direction` returns `"ltr"` regardless of the ancestor chain. That means `text-end` inside the input resolves to the **opposite physical side** from the parent's `end-3` icon — text on the right, icon on the left (or vice versa). The fix lives in the `Input` primitive ([src/components/ui/input.tsx](../src/components/ui/input.tsx)): a baked-in `[direction:inherit]` Tailwind class forces the input to inherit `<html dir>`, so `text-end` and `end-*` on the wrapper resolve to the same side. **Do not pass `dir="auto"` to the primitive by default** — for digit-only content (phone, OTP, credit card, IBAN, postal code), `dir="auto"` falls back to the parent and then the UA `direction: ltr` overrides it anyway. Pass `dir="auto"` _explicitly_ only for mixed-language free-text fields (names, addresses, descriptions). For numeric fields, add `text-end` on the input so typed content anchors to the same side as the parent's leading icon. Verification: in `en` (html dir=rtl), confirm `getComputedStyle(input).direction === 'rtl'` — if you see `'ltr'` here, the primitive's `[direction:inherit]` is missing or the input is being styled by a UA rule. See [forms-validation.md](forms-validation.md) §Numeric inputs.
6. **Never hand-roll a raw `<input>` or `<textarea>` in a feature component — use the shared `Input` primitive at [src/components/ui/input.tsx](../src/components/ui/input.tsx) (and the matching textarea primitive when one exists).** The primitive bakes in `[direction:inherit]` and the focus-ring tokens. Re-implementing in `features/<f>/components/` is how the rule 5 bug returns — the contact form's `ContactField` did exactly this and shipped with `<input>` (and `<textarea>`) elements missing `[direction:inherit]`, so the tel input rendered `direction: ltr` while every other field rendered `rtl`, putting placeholder + icon on the same side of email / title / description but opposite sides on phone. If the primitive is missing a prop you need (icon slot, `aria-invalid` styling, etc.), extend the primitive — do not fork. If you must use a raw `<input>` / `<textarea>` (e.g. multi-cell OTP boxes where the primitive shape doesn't fit), add `[direction:inherit]` explicitly and link to rule 5 in a comment.
7. **Inputs with a leading icon — which side goes where depends on the design intent, but the two utilities must be on opposite ends.** Two valid layouts:
   - **Icon at the start, text at the end** (this codebase's convention — matches Figma RTL-first cards where the leading visual is the icon and text trails away from it): `start-*` on the icon span + `text-end` on the input + `ps-11 pe-4` padding (reserve start side for the icon). In `en` (html dir=rtl): icon on **right**, text on **left** — reads as a conventional English form. In `ar` (html dir=ltr): icon on **left**, text on **right** — reads as a conventional Arabic form. The single code-path mirrors automatically.
   - **Icon at the end, text at the start** (rarer — used when the icon is a trailing affordance like a clear-button or chevron): `end-*` on the icon + `text-start` on the input + `pe-11 ps-4` padding.
     The **wrong** pairing puts the icon and the text on the same physical side (visual symptom: text overlaps / crowds the icon). Always pick one side for the icon, then put the text utility on the opposite axis-end, and reserve the icon's side via padding.
8. **`<bdi>` for embedded user-content strings** (usernames, file names) to prevent layout bleed.

### Heading + paragraph bidi — `dir="auto"` on leaf text nodes

In `en` locale (`<html dir="rtl">`), a translated heading like `"Facing an issue?"` renders with the `?` visually on the **left** — the LTR letters form an isolated run, but trailing weak/neutral characters (`?`, `.`, `!`, `:`) are resolved against the **paragraph** direction (RTL → left edge) per UAX #9. Same for a subtitle like `"We're here to help you find the solution."` — the trailing period floats to the visual start of the RTL paragraph.

**Fix:** add `dir="auto"` to the **leaf text element** (`<h1>`, `<h2>`, `<p>`) that holds translated content. With `dir="auto"`, the browser picks direction from the first strong character: `"F"` → LTR → `?` stays attached on the right. Arabic `"هل تواجه مشكلة؟"` → first strong char is Arabic → RTL → `؟` stays attached at the left. Same code, both locales correct.

**Hard line:** `dir="auto"` belongs on **leaf text nodes only** — never on layout containers (`<form>`, `<section>`, `<div>`). On a container that holds form inputs with English placeholders, `dir="auto"` sniffs the placeholder content and silently flips the entire container to `dir="ltr"`, breaking every `text-end` / `end-*` / `ps-*` / `pe-*` utility inside it. The contact form had this bug — `<form dir="auto">` made the form render LTR in `en` regardless of `<html dir="rtl">`, putting icons on the wrong physical side. Remove and let the form inherit `<html dir>`.

**`dir="auto"` text must be aligned with `text-start`, NOT `text-end`.** `text-align: start | end` resolves against the **element's own** `direction` at used-value time — and `dir="auto"` overrides that direction to match the text's _content language_. In this inverted-mapping project the content language's direction is the **opposite** of the document direction (English content → `ltr` element under `<html dir="rtl">`; Arabic content → `rtl` element under `<html dir="ltr">`). So on a `dir="auto"` element, `text-end` resolves to the **opposite physical side** from the `items-end` / `end-*` utilities around it (which resolve against the document `dir`). The result: icon anchored left, text aligned right (en) — they fight. **Pairing:** a content-anchored block uses `items-end` on the container (document-relative) + `text-start` on each `dir="auto"` leaf (content-relative); the two opposite logical edges land on the same physical side precisely because the mapping is inverted. Use `text-end` only on text that does **not** carry `dir="auto"` (it then inherits the document dir, as in the `home-how-it-works` step cards). **Real regression:** the About pillar cards (`about-pillar-card-shell.tsx`) and Timeline shipped `dir="auto"` leaves under an inherited `text-end`, so every card's title/body aligned to the wrong side in `en` — most visible on cards with short titles. Fixed by switching those containers to `text-start`.

**Verification — apply per section, not "I'll catch them later".** When you build a section that renders translated copy, before the per-section gate run this check: for every `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<p>`, `<li>`, `<dt>`, `<dd>` (or any leaf that holds a `t(...)` call), grep the `en.json` value at that key for a leading or trailing `?`, `.`, `!`, `:`, `،`, `؟`. If any match, `dir="auto"` is REQUIRED on that element. **Real regression:** `home-how-it-works.tsx` shipped with `<h2>{t('home.howItWorks.headline')}</h2>` and `<p>{t('home.howItWorks.subheadline')}</p>` — both translated copy ends in `?` / `.`, both rendered with the punctuation floating to the visual start in `en` (the headline showed `?work` on its second line, the subheadline showed `.executing easily`). The Phase-5 verification gate must screenshot the section in `en` and flag any line where terminal punctuation appears on the leading edge.

## Common mistake — `text-start` vs `text-end` (read this before writing JSX)

Because the mapping is **inverted** (`ar → ltr`, `en → rtl`), the visual side each utility resolves to is _not_ the side you'd guess from the locale name. Memorize this table:

| Utility                    | `ar` locale (`<html dir="ltr">`)                     | `en` locale (`<html dir="rtl">`) |
| -------------------------- | ---------------------------------------------------- | -------------------------------- |
| `text-start`               | left-aligned                                         | right-aligned                    |
| `text-end`                 | **right-aligned**                                    | **left-aligned**                 |
| `items-start`              | cross-axis left                                      | cross-axis right                 |
| `items-end`                | cross-axis right                                     | cross-axis left                  |
| `justify-start` (flex-row) | main-axis left                                       | main-axis right                  |
| `justify-end` (flex-row)   | **main-axis right**                                  | **main-axis left**               |
| `justify-end` (flex-col)   | vertical bottom — direction-independent, fine to use |

### Rule of thumb

**Default to `end` for card / content alignment.** With the inverted mapping, `-end` resolves to **right in Arabic, left in English** — which is what every Figma RTL-first card design expects. Reach for `-start` only when you genuinely want the opposite (e.g., a sidebar label that pins to the leading edge of the page chrome, not the content).

The same logic applies to flex: `items-end` / `justify-end` for content anchoring; `items-start` / `justify-start` for the inverse case.

### Real example from this codebase

```tsx
// ❌ Anchors to the wrong visual side — icon and text end up on the left in Arabic
<div className="flex flex-col items-start gap-4 text-start">
  <Icon /> <h3>{title}</h3>
</div>

// ✓ Anchors to the visual right in Arabic / left in English — mirrors automatically
<div className="flex flex-col items-end gap-4 text-end">
  <Icon /> <h3>{title}</h3>
</div>
```

### Verification

After building any section, **toggle the `bonyad-lang` cookie between `en` and `ar` and reload each time**. The layout must mirror: card content right-anchored in `ar`, left-anchored in `en`. If a section stays anchored to the same physical side across both locales, you used `-start` where you needed `-end` (or a physical `left-*`/`right-*` slipped through). ESLint catches the physical utilities; choosing `-end` over `-start` is on you.

## Directional icons — flipping chevrons / arrows

Arrows must flip with the reading direction. Which **physical** direction the arrow points depends on the CTA's design intent — and there are two distinct patterns. Both use a single `ChevronRight` from `lucide-react` and a single flip class; the only difference is which variant (`ltr:` or `rtl:`) the class is gated on. Never conditionally pick `ChevronLeft` vs `ChevronRight` based on the locale.

**Pattern A — "forward" chevron (points in the reading direction, toward where the link goes).** This is the default for navigation chevrons, breadcrumb separators, and most "next page" affordances. Use `ltr:-scale-x-100`:

- `en` (`<html dir="rtl">`) → class doesn't fire → chevron stays `>` → points **right** (LTR forward).
- `ar` (`<html dir="ltr">`) → class fires → chevron flips to `<` → points **left** (RTL forward).

**Pattern B — "inward" chevron (points back toward the link text, away from the reading direction).** This is the design intent for "Learn more" / "View more" style CTAs in the Bonyad Figma where the chevron decorates the **start** edge of the pill — visually a "tail" trailing off the label, not a "next" indicator. Use `rtl:-scale-x-100`:

- `en` (`<html dir="rtl">`) → class fires → chevron flips to `<` → points **left**, back toward the label on the text's right side.
- `ar` (`<html dir="ltr">`) → class doesn't fire → chevron stays `>` → points **right**, back toward the label on the text's left side.

**How to pick:** look at the Figma frame for the CTA in both `en` and `ar` mode. If the arrowhead points away from the text (outward), it's Pattern A. If the arrowhead points toward the text (inward), it's Pattern B. Do not default — verify per CTA. **Real regression:** the home "Learn how it works" pill on the How-It-Works section shipped with Pattern A (`ltr:-scale-x-100`) and rendered a right-pointing chevron in `en`; the Figma frame shows an inward-pointing chevron, so Pattern B (`rtl:-scale-x-100`) is correct. See [src/features/home/components/home-how-it-works.tsx](../src/features/home/components/home-how-it-works.tsx).

```tsx
// ❌ Conditional icon picking — locale-name check, breaks the single-source rule
const Chevron = LOCALE_DIRECTION[locale] === 'rtl' ? ChevronLeft : ChevronRight;
<Chevron className="size-5" aria-hidden />

// ✓ Pattern A — forward chevron (default for "next" / breadcrumb / pagination)
<ChevronRight className="size-5 ltr:-scale-x-100" aria-hidden />

// ✓ Pattern B — inward chevron (Learn more / View more pill where the arrow trails the label)
<ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden />
```

Non-directional icons (search, settings, user avatar, check marks) **do not flip**. Only icons whose meaning is tied to reading direction — back/forward arrows, chevrons, breadcrumb separators — need a flip class.

## Visuals — mirror by default in EN

Every visual mirrors with the reading direction by **default**, the same mechanism directional icons use. This covers **both raster images** (`<Image>` / `<img>`) **and decorative SVG illustrations** exported from Figma (`<Pillar…Illustration>`, blob / swoosh / grid artwork, background shapes) — they are all "images" for this rule. The Figma designs are RTL-first (Arabic baseline), so a visual's composition — which way a subject faces, where a gesture / arrow / swoosh flows, which corner the weight sits in — is authored for `ar`. When the locale flips to `en` (`<html dir="rtl">`), an un-mirrored visual fights the now-mirrored layout around it and points the "wrong" way.

**Rule:** every `<Image>` / `<img>` / decorative illustration gets `rtl:-scale-x-100`. Because the mapping is inverted, the `rtl:` variant fires in `en` only — the visual mirrors in English and stays as-authored in Arabic. This is the default; reaching for "no flip" is the deliberate exception, not the other way round.

```tsx
// ✓ Default — mirrors in en, untouched in ar
<Image src="/images/bg/about-pillar-vision.jpg" alt="" fill className="object-cover rtl:-scale-x-100" />
<PillarValueIllustration className="absolute start-[-55px] -top-4 h-[690px] w-[514px] rtl:-scale-x-100" />
```

**Where the flip class goes** — normally on the **visual element itself** (`<Image>` / `<img>` / the illustration component). Two exceptions:

1. **Never on a shared layout wrapper** that also holds text or sibling layers — a wrapper `scale` drags the whole subtree and double-applies with any hover `scale-*`.
2. **When the element already carries its own transform** (`rotate-*`, `-scale-y-*` — common on Figma artwork that was rotated / flipped in the design), do NOT add `rtl:-scale-x-100` to the same element: Tailwind merges both into one `scale: x y` declaration, so `-scale-y-100` + `-scale-x-100` becomes a 180° point-flip, not a horizontal mirror. Instead put the per-locale `en` transform on the illustration's **own positioning container** (the wrapper that holds only that one illustration, no text). The about Mission card does exactly this — `-scale-y-100 rotate-[156.31deg]` stays on the inner node, while the `en` transform (`rtl:rotate-180`, see below) goes on the positioning container.

**Opt out** (omit the class) only when mirroring would corrupt meaning — leave the class off, no marker needed:

- **Logos / wordmarks** — mirrored text is unreadable.
- **Photos or graphics with legible text** — signage, UI screenshots, documents.
- **Faces / portraits** where a mirror reads as uncanny or alters identity cues — design judgment.
- **Maps, charts, diagrams** with an inherent orientation.

When it's ambiguous, open the Figma frame in both locales: if the design shows the visual mirrored between `en` and `ar`, flip it; if identical, opt out.

**Verification — per-section gate.** Toggle `bonyad-lang` between `en` and `ar` and reload. Content / decorative visuals must visibly mirror (subject or swoosh faces the opposite way); logos and text-bearing images must read identically in both. A visual that stays oriented the same way while the layout mirrors around it is the symptom of a missing `rtl:-scale-x-100`. **Note:** near-symmetric or heavily blurred artwork (e.g. a hazy skyline behind a frost) may flip correctly yet look unchanged — confirm against an asymmetric detail, not overall impression.

### Shape and position are independent choices

`rtl:-scale-x-100` mirrors a visual's **shape** in `en`. **Where** the visual sits on the card — its physical side — is a separate decision, controlled by the positioning utilities, and it does **not** have to mirror just because the shape does.

For the **pillar / "vision" card decorations**, the design keeps the artwork on the **right edge of the card in both locales**. Because the artwork box is wider than the card and its contents are centered, pinning to the physical right means `ltr:start-[…] rtl:end-[…]` (both resolve to a left inset; the over-wide box then overflows so its centered content lands on the right).

The `en` treatment of the **swoosh itself** is chosen per illustration by which crop reads best. For the Mission card a plain horizontal mirror (`rtl:-scale-x-100`) cropped awkwardly — the dot marker fell off the right edge — so `en` **rotates the swoosh 180°** instead (`rtl:rotate-180`). It reads as a clean arch and keeps `en` visually distinct from the `ar` wave. The transform goes on the **positioning container**, never the inner node (which keeps its own `-scale-y-100 rotate-[156.31deg]`):

```tsx
// Mission card — SVG stays on the right in en AND ar; en rotates the swoosh 180° (not a mirror).
<div className="absolute top-[22px] … ltr:start-[135px] rtl:end-[135px] rtl:rotate-180">
  <div className="-scale-y-100 rotate-[156.31deg]"><PillarMissionIllustration … /></div>
</div>
```

This is a deliberate, fixed-side placement — a `start-*`-only anchor would mirror the _position_ too (right in `ar`, left in `en`), which is **not** what these cards want. The per-locale `en` transform (mirror **or** rotation, whichever crop reads best) goes on the container. Full-bleed card art (the Value grid, the Vision skyline) covers the whole card, so it has no side to pin — leave its positioning alone; only the `rtl:-scale-x-100` shape flip applies.

## ESLint enforcement

A custom rule (or `tailwindcss/no-arbitrary-value` extension) blocks physical direction utilities. If you need to apply one for a genuine reason (e.g., a chart axis), disable the rule on that single line with a comment explaining why.

## Translation file structure

```json
// locales/en.json
{
  "auth": {
    "login": {
      "title": "Sign in to Bonyad",
      "emailLabel": "Email",
      "submitButton": "Sign in",
      "errors": {
        "invalidCredentials": "Wrong email or password"
      }
    }
  },
  "projects": { … },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "email_invalid": "Please enter a valid email"
  }
}
```

Same shape in `ar.json`. A pre-commit hook compares keys and fails on drift.
