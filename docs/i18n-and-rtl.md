# i18n and RTL

## Direction mapping — intentionally inverted

This project ships an **inverted** locale → direction mapping. The single source of truth is `LOCALE_DIRECTION` in `src/types/locale.ts`:

| Locale | `<html dir>` |
| ------ | ------------ |
| `en`   | `rtl`        |
| `ar`   | `ltr`        |

This is the **opposite** of each script's natural direction (English normally flows LTR, Arabic normally flows RTL). Because logical CSS properties resolve relative to `<html dir>`, every rule below still works mechanically — but the rule-of-thumb intuition that "`-start` lines up with the language's reading direction" no longer holds, since `dir` is decoupled from the language. Read the §Common mistake section with this inversion in mind.

If you ever need to revert to the natural mapping, flip the constant in `src/types/locale.ts` and re-test both locales — no other code change required.

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
5. **`<bdi>` for embedded user-content strings** (usernames, file names) to prevent layout bleed.

## Common mistake — `text-end` vs `text-start` (read this before writing JSX)

When you look at an **RTL Figma frame**, content appears visually anchored to the right. The instinct is to type `text-end` because "end = right." **That instinct is wrong** and produces a screen that mirrors incorrectly when the locale changes.

The logical utilities are **direction-relative** — they resolve against `<html dir>`, not against the language or the script. Because this project inverts the direction mapping (`en → rtl`, `ar → ltr`), the column labels below are by `<html dir>`, **not** by language:

| Utility       | `dir="ltr"` (currently: `ar`)         | `dir="rtl"` (currently: `en`)          |
| ------------- | ------------------------------------- | -------------------------------------- |
| `text-start`  | left-aligned                          | **right-aligned**                      |
| `text-end`    | right-aligned                         | **left-aligned**                       |
| `items-start` | cross-axis left                       | cross-axis right                       |
| `items-end`   | cross-axis right                      | cross-axis left                        |
| `justify-start` (flex-row) | main-axis left           | main-axis right                        |
| `justify-end` (flex-row)   | main-axis right          | main-axis left                         |
| `justify-end` (flex-col)   | vertical bottom — **direction-independent**, fine to use |

### Rule of thumb

**Default to `start`.** It anchors content to the leading edge of whichever direction `<html dir>` currently has, so the layout mirrors automatically when the locale toggles. With the inverted mapping, that leading edge is on the **right** for English and the **left** for Arabic — flipped from each script's natural reading direction, but consistent with the rest of the layout because every component is laid out in the same logical frame.

Only reach for `end` when you genuinely want to align against the leading edge — e.g., a timestamp on the trailing side of a chat bubble. That use case is rare; the bug isn't.

### Real example from this codebase

```tsx
// ❌ Anchors to a fixed visual side — the layout will not mirror when the locale toggles
<div className="flex flex-col items-end gap-6 text-end">
  <h1>{t('home.hero.headline')}</h1>
</div>

// ✓ Anchors to the leading edge — mirrors correctly between `dir=rtl` (en) and `dir=ltr` (ar)
<div className="flex flex-col items-start gap-6 text-start">
  <h1>{t('home.hero.headline')}</h1>
</div>
```

### Verification

After building any component from an RTL Figma frame, **toggle the `bonyad-lang` cookie between `en` and `ar` and reload each time**. The layout should mirror: in `en` you should see `<html dir="rtl">` and content anchored to the right; in `ar` you should see `<html dir="ltr">` and content anchored to the left. If a section stays anchored to the same physical side across both locales, you used `-end` where you needed `-start` (or a physical `left-*`/`right-*` slipped through). ESLint catches the physical utilities; choosing `-start` over `-end` is on you.

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
