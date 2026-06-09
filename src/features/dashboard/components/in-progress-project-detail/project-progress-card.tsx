'use client';

import { useTranslation } from 'react-i18next';

import { progressPercent } from '../../lib/project-finance';
import { type ProjectPhase } from '../../schemas/project-phase';

type Props = { phases: ProjectPhase[] };

/**
 * Project progress card (Figma node 1103:6683): a percent value + label row above
 * a gradient progress track. The percent is derived (`progressPercent` = paid
 * phases / total, mirroring the RN in-progress screen). The track fills from the
 * inline-end (logical, mirrors with direction) and its width is driven by the
 * live percent. No drop-shadow on this card per the Figma node.
 */
export function ProjectProgressCard({ phases }: Props) {
  const { t } = useTranslation();
  const percent = progressPercent(phases);
  const label = t('dashboard.projectDetail.progress.heading');

  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-lg border p-6">
      <div className="flex w-full items-center justify-between text-lg">
        <span className="text-progress-value font-semibold">
          <bdi>{percent}%</bdi>
        </span>
        <span className="text-foreground font-medium">{label}</span>
      </div>
      <div
        className="bg-progress-track flex h-2.5 w-full items-center justify-end overflow-hidden rounded-full"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="from-progress-from to-progress-to h-full rounded-full bg-gradient-to-r rtl:bg-gradient-to-l"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}
