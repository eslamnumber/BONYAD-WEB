/**
 * Recent dashboard searches, persisted to localStorage. There is no backend
 * search-history endpoint, so the customer's recent terms live client-side only.
 * Every accessor is SSR-safe (no-ops without `window`) and swallows quota / parse
 * errors — recent searches are best-effort, never load-bearing.
 */
const STORAGE_KEY = 'bonyad:dashboard:recent-searches';
const MAX_RECENT = 5;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  } catch {
    return [];
  }
}

function write(list: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* quota exceeded / private mode — recent searches are best-effort */
  }
}

export function getRecentSearches(): string[] {
  return read();
}

/** Prepend a term (de-duplicated case-insensitively, capped), newest first. */
export function addRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return read();
  const rest = read().filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...rest].slice(0, MAX_RECENT);
  write(next);
  return next;
}

export function removeRecentSearch(term: string): string[] {
  const target = term.trim().toLowerCase();
  const next = read().filter((t) => t.toLowerCase() !== target);
  write(next);
  return next;
}

export function clearRecentSearches(): void {
  write([]);
}
