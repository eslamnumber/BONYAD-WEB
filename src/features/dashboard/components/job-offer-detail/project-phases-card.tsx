'use client';

import { useTranslation } from 'react-i18next';

import { useProjectPhases } from '../../api/get-project-phases';
import { type ProjectPhase } from '../../schemas/project-phase';

import { formatMonthYear } from './job-offer-format';

/**
 * Project phases timeline card (Figma node 1046:7007): a vertical timeline of
 * phases (description + expected month/year) with ringed dots + connector lines.
 * Backend-driven from `PHASES.LIST`; renders loading / error / empty states.
 */
export function ProjectPhasesCard({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const { data: phases, isPending, isError } = useProjectPhases(projectId);

  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-xl border p-6">
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-foreground text-end text-lg font-medium">
          {t('dashboard.jobOffer.phases.heading')}
        </h2>
        <div className="bg-border h-px w-full" />
      </div>
      <PhasesBody phases={phases} isPending={isPending} isError={isError} />
    </section>
  );
}

function PhasesBody({
  phases,
  isPending,
  isError,
}: {
  phases?: ProjectPhase[];
  isPending: boolean;
  isError: boolean;
}) {
  const { t } = useTranslation();
  if (isPending)
    return (
      <p className="text-foreground/60 text-end text-sm">
        {t('dashboard.jobOffer.phases.loading')}
      </p>
    );
  if (isError)
    return (
      <p className="text-destructive text-end text-sm">{t('dashboard.jobOffer.phases.error')}</p>
    );
  if (!phases || phases.length === 0)
    return (
      <p className="text-foreground/60 text-end text-sm">{t('dashboard.jobOffer.phases.empty')}</p>
    );
  return (
    <ol className="flex w-full flex-col">
      {phases.map((phase, i) => (
        <PhaseRow key={phase.id} phase={phase} last={i === phases.length - 1} />
      ))}
    </ol>
  );
}

function PhaseRow({ phase, last }: { phase: ProjectPhase; last: boolean }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const date = formatMonthYear(phase.expectedDate ?? phase.startDate ?? phase.dueDate, locale);

  return (
    <li className="flex w-full items-start justify-end gap-4">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-end">
        <p className="text-foreground w-full text-end text-sm font-medium">
          <bdi>{phase.description}</bdi>
        </p>
        {date ? (
          <p className="text-foreground/60 w-full text-end text-xs">
            <bdi>{t('dashboard.jobOffer.phases.expectedDate', { value: date })}</bdi>
          </p>
        ) : null}
      </div>
      <div className="flex flex-col items-center">
        <span className="border-border bg-card size-3 shrink-0 rounded-full border-2" />
        {!last ? <span className="bg-border h-[100px] w-0.5" /> : null}
      </div>
    </li>
  );
}
