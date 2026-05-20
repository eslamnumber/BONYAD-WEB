# i18n and RTL

## Direction mapping — inverted (product decision)

This project uses an **inverted** locale → direction mapping. The single source of truth is `LOCALE_DIRECTION` in `src/types/locale.ts`:

| Locale | `<html dir>` |
| ------ | ------------ |
| `en`   | `rtl`        |
| `ar`   | `ltr`        |

This is intentional. The Figma designs are RTL-first (Arabic primary market) and the layouts are authored visually with content anchored to the **right edge**. By keeping `<html dir="ltr">` in Arabic mode, the logical CSS utilities `-end` / `end-*` / `pe-*` / `me-*` resolve to the **right side** — which matches what Figma shows. When the locale toggles to English, `<html dir="rtl">` flips every logical utility so the same code mirrors automatically.

**Rule:** never read the locale name directly to make a layout decision. Always go through `LOCALE_DIRECTION[locale]` (or rely on logical CSS / Tailwind utilities). The locale → direction map is the single point that can change; everything downstream must read from it.

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
6. **`<bdi>` for embedded user-content strings** (usernames, file names) to prevent layout bleed.

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

Arrows must flip with the reading direction: in Arabic the arrow on a "view more" link points **left** (←), in English it points **right** (→).

**Rule:** import one icon (`ChevronRight` from `lucide-react`) and add the class `ltr:-scale-x-100`. Never conditionally pick `ChevronLeft` vs `ChevronRight` based on the locale.

Why `ltr:`? Because the mapping is inverted: `<html dir="ltr">` is the **Arabic** locale, so flipping in `ltr` mode turns the right-pointing chevron into a left-pointing one — correct for Arabic reading direction. In English, `<html dir="rtl">`, the class doesn't trigger, so the chevron stays right-pointing — correct for English.

```tsx
// ❌ Conditional icon picking — locale-name check, breaks the single-source rule
const Chevron = LOCALE_DIRECTION[locale] === 'rtl' ? ChevronLeft : ChevronRight;
<Chevron className="size-5" aria-hidden />

// ✓ One icon, one class — flips automatically with html dir
<ChevronRight className="size-5 ltr:-scale-x-100" aria-hidden />
```

Non-directional icons (search, settings, user avatar, check marks) **do not flip**. Only icons whose meaning is tied to reading direction — back/forward arrows, chevrons, breadcrumb separators — need the `ltr:-scale-x-100` class.

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
