# i18n and RTL

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

When you look at an **RTL Figma frame**, Arabic text appears visually right-aligned. The instinct is to type `text-end` because "end = right." **That instinct is wrong** and produces a screen that looks correct in English and broken in Arabic.

The logical utilities are **direction-relative**, not visual:

| Utility       | LTR (English)         | RTL (Arabic)          |
| ------------- | --------------------- | --------------------- |
| `text-start`  | left-aligned          | **right-aligned** ✓   |
| `text-end`    | right-aligned         | **left-aligned** ✗    |
| `items-start` | cross-axis left       | cross-axis right ✓    |
| `items-end`   | cross-axis right      | cross-axis left ✗     |
| `justify-start` (flex-row) | main-axis left | main-axis right ✓ |
| `justify-end` (flex-row)   | main-axis right| main-axis left ✗ |
| `justify-end` (flex-col)   | vertical bottom — **direction-independent**, fine to use |

### Rule of thumb

**Default to `start`.** Arabic text is naturally right-aligned because reading flows right-to-left — `text-start` gives that for free. English text is naturally left-aligned — `text-start` gives that too. The result mirrors correctly across both locales.

Only reach for `end` when you genuinely want to align against the reading direction — e.g., a timestamp on the trailing side of a chat bubble. That use case is rare; the bug isn't.

### Real example from this codebase

```tsx
// ❌ Looks right in English (Figma is RTL → text on the right edge), broken in Arabic
<div className="flex flex-col items-end gap-6 text-end">
  <h1>{t('home.hero.headline')}</h1>
</div>

// ✓ Reads naturally in both locales — right-aligned in Arabic, left-aligned in English
<div className="flex flex-col items-start gap-6 text-start">
  <h1>{t('home.hero.headline')}</h1>
</div>
```

### Verification

After building any component from an RTL Figma frame, **set the cookie `bonyad-lang=ar` and reload**. If text shifts to the opposite side of where Figma showed it, you used `-end` where you needed `-start`. ESLint doesn't catch this — it only blocks the physical `text-left`/`text-right`. Both logical variants pass lint; choosing the right one is on you.

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
