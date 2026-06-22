'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';

import type { ProjectDetail } from '../../schemas/project';
import type { ProjectSupervisor } from '../../schemas/supervisor';

import { SupervisionProjectSummary } from './supervision-project-summary';
import { SupervisorStatusPill } from './supervisor-status-pill';

/** Control-panel header: back link to the hub + supervisor status pill + project summary. */
export function SupervisionControlHeader({
  project,
  supervisor,
}: {
  project: ProjectDetail;
  supervisor?: ProjectSupervisor;
}) {
  const { t } = useTranslation();

  return (
    <header className="flex flex-col gap-5">
      <nav className="flex w-full items-center justify-end">
        <Link
          href={ROUTES.DASHBOARD_SUPERVISION}
          className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
        >
          {t('dashboard.supervision.back')}
          {/* Back chevron — flips via ltr:-scale-x-100 (fires in ar under the inverted map). */}
          <ChevronLeftIcon className="size-3 shrink-0 ltr:-scale-x-100" aria-hidden />
        </Link>
      </nav>

      <div className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-5 shadow-sm sm:p-6">
        <div className="flex justify-end">
          <SupervisorStatusPill status={supervisor?.status ?? 'ACTIVE'} />
        </div>
        <SupervisionProjectSummary project={project} />
      </div>
    </header>
  );
}
