'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

import { localizedServiceName } from '../lib/project-format';
import type { Project } from '../schemas/project';

import { ProjectStatusBadge } from './project-status-badge';

const HEAD_CELL = 'text-table-head-fg px-3 py-3 text-end text-xs font-semibold whitespace-nowrap';
const BODY_CELL = 'text-foreground px-3 py-4 text-end text-sm font-medium';

function groupedBudget(budget: number | null | undefined): string {
  return typeof budget === 'number' ? new Intl.NumberFormat('en-US').format(budget) : '—';
}

/**
 * Assigned-projects table (Figma 1046:7171). Semantic `<table>` for a11y, wrapped
 * in a horizontal-scroll container so the six columns stay readable on narrow
 * viewports (a data table can't responsively stack). Column order follows the
 * Figma (details → value → phase → status → client → project) and mirrors with
 * the document direction.
 */
export function ProjectsTable({ projects }: { projects: Project[] }) {
  const { t } = useTranslation();

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[680px] border-collapse">
        <thead>
          <tr className="bg-table-head-bg">
            <th scope="col" className={HEAD_CELL}>
              <span className="sr-only">{t('dashboard.projects.table.details')}</span>
            </th>
            <th scope="col" className={HEAD_CELL}>
              {t('dashboard.projects.table.value')}
            </th>
            <th scope="col" className={HEAD_CELL}>
              {t('dashboard.projects.table.phase')}
            </th>
            <th scope="col" className={`${HEAD_CELL} font-medium`}>
              {t('dashboard.projects.table.status')}
            </th>
            <th scope="col" className={HEAD_CELL}>
              {t('dashboard.projects.table.client')}
            </th>
            <th scope="col" className={HEAD_CELL}>
              {t('dashboard.projects.table.project')}
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const service = localizedServiceName(project, locale);
  const name = project.title || service || t('dashboard.card.untitled');
  const phase = project.projectType || service || '—';

  return (
    <tr className="border-border border-b last:border-b-0">
      <td className="px-3 py-4">
        <Link
          href={ROUTES.DASHBOARD_JOB_OFFER(String(project.id))}
          className="bg-field-surface text-job-accent focus-visible:outline-ring inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap focus-visible:outline-2"
        >
          {t('dashboard.projects.table.details')}
        </Link>
      </td>
      <td className={BODY_CELL}>
        <bdi>{groupedBudget(project.budget)}</bdi>
      </td>
      <td className={BODY_CELL}>
        <bdi>{phase}</bdi>
      </td>
      <td className="px-3 py-4 text-end">
        <ProjectStatusBadge status={project.status} />
      </td>
      <td className={BODY_CELL}>
        <bdi>{project.userName || '—'}</bdi>
      </td>
      <td className={BODY_CELL}>
        <bdi>{name}</bdi>
      </td>
    </tr>
  );
}
