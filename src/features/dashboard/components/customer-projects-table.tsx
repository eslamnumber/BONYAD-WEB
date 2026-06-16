'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { formatBudget, formatProjectDate, localizedServiceName } from '../lib/project-format';
import { statusVariant } from '../lib/project-status';
import type { MyProject } from '../schemas/project';

import { ProjectStatusBadge } from './project-status-badge';

const HEAD_CELL = 'text-table-head-fg px-3 py-3 text-end text-xs font-semibold whitespace-nowrap';
const BODY_CELL = 'text-foreground px-3 py-4 text-end text-sm font-medium';

/**
 * The customer's own projects table (Figma 1394:8166). Semantic `<table>` in a
 * horizontal-scroll wrapper so the six columns stay readable on narrow viewports.
 * Column order follows the Figma (details → value → creation-date → current-phase
 * → status → project) and mirrors with the document direction. Every row's
 * "Details" link opens the shared project-detail route — the only row action
 * (the customer screen has no inline edit/delete).
 */
export function CustomerProjectsTable({ projects }: { projects: MyProject[] }) {
  const { t } = useTranslation();

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="bg-table-head-bg">
            <th scope="col" className={HEAD_CELL}>
              <span className="sr-only">{t('dashboard.projects.table.details')}</span>
            </th>
            <th scope="col" className={HEAD_CELL}>
              {t('dashboard.projects.table.value')}
            </th>
            <th scope="col" className={HEAD_CELL}>
              {t('dashboard.projects.customer.table.creationDate')}
            </th>
            <th scope="col" className={HEAD_CELL}>
              {t('dashboard.projects.table.phase')}
            </th>
            <th scope="col" className={`${HEAD_CELL} font-medium`}>
              {t('dashboard.projects.table.status')}
            </th>
            <th scope="col" className={HEAD_CELL}>
              {t('dashboard.projects.table.project')}
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <CustomerRow key={project.id} project={project} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerRow({ project }: { project: MyProject }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const service = localizedServiceName(project, locale);
  const name = project.title || service || t('dashboard.card.untitled');
  const phase =
    statusVariant(project.status) === 'completed'
      ? t('dashboard.projects.customer.table.phaseDone')
      : service || '—';

  return (
    <tr className="border-border border-b last:border-b-0">
      <td className="px-3 py-4">
        <Link
          href={ROUTES.DASHBOARD_PROJECT(String(project.id))}
          className="bg-field-surface text-job-accent focus-visible:outline-ring inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap focus-visible:outline-2"
        >
          {t('dashboard.projects.table.details')}
        </Link>
      </td>
      <td className={BODY_CELL}>
        {typeof project.budget === 'number' ? (
          <span className="inline-flex items-center gap-1">
            <bdi>{formatBudget(project.budget)}</bdi>
            <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
            <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className={BODY_CELL}>
        <bdi>{formatProjectDate(project.createdAt, locale)}</bdi>
      </td>
      <td className={BODY_CELL}>
        <bdi>{phase}</bdi>
      </td>
      <td className="px-3 py-4 text-end">
        <ProjectStatusBadge status={project.status} />
      </td>
      <td className={BODY_CELL}>
        <bdi>{name}</bdi>
      </td>
    </tr>
  );
}
