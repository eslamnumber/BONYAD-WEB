'use client';

import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';

import { useProjectPhases } from '../../api/get-project-phases';
import { type ProjectPhase } from '../../schemas/project-phase';
import { formatBudgetRange, formatMonthYear } from '../job-offer-detail/job-offer-format';

/**
 * Contract-signing phases card (Figma node 1501:14725): a timeline of phases, each
 * with an amount + duration badge, heading, expected date, and task bullets.
 * Backend-driven from `PHASES.LIST`. Heading ← `phase.title ?? phase.description`;
 * bullets ← `phase.description` split on newlines when a distinct `title` exists
 * (never invented — an older phase with only `description` shows it as the heading
 * with no bullets). Amount ← `moneySpent`, duration ← `timeSpentDays`.
 */
export function ContractPhasesCard({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const { data: phases, isPending, isError } = useProjectPhases(projectId);

  return (
    <section className="bg-card border-border flex w-full flex-col gap-6 rounded-xl border p-6">
      <h2 className="text-foreground text-end text-lg font-medium">
        {t('dashboard.jobOffer.phases.heading')}
      </h2>
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
    <ol className="flex w-full flex-col gap-6">
      {phases.map((phase, i) => (
        <PhaseRow key={phase.id} phase={phase} last={i === phases.length - 1} />
      ))}
    </ol>
  );
}

function PhaseRow({ phase, last }: { phase: ProjectPhase; last: boolean }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const heading = phase.title ?? phase.description;
  const bullets = phaseBullets(phase);
  const date = formatMonthYear(phase.expectedDate ?? phase.startDate ?? phase.dueDate, locale);

  return (
    <li className="flex w-full items-stretch justify-end gap-4">
      <div className="flex min-w-0 flex-1 flex-col items-end gap-4 text-end">
        <div className="flex w-full flex-col items-end gap-2">
          <div className="flex w-full items-start justify-between gap-3">
            <PhaseBadges phase={phase} />
            {heading ? (
              <p className="text-foreground min-w-0 text-end text-sm font-medium">
                <bdi>{heading}</bdi>
              </p>
            ) : null}
          </div>
          {date ? (
            <p className="text-foreground/60 w-full text-end text-xs">
              <bdi>{t('dashboard.jobOffer.phases.expectedDate', { value: date })}</bdi>
            </p>
          ) : null}
        </div>
        {bullets.length > 0 ? (
          <ul className="text-foreground/60 marker:text-foreground/40 w-full list-disc ps-5 text-end text-sm">
            {bullets.map((bullet, i) => (
              <li key={i}>
                <bdi>{bullet}</bdi>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <PhaseTimeline last={last} />
    </li>
  );
}

function PhaseBadges({ phase }: { phase: ProjectPhase }) {
  const { t } = useTranslation();
  const amount =
    typeof phase.moneySpent === 'number' ? formatBudgetRange(null, null, phase.moneySpent) : null;
  const days = phase.timeSpentDays;

  return (
    <div className="flex shrink-0 items-center gap-2">
      {amount ? (
        <span className="bg-phase-amount-soft text-phase-amount inline-flex items-center gap-1 rounded-[13px] px-2.5 py-1 text-xs font-medium">
          <bdi>{amount}</bdi>
          <SaudiRiyalIcon className="h-3 w-auto shrink-0" aria-hidden />
          <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
        </span>
      ) : null}
      {typeof days === 'number' ? (
        <span className="bg-field-surface text-muted-foreground inline-flex items-center rounded-[13px] px-2.5 py-1 text-xs">
          <bdi>{t('dashboard.contractSigning.phases.days', { count: days })}</bdi>
        </span>
      ) : null}
    </div>
  );
}

function PhaseTimeline({ last }: { last: boolean }) {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <span className="border-status-contract bg-card size-3 shrink-0 rounded-full border-2" />
      {!last ? <span className="bg-border w-0.5 flex-1" /> : null}
    </div>
  );
}

/** Task bullets from `description` — only when a distinct `title` heading exists. */
function phaseBullets(phase: ProjectPhase): string[] {
  if (!phase.title || !phase.description || phase.title === phase.description) return [];
  return phase.description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
