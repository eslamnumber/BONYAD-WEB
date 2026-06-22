'use client';

import { useTranslation } from 'react-i18next';

import type { TechnicianDashboardSummary } from '../schemas/technician-dashboard';

import { MoneyAmount } from './money-amount';

/**
 * Service-provider KPI row. Four headline counters from the one
 * `/technicians/me/dashboard` call ({@link TechnicianDashboardSummary}); the two
 * money figures render through {@link MoneyAmount} (Saudi Riyal glyph), the two
 * counts as integers. Cards reuse the create-project chooser's glass-card-with-
 * accent-glow design ({@link CreationOptionCard}) — blue glow here, vs the 2D→3D
 * card's purple — and anchor to the inline-end like the rest of the RTL-first dashboard.
 */
const KPIS = [
  {
    key: 'activeProjects',
    pick: (s: TechnicianDashboardSummary) => s.active_projects,
    money: false,
    glow: 'bg-create-option-blue',
  },
  {
    key: 'pendingPayments',
    pick: (s: TechnicianDashboardSummary) => s.pending_phase_payments,
    money: false,
    glow: 'bg-create-option-green',
  },
  {
    key: 'totalEarned',
    pick: (s: TechnicianDashboardSummary) => s.total_earned_sar,
    money: true,
    glow: 'bg-create-option-amber',
  },
  {
    key: 'outstanding',
    pick: (s: TechnicianDashboardSummary) => s.total_pending_sar,
    money: true,
    glow: 'bg-create-option-purple',
  },
] as const;

const CARD =
  'group relative flex min-h-[124px] flex-col items-end justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-dashboard-search-bg p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] backdrop-blur-[8px]';

export function TechnicianKpiRow({ summary }: { summary: TechnicianDashboardSummary }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {KPIS.map(({ key, pick, money, glow }) => {
        const value = pick(summary) ?? 0;
        return (
          <article key={key} className={CARD}>
            <span
              aria-hidden
              className={`${glow} pointer-events-none absolute start-[-82px] top-[-70px] size-[164px] rounded-full opacity-50 blur-[55px]`}
            />
            <p className="text-foreground/70 relative w-full text-end text-sm">
              {t(`dashboard.home.kpis.${key}`)}
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
