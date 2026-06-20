import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SowDocument } from './sow-types';

export type ServiceItem = {
  id?: number;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  isActive?: boolean;
  parentService?: { id?: number; nameAr?: string; nameEn?: string } | null;
};

export type ServiceMatch = {
  categoryId: number | null;
  subcategoryId: number | null;
  /** Mandatory on POST /v1/projects/from-ai: subcategory ?? category. */
  serviceId: number;
};

/** Flat service catalog. The `/services` path lives directly under `/api` (no `/v1`). */
export async function fetchServices(): Promise<ServiceItem[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.SERVICES.LIST);
  return Array.isArray(data) ? (data as ServiceItem[]) : [];
}

/** Keywords from the SOW that describe the kind of work (iOS matcher inputs). */
export function serviceKeywords(sow: SowDocument): string[] {
  const m = sow.project_metadata ?? {};
  const fields = [m.project_type, m.project_name, m.sector, m.property_type];
  const discipline = sow.scope?.work_discipline ?? [];
  return [...fields, ...discipline]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .flatMap((v) => v.toLowerCase().split(/[\s,،/]+/))
    .filter((t) => t.length >= 2);
}

/** Score one field against a keyword: exact substring, else a 3-char stem match. */
function fieldScore(haystack: string, kw: string, exact: number, stem: number): number {
  if (haystack.includes(kw)) return exact;
  const s = kw.slice(0, 3);
  return s.length >= 3 && haystack.includes(s) ? stem : 0;
}

function scoreService(item: ServiceItem, keywords: string[]): number {
  const ar = (item.nameAr ?? '').toLowerCase();
  const en = (item.nameEn ?? '').toLowerCase();
  const desc =
    `${item.descriptionAr ?? ''} ${item.descriptionEn ?? ''} ${item.description ?? ''}`.toLowerCase();
  return keywords.reduce(
    (score, kw) =>
      score + fieldScore(ar, kw, 5, 2) + fieldScore(en, kw, 3, 2) + (desc.includes(kw) ? 1 : 0),
    0,
  );
}

/**
 * Resolve the service category + subcategory for a SOW (iOS `matchService`). Each
 * active subcategory is scored against keywords pulled from the SOW; the best
 * subcategory's parent becomes the category. Everything must score > 0 or the
 * match is `null` — and a null match blocks publish (serviceId is mandatory).
 */
export function matchService(sow: SowDocument, services: ServiceItem[]): ServiceMatch | null {
  const keywords = serviceKeywords(sow);
  if (keywords.length === 0) return null;

  const subcategories = services.filter((s) => s.isActive !== false && s.parentService?.id);
  let best: ServiceItem | null = null;
  let bestScore = 0;
  for (const sub of subcategories) {
    const score = scoreService(sub, keywords);
    if (score > bestScore) {
      bestScore = score;
      best = sub;
    }
  }
  if (!best || bestScore <= 0 || typeof best.id !== 'number') return null;

  const categoryId = best.parentService?.id ?? null;
  return { categoryId, subcategoryId: best.id, serviceId: best.id };
}
