import { type Locale, LOCALE_DIRECTION } from '@/types/locale';

import type { Service } from '../schemas/service';

/** One run of a service name — `match: true` for the slice that matched the query. */
export type HighlightPart = { text: string; match: boolean };

/** A service that matched the query, with its localized name split for highlighting. */
export type ServiceMatch = {
  service: Service;
  name: string;
  parts: HighlightPart[];
  score: number;
};

/**
 * The display name for a service in the active locale — Arabic in `ar`, English
 * in `en` — read through `LOCALE_DIRECTION` (never `locale === 'ar'`, per
 * docs/i18n-and-rtl.md), falling back to the other locale when one side is blank.
 */
export function localizedServiceName(service: Service, locale: Locale): string {
  const arFirst = LOCALE_DIRECTION[locale] === 'ltr';
  const primary = (arFirst ? service.nameAr : service.nameEn)?.trim();
  const fallback = (arFirst ? service.nameEn : service.nameAr)?.trim();
  return primary || fallback || '';
}

/**
 * Length-preserving normalisation so a match index maps 1:1 back onto the
 * original string for highlighting: lowercase + unify the alef / yaa / taa-marbuta
 * variants Arabic typists use interchangeably. No diacritic stripping (would
 * change length and break the index mapping).
 */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
}

function scorePosition(name: string, idx: number): number {
  if (idx === 0) return 100; // prefix
  if (name[idx - 1] === ' ') return 80; // word start
  return 60; // substring
}

function buildParts(name: string, idx: number, length: number): HighlightPart[] {
  const parts: HighlightPart[] = [];
  if (idx > 0) parts.push({ text: name.slice(0, idx), match: false });
  parts.push({ text: name.slice(idx, idx + length), match: true });
  if (idx + length < name.length) parts.push({ text: name.slice(idx + length), match: false });
  return parts;
}

/**
 * Rank services (categories + subcategories) against a free-text query. Substring
 * match on the localized name, scored prefix > word-start > substring with a small
 * boost for top-level categories; ties break toward the shorter name. Returns at
 * most `limit` matches, each carrying highlight parts for the result row. A lean
 * port of the RN `smartSearch`/`unifiedSearch` (website-bonyad/src/utils).
 */
export function searchServices(
  services: Service[],
  query: string,
  locale: Locale,
  limit = 8,
): ServiceMatch[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const nq = normalize(q);
  const matches: ServiceMatch[] = [];

  for (const service of services) {
    if (service.isActive === false) continue;
    const name = localizedServiceName(service, locale);
    if (!name) continue;
    const idx = normalize(name).indexOf(nq);
    if (idx < 0) continue;
    matches.push({
      service,
      name,
      parts: buildParts(name, idx, q.length),
      score: scorePosition(name, idx) + (service.isCategory ? 5 : 0),
    });
  }

  matches.sort((a, b) => b.score - a.score || a.name.length - b.name.length);
  return matches.slice(0, limit);
}

/**
 * Top-level service categories for the "Suggested searches" column (shown when
 * the query is empty), ordered by the backend `displayOrder`. No backend
 * "suggested searches" endpoint exists, so the active catalogue's headline
 * categories stand in for it.
 */
export function suggestedServices(services: Service[], locale: Locale, limit = 5): Service[] {
  return services
    .filter((s) => s.isCategory && s.isActive !== false && localizedServiceName(s, locale))
    .sort(
      (a, b) =>
        (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER),
    )
    .slice(0, limit);
}
