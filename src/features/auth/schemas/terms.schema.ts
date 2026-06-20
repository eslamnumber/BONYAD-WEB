import { z } from 'zod';

import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

/**
 * Active Terms & Conditions document for a role. **Permissive** (every field but
 * `id` optional) — the shape is backend-controlled and ships both language bodies.
 * Mirrors the iOS `TermsAndConditions` model.
 */
export type TermsAndConditions = {
  id: number;
  /** Arabic HTML body. */
  contentAr?: string;
  /** English HTML body. */
  contentEn?: string;
  /** `"USER" | "TECHNICIAN"` — backend-controlled, never narrowed to an enum. */
  type?: string;
  /** e.g. `"1.2"`. */
  version?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** Strict body for `POST /users/terms/approve` — pins the agreement to a version. */
export const approveTermsRequestSchema = z.object({ termsId: z.number().int().positive() });
export type ApproveTermsRequest = z.infer<typeof approveTermsRequestSchema>;

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/** Unwrap a `{ terms }` / `{ data }` envelope, returning the inner record (or the raw one). */
function unwrap(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  for (const key of ['terms', 'data'] as const) {
    const inner = obj[key];
    if (inner && typeof inner === 'object') return inner as Record<string, unknown>;
  }
  return obj;
}

/**
 * Defensively decode a terms GET response. Returns `null` when no numeric `id` is
 * present — the iOS "nil = no active terms, not an error" semantics. Tolerates a
 * bare object or a `{ terms }` / `{ data }` wrapper.
 */
export function normalizeTerms(raw: unknown): TermsAndConditions | null {
  const obj = unwrap(raw);
  const id = obj?.id;
  if (!obj || typeof id !== 'number' || !Number.isFinite(id)) return null;
  return {
    id,
    contentAr: asString(obj.contentAr),
    contentEn: asString(obj.contentEn),
    type: asString(obj.type),
    version: asString(obj.version),
    isActive: typeof obj.isActive === 'boolean' ? obj.isActive : undefined,
    createdAt: asString(obj.createdAt),
    updatedAt: asString(obj.updatedAt),
  };
}

/**
 * Pick the document body in the reader's language, falling back to the other when
 * one side is missing. Selection is by language via the inverted `LOCALE_DIRECTION`
 * (`ltr` ⇒ Arabic UI ⇒ Arabic body), never a bare `locale === 'ar'` (hard rule 4).
 */
export function localizedTermsContent(terms: TermsAndConditions, locale: Locale): string {
  const isArabic = LOCALE_DIRECTION[locale] === 'ltr';
  const primary = isArabic ? terms.contentAr : terms.contentEn;
  const fallback = isArabic ? terms.contentEn : terms.contentAr;
  return (primary ?? '').trim() || (fallback ?? '').trim() || '';
}
