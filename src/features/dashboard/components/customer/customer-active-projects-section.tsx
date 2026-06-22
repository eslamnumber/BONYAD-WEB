'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import type { CustomerActiveProject } from '../../lib/customer-dashboard';
import { localizedServiceName } from '../../lib/project-format';

import { CustomerSection } from './customer-section';

/**
 * "Active projects" (المشاريع النشطة) — the customer's IN_PROGRESS projects with derived
 * phase progress. The progress bar is copied verbatim from {@link TechnicianActiveProjects}
 * (which copies `project-progress-card`): a `flex justify-end overflow-hidden rounded-full`
 * track that pins the fill to the inline-end + the `rtl:`-flipping gradient + `role="progressbar"`.
 * Rule 4 — direction-sensitive UI is copied, never re-derived. Each row links to the detail.
 */
export function CustomerActiveProjectsSection({ projects }: { projects: CustomerActiveProject[] }) {
  const { t } = useTranslation();

  return (
    <CustomerSection
      title={t('dashboard.customer.home.active.title')}
      viewAllHref={ROUTES.DASHBOARD_PROJECTS_FILTERED('inProgress')}
      viewAllLabel={t('dashboard.customer.home.active.viewAll')}
      isEmpty={projects.length === 0}
      emptyText={t('dashboard.customer.home.active.empty')}
    >
      <ul className="flex w-full flex-col gap-5">
        {projects.map((item) => (
          <ActiveRow key={item.project.id} item={item} />
        ))}
      </ul>
    </CustomerSection>
  );
}

function ActiveRow({ item }: { item: CustomerActiveProject }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const { project, done, total, pct } = item;
  const name =
    project.title || localizedServiceName(project, locale) || t('dashboard.card.untitled');

  return (
    <li>
      <Link
        href={ROUTES.DASHBOARD_PROJECT(String(project.id))}
        className="focus-visible:outline-ring flex w-full flex-col gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <div className="flex w-full items-baseline justify-between gap-3">
          <p className="text-card-foreground min-w-0 flex-1 truncate text-end text-base font-medium">
            <bdi>{name}</bdi>
          </p>
          <span className="text-card-foreground/60 order-first shrink-0 text-sm">{pct}%</span>
        </div>
        <div
          className="bg-progress-track flex h-2.5 w-full items-center justify-end overflow-hidden rounded-full"
          role="progressbar"
          aria-label={name}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="from-progress-from to-progress-to h-full rounded-full bg-gradient-to-r rtl:bg-gradient-to-l"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-card-foreground/60 flex w-full items-center justify-end text-xs">
          <span>{t('dashboard.customer.home.active.phases', { done, total })}</span>
        </div>
      </Link>
    </li>
  );
}
