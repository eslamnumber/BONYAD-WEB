'use client';

import { useTranslation } from 'react-i18next';

import { useTechnicianDashboard } from '../api';
import type { TechnicianDashboardSummary } from '../schemas/technician-dashboard';

const DASH = '—';

/** Whole-number KPI from the summary, or em-dash when the backend omits it. */
function intValue(v: number | null | undefined): string {
  return typeof v === 'number' ? Math.round(v).toLocaleString() : DASH;
}

/** Win-rate (0–1 fraction) as a rounded percentage, or em-dash when absent. */
function rateValue(v: number | null | undefined): string {
  return typeof v === 'number' ? `${Math.round(v * 100)}%` : DASH;
}

/**
 * KPI summary row for the SP Projects screen (Figma 1046:7316 / 7307 / 7298).
 * Three figures sourced live from `GET /technicians/me/dashboard`
 * ({@link TechnicianDashboardSummary}): offer acceptance rate (`win_rate`),
 * projects in progress (`active_projects`), and total projects (`total_projects`).
 * The backend exposes no month-over-month / weekly history, so the design's delta
 * chips are omitted rather than faked; each figure degrades to "—" when its field
 * is absent, and shows a skeleton while the shared dashboard query loads.
 */
const STATS = [
  { key: 'acceptanceRate', read: (s: TechnicianDashboardSummary) => rateValue(s.win_rate) },
  { key: 'inProgress', read: (s: TechnicianDashboardSummary) => intValue(s.active_projects) },
  { key: 'total', read: (s: TechnicianDashboardSummary) => intValue(s.total_projects) },
] as const;

const CARD =
  'bg-card border-border flex min-h-[152px] flex-col items-end justify-between gap-6 overflow-hidden rounded-2xl border p-4 shadow-sm';

export function ProjectStatCards() {
  const { t } = useTranslation();
  const { data, isPending } = useTechnicianDashboard();
  const summary = data?.summary;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {STATS.map(({ key, read }) => (
        <article key={key} className={CARD}>
          <p className="text-card-foreground w-full text-end text-base">
            {t(`dashboard.projects.stats.${key}.title`)}
          </p>
          {isPending ? (
            <div aria-hidden className="bg-muted h-[54px] w-20 animate-pulse rounded-lg" />
          ) : (
            <p
              dir="auto"
              className="text-card-foreground w-full text-end text-[45px] leading-[1.2] font-medium"
            >
              {summary ? read(summary) : DASH}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
