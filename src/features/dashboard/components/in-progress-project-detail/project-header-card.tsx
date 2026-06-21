'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { FileIcon, MessageCircleIcon, SaudiRiyalIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { localizedServiceName } from '../../lib/project-format';
import { type ProjectDetail } from '../../schemas/project';
// Generic project formatters shared with the job-offer summary card (same
// PROJECTS.DETAILS fields). TODO: lift to lib/project-format.ts when the
// job-offer + completed screens are deduped.
import {
  durationMonths,
  formatBudgetRange,
  formatLongDate,
} from '../job-offer-detail/job-offer-format';
import { ProjectStatusBadge } from '../project-status-badge';

/**
 * In-progress header card (Figma node 1103:6596): status pill + title, a
 * contact-actions / client row (message + files buttons · client name + location +
 * avatar), and a 5-stat row (offers · duration · start date · budget · location).
 * Backend-driven from `PROJECTS.DETAILS`; every value falls back to "—" when the
 * field is absent. The stat labels/values reuse the `jobOffer.summary` copy (same
 * strings, same feature).
 */
export function ProjectHeaderCard({ project }: { project: ProjectDetail }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const title =
    project.title || localizedServiceName(project, locale) || t('dashboard.card.untitled');

  return (
    <section className="bg-card border-border flex w-full flex-col gap-6 rounded-lg border p-6">
      <div className="flex justify-end">
        <div className="flex min-w-0 flex-col items-end gap-3">
          <ProjectStatusBadge status={project.status} />
          <h1 className="text-foreground text-end text-2xl font-semibold sm:text-[32px]">
            <bdi>{title}</bdi>
          </h1>
        </div>
      </div>

      <HeaderContact project={project} />
      <HeaderStats project={project} />
    </section>
  );
}

const ACTION_BTN =
  'flex h-[66px] items-center justify-center rounded-full px-6 focus-visible:outline-ring transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

function HeaderContact({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation();
  const location = project.clientLocation || project.address;
  // Technician-only screen — message the project's client (`userId`), falling back to
  // the inbox only when the client id is absent. Never the technician themselves.
  const contactHref = project.userId
    ? ROUTES.DASHBOARD_MESSAGE_FOR(project.userId, {
        name: project.userName,
        projectId: project.id,
      })
    : ROUTES.DASHBOARD_MESSAGES;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Link
          href={contactHref}
          aria-label={t('dashboard.projectDetail.header.message')}
          className={`bg-detail-action text-on-media motion-safe:hover:opacity-90 ${ACTION_BTN}`}
        >
          <MessageCircleIcon className="size-5" aria-hidden />
        </Link>
        <button
          type="button"
          aria-label={t('dashboard.projectDetail.header.files')}
          className={`border-border text-foreground motion-safe:hover:bg-nav-hover border ${ACTION_BTN}`}
        >
          <FileIcon className="size-[18px]" aria-hidden />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-0.5 text-end">
          <p className="text-foreground text-sm font-semibold">
            <bdi>{project.userName ?? '—'}</bdi>
          </p>
          {location ? (
            <p className="text-muted-foreground text-xs">
              <bdi>{location}</bdi>
            </p>
          ) : null}
        </div>
        <Avatar name={project.userName} className="size-12" />
      </div>
    </div>
  );
}

function HeaderStats({ project }: { project: ProjectDetail }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const offers = project.offersCount ?? project.bidsCount ?? null;
  const months = durationMonths(project.timeRequiredDays);
  const start = formatLongDate(project.expectedStartDate, locale);
  const budget = formatBudgetRange(project.budgetMin, project.budgetMax, project.budget);
  const location = project.address || project.clientLocation;

  return (
    <div className="border-border grid grid-cols-2 gap-x-4 gap-y-5 border-t pt-6 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-6">
      <Stat label={t('dashboard.jobOffer.summary.offersLabel')}>
        {offers !== null ? t('dashboard.jobOffer.summary.offersValue', { count: offers }) : '—'}
      </Stat>
      <Stat label={t('dashboard.jobOffer.summary.durationLabel')}>
        {months !== null ? t('dashboard.jobOffer.summary.monthsValue', { count: months }) : '—'}
      </Stat>
      <Stat label={t('dashboard.jobOffer.summary.startDateLabel')}>{start ?? '—'}</Stat>
      <Stat label={t('dashboard.jobOffer.summary.budgetLabel')}>
        {budget ? (
          <span className="inline-flex items-center gap-1">
            {budget}
            <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
            <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
          </span>
        ) : (
          '—'
        )}
      </Stat>
      <Stat label={t('dashboard.jobOffer.summary.locationLabel')}>{location ?? '—'}</Stat>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 text-end">
      <span className="text-detail-label text-xs">{label}</span>
      <span className="text-foreground text-sm font-medium">
        <bdi>{children}</bdi>
      </span>
    </div>
  );
}
