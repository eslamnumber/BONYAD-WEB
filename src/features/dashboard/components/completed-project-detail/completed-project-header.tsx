'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { FileIcon, MessageCircleIcon, SaudiRiyalIcon } from '@/components/icons';

import { localizedServiceName, shortLocation } from '../../lib/project-format';
import { type ProjectDetail } from '../../schemas/project';
import {
  durationMonths,
  formatBudgetRange,
  formatLongDate,
} from '../job-offer-detail/job-offer-format';
import { ProjectStatusBadge } from '../project-status-badge';

/**
 * Completed-project header card (Figma 1103:6833): a status badge + project title,
 * then a row of contact actions (message · files) and the client (name · location ·
 * avatar), then a 5-stat meta row (offers · duration · expected start · budget ·
 * location). Backend-driven from `PROJECTS.DETAILS`; every value falls back to "—".
 * Reuses the shipped ProjectStatusBadge (its `completed` variant is the Figma's
 * solid #1A6DB4 chip) and the jobOffer.summary label vocabulary (identical labels).
 */
export function CompletedProjectHeader({ project }: { project: ProjectDetail }) {
  return (
    <section className="bg-card border-border flex w-full flex-col gap-6 rounded-lg border p-6">
      <HeaderTitle project={project} />
      <HeaderContact project={project} />
      <HeaderMeta project={project} />
    </section>
  );
}

function HeaderTitle({ project }: { project: ProjectDetail }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const title =
    project.title || localizedServiceName(project, locale) || t('dashboard.card.untitled');

  return (
    <div className="flex w-full justify-end">
      <div className="flex min-w-0 flex-col items-end gap-3">
        <ProjectStatusBadge status={project.status} />
        <h1 className="text-foreground text-end text-2xl font-semibold sm:text-[32px]">
          <bdi>{title}</bdi>
        </h1>
      </div>
    </div>
  );
}

function HeaderContact({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation();
  const location = shortLocation(project.clientLocation || project.address);

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <ActionButton label={t('dashboard.completedProject.contactClient')} filled>
          <MessageCircleIcon className="text-on-media size-5" aria-hidden />
        </ActionButton>
        <ActionButton label={t('dashboard.completedProject.viewFiles')}>
          <FileIcon className="text-foreground size-[18px]" aria-hidden />
        </ActionButton>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-0.5 text-end">
          <p className="text-foreground text-sm font-semibold">
            <bdi>{project.userName ?? '—'}</bdi>
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

function ActionButton({
  label,
  filled,
  children,
}: {
  label: string;
  filled?: boolean;
  children: ReactNode;
}) {
  const surface = filled
    ? 'bg-detail-action'
    : 'border-border motion-safe:hover:bg-nav-hover border';
  return (
    <button
      type="button"
      aria-label={label}
      className={`focus-visible:outline-ring flex h-[66px] items-center rounded-full px-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${surface}`}
    >
      {children}
    </button>
  );
}

function HeaderMeta({ project }: { project: ProjectDetail }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const offers = project.offersCount ?? project.bidsCount ?? null;
  const months = durationMonths(project.timeRequiredDays);
  const start = formatLongDate(project.expectedStartDate, locale);
  const budget = formatBudgetRange(project.budgetMin, project.budgetMax, project.budget);

  return (
    <div className="border-border grid grid-cols-2 gap-x-4 gap-y-5 border-t pt-6 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-6">
      <MetaStat label={t('dashboard.jobOffer.summary.offersLabel')}>
        {offers !== null ? t('dashboard.jobOffer.summary.offersValue', { count: offers }) : '—'}
      </MetaStat>
      <MetaStat label={t('dashboard.jobOffer.summary.durationLabel')}>
        {months !== null ? t('dashboard.jobOffer.summary.monthsValue', { count: months }) : '—'}
      </MetaStat>
      <MetaStat label={t('dashboard.jobOffer.summary.startDateLabel')}>{start ?? '—'}</MetaStat>
      <MetaStat label={t('dashboard.jobOffer.summary.budgetLabel')}>
        {budget ? (
          <span className="inline-flex items-center gap-1">
            {budget}
            <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
            <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
          </span>
        ) : (
          '—'
        )}
      </MetaStat>
      <MetaStat label={t('dashboard.jobOffer.summary.locationLabel')}>
        {shortLocation(project.address ?? project.clientLocation) ?? '—'}
      </MetaStat>
    </div>
  );
}

function MetaStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 text-end">
      <span className="text-foreground/40 text-xs">{label}</span>
      <span className="text-foreground text-sm font-medium">
        <bdi>{children}</bdi>
      </span>
    </div>
  );
}
