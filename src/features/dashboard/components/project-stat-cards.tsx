'use client';

import { useTranslation } from 'react-i18next';

/**
 * KPI summary row for the SP Projects screen (Figma 1046:7316 / 7307 / 7298).
 * Three equal cards: title, large figure, and a coloured delta chip + caption.
 *
 * TODO(stats-endpoint): the figures + deltas are intentionally STATIC
 * placeholders. The SP dashboard has no backend stats/summary endpoint (the
 * legacy RN app has none), and the acceptance rate + month-over-month deltas
 * can't be derived from the assigned-projects list. When a real stats endpoint
 * lands, source these from it. The projects table below IS backend-wired
 * (PROJECTS.MY_ASSIGNED). Titles/captions are translated; figures are not.
 */
const STATS = [
  { key: 'acceptanceRate', value: '48%', delta: '-12%', tone: 'down' },
  { key: 'inProgress', value: '12', delta: '+3', tone: 'up' },
  { key: 'total', value: '32', delta: '+6', tone: 'up' },
] as const;

const DELTA_CHIP = {
  up: 'bg-stat-up-soft text-stat-up',
  down: 'bg-stat-down-soft text-stat-down',
} as const;

export function ProjectStatCards() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {STATS.map(({ key, value, delta, tone }) => (
        <article
          key={key}
          className="bg-card border-border flex min-h-[152px] flex-col items-end gap-6 overflow-hidden rounded-2xl border p-4 shadow-sm"
        >
          <p className="text-card-foreground w-full text-end text-base">
            {t(`dashboard.projects.stats.${key}.title`)}
          </p>
          <div className="flex w-full flex-col items-end">
            <p
              dir="auto"
              className="text-card-foreground text-end text-[45px] leading-[1.2] font-medium"
            >
              {value}
            </p>
            <div className="flex items-center gap-2">
              <span
                dir="auto"
                className={`inline-flex items-center rounded p-1 text-xs font-medium ${DELTA_CHIP[tone]}`}
              >
                {delta}
              </span>
              <p className="text-stat-caption text-xs font-medium">
                {t(`dashboard.projects.stats.${key}.caption`)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
