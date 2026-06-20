import { countSowSections } from '../../api/ai/merge-sections';
import type { SowDocument, SowKpi, SowResources, SowScope } from '../../api/ai/sow-types';
import type { Project } from '../../schemas/project';

/** A project is AI-generated when the backend flags it OR ships a SOW snapshot (iOS `isAIGenerated`). */
export function isAiGenerated(project: Project): boolean {
  return (
    project.aiGenerated === true ||
    project.hasSow === true ||
    (typeof project.sowJsonSnapshot === 'string' && project.sowJsonSnapshot.trim().length > 0)
  );
}

function safeJson<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? (value as T) : null;
  } catch {
    return null;
  }
}

/** Drop empty/blank entries; return undefined when nothing remains (so it counts as absent). */
function prune<T extends Record<string, unknown>>(obj: T): T | undefined {
  const entries = Object.entries(obj).filter(
    ([, v]) =>
      v !== undefined &&
      v !== null &&
      v !== '' &&
      !(typeof v === 'object' && v && Object.keys(v).length === 0),
  );
  return entries.length ? (Object.fromEntries(entries) as T) : undefined;
}

/** Reconstruct a partial SOW from the flat `sow*` columns when no snapshot is present. */
function fromColumns(p: Project): SowDocument {
  const budget =
    typeof p.sowEstimatedBudget === 'number'
      ? { min: p.sowEstimatedBudget, max: p.sowEstimatedBudget }
      : undefined;
  return {
    project_metadata: prune({
      project_type: p.sowProjectType,
      sector: p.sowSector,
      property_type: p.sowPropertyType,
      complexity_level: p.sowComplexity,
      quality_tier: p.sowQualityTier,
      location: prune({ city: p.sowCity, district: p.sowDistrict }),
    }),
    scope: safeJson<SowScope>(p.sowScope) ?? undefined,
    kpis: safeJson<SowKpi[]>(p.sowKpis) ?? undefined,
    resources: safeJson<SowResources>(p.sowResourcesJson) ?? undefined,
    timeline:
      typeof p.sowDurationMonths === 'number'
        ? { duration_weeks: Math.round(p.sowDurationMonths * 4.345) }
        : undefined,
    commercials: prune({
      currency: p.sowCurrency,
      pricing_model: p.sowPricingModel,
      cost_breakdown: budget ? { grand_total: budget } : undefined,
    }),
  };
}

/**
 * The AI Scope-of-Work for a project, or null for manual projects / when nothing
 * usable is present. Prefers the full `sowJsonSnapshot` (source of truth), then
 * falls back to reconstructing from the flat `sow*` columns. The result feeds the
 * same `SowSections` renderer used by the create-flow review.
 */
export function parseProjectSow(project: Project): SowDocument | null {
  if (!isAiGenerated(project)) return null;
  const snapshot = safeJson<SowDocument>(project.sowJsonSnapshot);
  if (snapshot && countSowSections(snapshot) >= 1) return snapshot;
  const columns = fromColumns(project);
  return countSowSections(columns) >= 1 ? columns : snapshot;
}
