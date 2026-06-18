import { type Locale } from '@/types/locale';

import { type PortfolioProject } from '../schemas/portfolio';

/** Format one `YYYY-MM-DD` date to a localized `MMM YYYY`, or null when unparseable. */
export function formatProjectDate(date: string | undefined, locale: Locale): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    year: 'numeric',
    month: 'short',
  }).format(d);
}

/** A `start – end` range, or whichever single endpoint is present, or null. */
export function projectDateRange(
  project: Pick<PortfolioProject, 'startDate' | 'endDate'>,
  locale: Locale,
): string | null {
  const start = formatProjectDate(project.startDate, locale);
  const end = formatProjectDate(project.endDate, locale);
  if (start && end) return `${start} – ${end}`;
  return start ?? end ?? null;
}

/** The card's cover image (first photo), or null for the placeholder. */
export function projectCover(project: PortfolioProject): string | null {
  return project.photos[0] ?? null;
}
