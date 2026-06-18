import { LOCALE_TAG, type Locale } from '@/types/locale';

import { FEEDBACK_CATEGORIES } from '../schemas/feedback';

/** Shared query namespace — invalidated after a new feedback is submitted. */
export const feedbackQueryKey = () => ['feedback', 'mine'] as const;

export type FeedbackStatusTone = 'new' | 'reviewed' | 'resolved' | 'neutral';

/** Backend status (uppercased) → badge tone. Map, not a switch, to keep complexity low. */
const STATUS_TONE: Record<string, FeedbackStatusTone> = {
  NEW: 'new',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
};

const TONE_LABEL: Record<FeedbackStatusTone, string> = {
  new: 'feedback.status.new',
  reviewed: 'feedback.status.reviewed',
  resolved: 'feedback.status.resolved',
  neutral: 'feedback.status.unknown',
};

/** Map a backend-controlled status string to an i18n label key + badge tone (permissive). */
export function resolveFeedbackStatus(raw?: string | null): {
  labelKey: string;
  tone: FeedbackStatusTone;
} {
  const tone = STATUS_TONE[(raw ?? '').toUpperCase()] ?? 'neutral';
  return { labelKey: TONE_LABEL[tone], tone };
}

const KNOWN_CATEGORIES = new Set<string>(FEEDBACK_CATEGORIES);

/** Map a category string to its localised label key; unknown values fall back to "other". */
export function resolveFeedbackCategoryKey(raw?: string | null): string {
  const value = (raw ?? '').toUpperCase();
  const key = KNOWN_CATEGORIES.has(value) ? value : 'OTHER';
  return `feedback.categories.${key.toLowerCase()}`;
}

/** Localised medium date, or null for missing/invalid ISO strings. */
export function formatFeedbackDate(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], { dateStyle: 'medium' }).format(date);
}
