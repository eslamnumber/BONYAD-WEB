import { normalizeQualityTier } from './quality-tier';
import type { InterviewAnswers } from './sow-types';

/** `duration_days` → weeks (`ceil(days/7)`, min 1). */
export function durationDaysToWeeks(days: string | undefined): number {
  const n = Number.parseInt((days ?? '').trim(), 10);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.max(1, Math.ceil(n / 7));
}

/** `"City, District"` → `"في <District> ب<City>"`; falls back gracefully. */
function locationClause(location: string | undefined): string {
  const parts = (location ?? '')
    .split(/[,،]/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return `في ${parts[1]} ب${parts[0]}`;
  if (parts.length === 1) return `في ${parts[0]}`;
  return '';
}

/**
 * Pack the interview answers into the ONE locked Arabic GATHER payload the chatbot
 * is tuned for (iOS `buildGatherMessage`). The format is fixed — any deviation
 * degrades SOW accuracy — regardless of UI locale. Empty optional answers are
 * dropped (budget → "ميزانية مفتوحة").
 */
export function buildGatherMessage(answers: InterviewAnswers): string {
  const name = (answers.project_name ?? '').trim();
  const area = (answers.property_area ?? '').trim();
  const description = (answers.description ?? '').trim();
  const tier = normalizeQualityTier(answers.quality_tier);
  const budget = (answers.budget ?? '').trim();
  const weeks = durationDaysToWeeks(answers.duration_days);

  const segments = [
    area ? `${name} ل${area}` : name,
    description,
    locationClause(answers.location),
    tier ? `مستوى الجودة ${tier}` : '',
    budget ? `ميزانية ${budget} ريال` : 'ميزانية مفتوحة',
    `أريد إنجاز خلال ${weeks} أسابيع`,
  ];

  return segments.filter(Boolean).join('، ');
}
