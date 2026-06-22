'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';

import { localizedServiceName, shortLocation } from '../../lib/project-format';
import { type ProjectStatusVariant } from '../../lib/project-status';
import { type ProjectDetail } from '../../schemas/project';
import { formatBudgetRange, formatLongDate } from '../job-offer-detail/job-offer-format';
import { ProjectStatusBadge } from '../project-status-badge';

/**
 * Contract-signing summary header (Figma node 1501:14663): a status pill + project
 * title + scope line, then a 4-stat row (estimated budget / execution duration in
 * **weeks** / expected start date / location). Backend-driven from `PROJECTS.DETAILS`;
 * every value degrades to "—". Distinct from the approved screen's summary (no client
 * row / offers count; weeks not months). The pill is forced via `variant` so the
 * customer's APPROVED screen shows the green "approved" pill and the CONTRACT_SIGNING
 * screen the blue "contract signing" pill (default).
 */
export function ContractSummaryCard({
  project,
  variant = 'contractSigning',
}: {
  project: ProjectDetail;
  variant?: ProjectStatusVariant;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const service = localizedServiceName(project, locale);
  const title = project.title || service || t('dashboard.card.untitled');

  return (
    <section className="bg-card border-border flex w-full flex-col gap-6 rounded-lg border p-6">
      <div className="flex w-full justify-end">
        <div className="flex min-w-0 flex-col items-end gap-3">
          <ProjectStatusBadge variant={variant} />
          <h2 className="text-foreground text-end text-2xl font-semibold sm:text-[32px]">
            <bdi>{title}</bdi>
          </h2>
          {service ? (
            <p className="text-foreground/80 text-end text-base">
              <bdi>{service}</bdi>
            </p>
          ) : null}
        </div>
      </div>
      <SummaryStats project={project} />
    </section>
  );
}

function SummaryStats({ project }: { project: ProjectDetail }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const weeks =
    typeof project.timeRequiredDays === 'number'
      ? Math.max(1, Math.round(project.timeRequiredDays / 7))
      : null;
  const start = formatLongDate(project.expectedStartDate, locale);
  const budget = formatBudgetRange(project.budgetMin, project.budgetMax, project.budget);

  return (
    <div className="border-border grid grid-cols-2 gap-x-4 gap-y-5 border-t pt-6 sm:grid-cols-4 lg:flex lg:justify-between lg:gap-6">
      <SummaryStat label={t('dashboard.jobOffer.summary.budgetLabel')}>
        {budget ? (
          <span className="inline-flex items-center gap-1">
            {budget}
            <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
            <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
          </span>
        ) : (
          '—'
        )}
      </SummaryStat>
      <SummaryStat label={t('dashboard.jobOffer.summary.durationLabel')}>
        {weeks !== null ? t('dashboard.contractSigning.summary.weeksValue', { count: weeks }) : '—'}
      </SummaryStat>
      <SummaryStat label={t('dashboard.jobOffer.summary.startDateLabel')}>
        {start ?? '—'}
      </SummaryStat>
      <SummaryStat label={t('dashboard.jobOffer.summary.locationLabel')}>
        {shortLocation(project.address ?? project.clientLocation) ?? '—'}
      </SummaryStat>
    </div>
  );
}

function SummaryStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 text-end">
      <span className="text-foreground/40 text-xs">{label}</span>
      <span className="text-foreground text-sm font-medium">
        <bdi>{children}</bdi>
      </span>
    </div>
  );
}
