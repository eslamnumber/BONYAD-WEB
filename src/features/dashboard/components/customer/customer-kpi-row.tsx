'use client';

import { useTranslation } from 'react-i18next';

import type { CustomerKpis } from '../../lib/customer-dashboard';
import { MoneyAmount } from '../money-amount';

/**
 * Customer dashboard KPI row — four headline counters derived from `/projects/my`
 * ({@link CustomerKpis}). Styled to match the technician dashboard's KPI cards
 * ({@link TechnicianKpiRow}): the create-project-chooser glass-card-with-accent-glow
 * design, anchored to the inline-end like the rest of the RTL-first dashboard. The two
 * money figures render through {@link MoneyAmount} (Saudi Riyal glyph); the two counts
 * as integers. Order follows the draft's RTL reading: due → paid → active → requests.
 */
const KPIS = [
  {
    key: 'dueNow',
    pick: (k: CustomerKpis) => k.dueNow,
    money: true,
    glow: 'bg-create-option-blue',
  },
  {
    key: 'paidSoFar',
    pick: (k: CustomerKpis) => k.paidSoFar,
    money: true,
    glow: 'bg-create-option-green',
  },
  {
    key: 'activeProjects',
    pick: (k: CustomerKpis) => k.activeProjects,
    money: false,
    glow: 'bg-create-option-amber',
  },
  {
    key: 'openRequests',
    pick: (k: CustomerKpis) => k.openRequests,
    money: false,
    glow: 'bg-create-option-purple',
  },
] as const;

const CARD =
  'group relative flex min-h-[124px] flex-col items-end justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-dashboard-search-bg p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] backdrop-blur-[8px]';

export function CustomerKpiRow({ kpis }: { kpis: CustomerKpis }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {KPIS.map(({ key, pick, money, glow }) => {
        const value = pick(kpis) ?? 0;
        return (
          <article key={key} className={CARD}>
            <span
              aria-hidden
              className={`${glow} pointer-events-none absolute start-[-82px] top-[-70px] size-[164px] rounded-full opacity-50 blur-[55px]`}
            />
            <p className="text-foreground/70 relative w-full text-end text-sm">
              {t(`dashboard.customer.home.kpis.${key}`)}
            </p>
            <p className="text-foreground relative w-full text-end text-3xl font-semibold sm:text-4xl">
              {money ? <MoneyAmount value={value} /> : Math.round(value).toLocaleString()}
            </p>
          </article>
        );
      })}
    </div>
  );
}
