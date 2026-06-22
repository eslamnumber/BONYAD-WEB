'use client';

import { useTranslation } from 'react-i18next';

/** One headline figure — a big value over a quiet label. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-foreground text-start text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-muted-foreground text-start text-sm">{label}</span>
    </div>
  );
}

/**
 * Headline figures for the portfolio header — projects delivered · years of experience,
 * laid out as a horizontal strip across the masthead foot (full width, now the header
 * spans the whole content column). Wraps on narrow phones.
 */
export function PortfolioStatRecord({
  projectCount,
  years,
}: {
  projectCount: number;
  years?: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex flex-wrap gap-x-12 gap-y-4 border-t pt-5">
      <Stat value={String(projectCount)} label={t('portfolio.info.projectsLabel')} />
      <Stat
        value={years !== undefined ? String(years) : '—'}
        label={t('portfolio.info.yearsLabel')}
      />
    </div>
  );
}
