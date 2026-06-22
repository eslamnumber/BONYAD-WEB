'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import type { TechnicianDashboardProject } from '../schemas/technician-dashboard';

import { MoneyAmount } from './money-amount';

/**
 * "Active projects" panel on the SP dashboard — the `active_projects[]` slice of
 * `/technicians/me/dashboard`. RTL-first like the rest of the dashboard
 * (JobOffersSection / job-offer-item): content anchors to the inline-end, headings
 * use `text-end` (no dir="auto"), and the trailing "View all" link is pulled to the
 * inline-start with `order-first` while staying after the heading in the DOM. The
 * progress fill is a block child, so it grows from the inline-start — right in the
 * RTL-first Arabic, left in English — with no direction branching.
 */
export function TechnicianActiveProjects({ projects }: { projects: TechnicianDashboardProject[] }) {
  const { t } = useTranslation();

  return (
    <section className="bg-card border-border flex w-full flex-col items-end gap-5 rounded-2xl border p-5 shadow-sm">
      <div className="flex w-full items-center justify-between gap-3">
        <h2 className="text-card-foreground min-w-0 text-end text-lg font-semibold">
          {t('dashboard.home.activeProjects.title')}
        </h2>
        <Link
          href={ROUTES.DASHBOARD_PROJECTS}
          className="text-job-accent order-first shrink-0 text-sm font-medium hover:underline"
        >
          {t('dashboard.home.activeProjects.viewAll')}
        </Link>
      </div>
      {projects.length === 0 ? (
        <ActiveProjectsEmpty />
      ) : (
        <ul className="flex w-full flex-col gap-5">
          {projects.map((project) => (
            <ActiveProjectRow key={project.id} project={project} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ActiveProjectRow({ project }: { project: TechnicianDashboardProject }) {
  const { t } = useTranslation();
  const pct = Math.min(100, Math.max(0, Math.round((project.progress_pct ?? 0) * 100)));
  const title = project.title || t('dashboard.home.activeProjects.untitled', { id: project.id });

  return (
    <li className="flex w-full flex-col gap-2">
      <div className="flex w-full items-baseline justify-between gap-3">
        <p className="text-card-foreground min-w-0 flex-1 truncate text-end text-base font-medium">
          {title}
        </p>
        <span className="text-card-foreground/60 order-first shrink-0 text-sm">
          {t('dashboard.home.activeProjects.outstanding')}{' '}
          <MoneyAmount value={project.outstanding_sar ?? 0} />
        </span>
      </div>
      <div
        className="bg-progress-track flex h-2.5 w-full items-center justify-end overflow-hidden rounded-full"
        role="progressbar"
        aria-label={title}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="from-progress-from to-progress-to h-full rounded-full bg-gradient-to-r rtl:bg-gradient-to-l"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-card-foreground/60 flex w-full items-center justify-between text-xs">
        <span>
          {t('dashboard.home.activeProjects.phases', {
            done: project.phases_completed ?? 0,
            total: project.phases_total ?? 0,
          })}
        </span>
        <span>{pct}%</span>
      </div>
    </li>
  );
}

function ActiveProjectsEmpty() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col items-center gap-2 py-10 text-center">
      <p className="text-card-foreground text-base font-medium">
        {t('dashboard.home.activeProjects.empty')}
      </p>
      <p className="text-card-foreground/60 max-w-[360px] text-sm">
        {t('dashboard.home.activeProjects.emptyHint')}
      </p>
    </div>
  );
}
