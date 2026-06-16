'use client';

import { useTranslation } from 'react-i18next';

import type { CustomerStats } from '../lib/project-customer';

const CARDS = ['total', 'active', 'completed'] as const;

/**
 * Customer Projects KPI row (Figma 1394:8251 / 8260 / 8269). Three equal cards —
 * title, large count, and a coloured delta chip + caption. Order puts "Total" at
 * the reading-start edge (right in the RTL-first design). Counts + deltas are
 * derived from `/projects/my` (see {@link computeCustomerStats}); the delta is
 * always additive ("+N this month"), so the chip is always the up-tone.
 */
export function CustomerProjectStatCards({ stats }: { stats: CustomerStats }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {CARDS.map((key) => (
        <article
          key={key}
          className="bg-card border-border flex min-h-[152px] flex-col items-end gap-6 overflow-hidden rounded-2xl border p-4 shadow-sm"
        >
          <p className="text-card-foreground w-full text-end text-base">
            {t(`dashboard.projects.customer.stats.${key}.title`)}
          </p>
          <div className="flex w-full flex-col items-end">
            <p
              dir="auto"
              className="text-card-foreground text-end text-[45px] leading-[1.2] font-medium"
            >
              {stats[key].value}
            </p>
            <div className="flex items-center gap-2">
              <span
                dir="auto"
                className="bg-stat-up-soft text-stat-up inline-flex items-center rounded p-1 text-xs font-medium"
              >
                +{stats[key].delta}
              </span>
              <p className="text-stat-caption text-xs font-medium">
                {t(`dashboard.projects.customer.stats.${key}.caption`)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
