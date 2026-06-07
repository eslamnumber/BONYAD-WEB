'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { BookmarkIcon, SaudiRiyalIcon } from '@/components/icons';

import { daysRemaining, localizedServiceName } from '../../lib/project-format';
import { type ProjectDetail } from '../../schemas/project';

import { daysSince, durationMonths, formatBudgetRange, formatLongDate } from './job-offer-format';

/**
 * Project summary card (Figma node 1046:6930): bookmark + deadline/type badges +
 * title, then posted-date / client, then a 5-stat row. Backend-driven from
 * `PROJECTS.DETAILS`; every value falls back to "—" when the field is absent.
 */
export function ProjectSummaryCard({ project }: { project: ProjectDetail }) {
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
  const days = daysRemaining(project.bidsCloseAt);
  const service = localizedServiceName(project, locale);
  const title = project.title || service || t('dashboard.card.untitled');

  return (
    <div className="flex items-start justify-between gap-4">
      <button
        type="button"
        aria-label={t('dashboard.jobOffer.summary.save')}
        className="bg-field-surface border-border focus-visible:outline-ring motion-safe:hover:bg-nav-hover flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <BookmarkIcon className="text-foreground/60 size-[18px]" aria-hidden />
      </button>
      <div className="flex min-w-0 flex-col items-end gap-3">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {days !== null ? (
            <ul className="text-job-accent text-sm font-semibold">
              <li className="ms-5 list-disc">{t('dashboard.offer.daysLeft', { count: days })}</li>
            </ul>
          ) : null}
          {service ? (
            <span
              className="bg-job-accent text-on-media rounded-full px-2.5 py-1 text-xs font-semibold"
              dir="auto"
            >
              {service}
            </span>
          ) : null}
        </div>
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
  const location = project.clientLocation || project.address;

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
        {project.address ?? project.clientLocation ?? '—'}
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
