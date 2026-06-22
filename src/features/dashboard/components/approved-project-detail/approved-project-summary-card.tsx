'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { SaudiRiyalIcon } from '@/components/icons';

import { localizedServiceName, shortLocation } from '../../lib/project-format';
import { type ProjectDetail } from '../../schemas/project';
import {
  daysSince,
  durationMonths,
  formatBudgetRange,
  formatLongDate,
} from '../job-offer-detail/job-offer-format';
import { ProjectStatusBadge } from '../project-status-badge';

/**
 * Approved-project summary header (Figma node 1103:6417): an "Approved" status
 * pill + project title, then posted-date / client, then a 5-stat row. Backend-driven
 * from `PROJECTS.DETAILS`; every value falls back to "—" when absent. Mirrors the
 * job-offer `ProjectSummaryCard` structure (shared formatters + status badge) but
 * swaps its bookmark/deadline header for the status pill, and omits the budget
 * currency glyph (this Figma renders the figure alone).
 */
export function ApprovedProjectSummaryCard({ project }: { project: ProjectDetail }) {
  return (
    <section className="bg-card border-border flex w-full flex-col gap-6 rounded-lg border p-6">
      <SummaryHeader project={project} />
      <SummaryClient project={project} />
      <SummaryStats project={project} />
    </section>
  );
}

function SummaryHeader({ project }: { project: ProjectDetail }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const service = localizedServiceName(project, locale);
  const title = project.title || service || t('dashboard.card.untitled');

  return (
    <div className="flex w-full justify-end">
      <div className="flex min-w-0 flex-col items-end gap-3">
        <ProjectStatusBadge status={project.status} />
        <h2 className="text-foreground text-end text-2xl font-semibold sm:text-[32px]">
          <bdi>{title}</bdi>
        </h2>
      </div>
    </div>
  );
}

function SummaryClient({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation();
  const days = daysSince(project.createdAt);
  const location = shortLocation(project.clientLocation || project.address);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {days !== null ? (
        <p className="text-foreground/60 text-[13px] font-medium" dir="auto">
          {t('dashboard.jobOffer.summary.postedAgo', { count: days })}
        </p>
      ) : null}
      <div className="ms-auto flex items-center gap-3">
        <div className="flex flex-col items-end gap-0.5 text-end">
          <p className="text-foreground text-sm font-semibold">
            <bdi>{project.userName}</bdi>
          </p>
          {location ? (
            <p className="text-foreground/60 text-xs">
              <bdi>{location}</bdi>
            </p>
          ) : null}
        </div>
        <Avatar name={project.userName} className="size-12" />
      </div>
    </div>
  );
}

function SummaryStats({ project }: { project: ProjectDetail }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const offers = project.offersCount ?? project.bidsCount ?? null;
  const months = durationMonths(project.timeRequiredDays);
  const start = formatLongDate(project.expectedStartDate, locale);
  const budget = formatBudgetRange(project.budgetMin, project.budgetMax, project.budget);

  return (
    <div className="border-border grid grid-cols-2 gap-x-4 gap-y-5 border-t pt-6 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-6">
      <SummaryStat label={t('dashboard.jobOffer.summary.offersLabel')}>
        {offers !== null ? t('dashboard.jobOffer.summary.offersValue', { count: offers }) : '—'}
      </SummaryStat>
      <SummaryStat label={t('dashboard.jobOffer.summary.durationLabel')}>
        {months !== null ? t('dashboard.jobOffer.summary.monthsValue', { count: months }) : '—'}
      </SummaryStat>
      <SummaryStat label={t('dashboard.jobOffer.summary.startDateLabel')}>
        {start ?? '—'}
      </SummaryStat>
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
