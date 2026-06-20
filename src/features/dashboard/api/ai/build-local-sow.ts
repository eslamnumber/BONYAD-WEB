import { durationDaysToWeeks } from './build-gather-message';
import { normalizeQualityTier } from './quality-tier';
import type { InterviewAnswers, SowDocument } from './sow-types';

/** Trimmed value, or undefined when blank (keeps the SOW free of empty strings). */
function clean(value: string | undefined): string | undefined {
  return (value ?? '').trim() || undefined;
}

/** `"City, District"` → `{ city, district }`. */
function parseLocation(location: string | undefined): { city?: string; district?: string } {
  const parts = (location ?? '')
    .split(/[,،]/)
    .map((p) => p.trim())
    .filter(Boolean);
  return { city: parts[0], district: parts[1] };
}

/**
 * Last-resort SOW built entirely from the raw interview answers when the chatbot
 * stream, REST fallback, and section accumulation all yield nothing (iOS
 * `buildLocalSOW`). Keeps the flow moving — the user is never hard-blocked — and
 * the review screen can still publish a minimal project from it.
 */
export function buildLocalSow(answers: InterviewAnswers): SowDocument {
  const weeks = durationDaysToWeeks(answers.duration_days);
  const budget = Number.parseFloat((answers.budget ?? '').replace(/[^0-9.]/g, ''));
  const grand = Number.isFinite(budget) && budget > 0 ? { min: budget, max: budget } : undefined;

  return {
    project_metadata: {
      project_name: clean(answers.project_name),
      quality_tier: normalizeQualityTier(answers.quality_tier) || undefined,
      property_type: clean(answers.property_area),
      location: parseLocation(answers.location),
    },
    objectives: { business_objective: clean(answers.description) },
    timeline: { duration_weeks: weeks },
    commercials: grand ? { currency: 'SAR', cost_breakdown: { grand_total: grand } } : undefined,
  };
}
