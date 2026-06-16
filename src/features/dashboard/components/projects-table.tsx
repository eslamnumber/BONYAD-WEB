'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

import { localizedServiceName } from '../lib/project-format';
import { isPendingOrBidPhase, statusVariant } from '../lib/project-status';
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
  // `projectType` is the assignment enum (DIRECT_ASSIGNMENT / BIDDING), not a
  // phase label — show the localized service for the "Current phase" column.
  const phase = service || '—';
  // Bid/pending projects open the offer-submission screen; an assigned project
  // (approved · in-progress · completed) opens the shared detail route, which
  // dispatches the right view by status. CONTRACT_SIGNING opens the customer's
  // contract-signing screen, but stays card-only for technicians (no detail view
  // for them yet) — so the dash gates on the technician role, not the status alone.
  const isTechnician = (useAuthStore((s) => s.user?.role) ?? '').toUpperCase() === 'TECHNICIAN';
  const cardOnly = statusVariant(project.status) === 'contractSigning' && isTechnician;
  const detailHref = isPendingOrBidPhase(project.status)
    ? ROUTES.DASHBOARD_JOB_OFFER(String(project.id))
    : ROUTES.DASHBOARD_PROJECT(String(project.id));

  return (
    <tr className="border-border border-b last:border-b-0">
      <td className="px-3 py-4">
        <DetailsCell cardOnly={cardOnly} href={detailHref} />
      </td>
      <td className={BODY_CELL}>
        {typeof project.budget === 'number' ? (
          <span className="inline-flex items-center gap-1">
            <bdi>{groupedBudget(project.budget)}</bdi>
            <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
            <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
          </span>
        ) : (
          '—'
        )}
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

/** Action cell: a Details link, or a disabled dash for technician CONTRACT_SIGNING. */
function DetailsCell({ cardOnly, href }: { cardOnly: boolean; href: string }) {
  const { t } = useTranslation();
  if (cardOnly)
    return (
      <span className="text-foreground/40 inline-flex px-4 py-1.5 text-xs font-medium">—</span>
    );
  return (
    <Link
      href={href}
      className="bg-field-surface text-job-accent focus-visible:outline-ring inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap focus-visible:outline-2"
    >
      {t('dashboard.projects.table.details')}
    </Link>
  );
}
