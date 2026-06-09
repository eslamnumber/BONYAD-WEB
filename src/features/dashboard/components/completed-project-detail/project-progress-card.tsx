'use client';

import { useTranslation } from 'react-i18next';

import { progressPercent } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';

/**
 * Project progress card (Figma 1103:6813): a percentage + heading row over a
 * rounded track with a purple gradient fill. No shadow / divider (unlike the
 * summary + payments cards), so it uses a plain card wrapper rather than DetailCard.
 * `progressPercent` = settled phases ÷ total (100% for a completed project). The
 * track carries `role="progressbar"` so the value is exposed to assistive tech.
 */
export function ProjectProgressCard({
  phases,
  pending,
}: {
  phases: ProjectPhase[];
  pending?: boolean;
}) {
  const { t } = useTranslation();
  const percent = progressPercent(phases);

  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-lg border p-6">
      <div className="flex w-full items-center justify-between text-lg">
        <span className="text-progress-value font-semibold">{pending ? '—' : `${percent}%`}</span>
        <span className="text-foreground font-medium">
          {t('dashboard.completedProject.progress.heading')}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pending ? undefined : percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('dashboard.completedProject.progress.heading')}
        className="bg-progress-track h-2.5 w-full overflow-hidden rounded-full"
      >
        <div
          className="from-progress-from to-progress-to h-full rounded-full bg-gradient-to-r"
          style={{ width: pending ? '0%' : `${percent}%` }}
        />
      </div>
    </section>
  );
}
