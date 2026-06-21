/**
 * Pick a backend-localised string by the active UI language. The sketch flow runs
 * in conventional direction, so the displayed language follows `i18n.language`
 * directly (en → English field, ar → Arabic field), falling back to whichever side
 * is present.
 */
export function pickText(language: string, en?: string, ar?: string): string {
  const preferred = language.startsWith('ar') ? ar : en;
  return preferred ?? en ?? ar ?? '';
}
