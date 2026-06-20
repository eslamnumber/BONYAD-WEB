import type { SowDocument } from './sow-types';

/** Top-level SOW sections, in display order — also the progress denominator. */
export const SOW_SECTION_ORDER = [
  'project_metadata',
  'objectives',
  'scope',
  'deliverables',
  'timeline',
  'resources',
  'commercials',
  'compliance',
  'risks',
  'kpis',
] as const;

/**
 * Merge one streamed `section` event into the accumulating SOW by its dotted
 * `path` (e.g. `scope`, `commercials.cost_breakdown`). Returns a new object so
 * React re-renders. Mirrors iOS's keyed section map → partial `SOWDocument`.
 */
export function mergeSection(base: SowDocument, path: string, value: unknown): SowDocument {
  const keys = path.split('.').filter(Boolean);
  if (keys.length === 0) return base;
  const next = structuredClone(base) as Record<string, unknown>;
  let cursor = next;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i] as string;
    if (typeof cursor[k] !== 'object' || cursor[k] === null) cursor[k] = {};
    cursor = cursor[k] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1] as string] = value;
  return next as SowDocument;
}

/** Count of top-level sections that carry content — drives the generating progress bar. */
export function countSowSections(sow: SowDocument): number {
  return SOW_SECTION_ORDER.reduce((n, key) => {
    const v = sow[key];
    if (Array.isArray(v)) return v.length > 0 ? n + 1 : n;
    if (v && typeof v === 'object') return Object.keys(v).length > 0 ? n + 1 : n;
    return n;
  }, 0);
}
