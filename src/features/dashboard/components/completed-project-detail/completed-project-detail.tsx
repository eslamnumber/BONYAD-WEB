'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { useProject } from '../../api/get-project';
import { statusVariant } from '../../lib/project-status';

import { CompletedProjectBody } from './completed-project-body';
import { CompletedProjectHeader } from './completed-project-header';

type Props = { projectId: number };

/**
 * Completed-project detail screen body (Figma "Dashboard-SP (Project detail) -
 * Completed", node 1103:6757 — the Page column only; the right sidebar is supplied
 * by the (app) layout). Client component: fetches the project via TanStack Query
 * (the proxy attaches the session token) and, once it confirms the project is
 * completed, lays out the back-link + header + a two-column row (budget summary ·
 * payment status / progress · phases). Sections are filled one Phase-5 sub-phase
 * at a time. Gated to completed projects — bid-phase detail lives at
 * /dashboard/job-offers/[id] (JobOfferDetail).
 */
export function CompletedProjectDetail({ projectId }: Props) {
  const { t } = useTranslation();
  const { data: project, isPending, isError } = useProject(projectId);

  if (isPending) return <DetailMessage>{t('dashboard.completedProject.loading')}</DetailMessage>;
  if (isError || !project)
    return <DetailMessage>{t('dashboard.completedProject.error')}</DetailMessage>;
  if (statusVariant(project.status) !== 'completed')
    return <DetailMessage>{t('dashboard.completedProject.notCompleted')}</DetailMessage>;

  return (
    <div className="relative isolate mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <TopGlow />
      <div className="flex flex-col gap-6">
        <BackLink />
        <CompletedProjectHeader project={project} />
        <CompletedProjectBody project={project} projectId={projectId} />
        {/* Phase 5 continues: 5d payments · 5e progress · 5f phases (inside CompletedProjectBody) */}
      </div>
    </div>
  );
}

/**
 * Decorative top glow — a soft radial gradient anchored to the top edge (brightest
 * at the top, fading down) in the completed status colour (blue), styled like the
 * job-offer detail screen's top glow. Token-driven + dark-adaptive via
 * --color-detail-action; pointer-events-none and aria-hidden, shown from `sm:` up.
 */
function TopGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto hidden h-[280px] w-full max-w-[1085px] bg-[radial-gradient(75%_100%_at_50%_0%,var(--color-detail-action),transparent_70%)] opacity-50 blur-[24px] sm:block"
    />
  );
}

/**
 * Back link to the projects list (Figma 1103:6829): label + chevron, packed to the
 * inline-end. The single ChevronLeft export flipped via `ltr:-scale-x-100` (fires in
 * Arabic under the inverted en→rtl / ar→ltr mapping) so the back arrow points toward
 * the return edge in both locales — a back arrow, not a forward separator.
 */
function BackLink() {
  const { t } = useTranslation();
  return (
    <nav className="flex w-full items-center justify-end">
      <Link
        href={ROUTES.DASHBOARD_PROJECTS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        {t('dashboard.completedProject.back')}
        <ChevronLeftIcon className="size-3 shrink-0 ltr:-scale-x-100" aria-hidden />
      </Link>
    </nav>
  );
}

function DetailMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-foreground/60 text-end text-sm">{children}</p>
    </div>
  );
}
