'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';

import type { SupervisingProject } from '../../schemas/supervisor';

import { SupervisionProjectSummary } from './supervision-project-summary';
import { SupervisorStatusPill } from './supervisor-status-pill';

/**
 * One project the technician is actively supervising — the summary plus a "Manage"
 * link into the supervisor control panel (bids + activity).
 */
export function SupervisionActiveCard({ project }: { project: SupervisingProject }) {
  const { t } = useTranslation();

  return (
    <article className="border-border bg-card flex flex-col gap-5 rounded-2xl border p-5 shadow-sm sm:p-6">
      <div className="flex justify-end">
        <SupervisorStatusPill status="ACTIVE" />
      </div>

      <SupervisionProjectSummary project={project} />

      <div className="flex justify-end">
        <Button asChild size="md" className="w-full sm:w-auto">
          <Link href={ROUTES.DASHBOARD_SUPERVISION_PROJECT(String(project.id))}>
            {t('dashboard.supervision.card.manage')}
          </Link>
        </Button>
      </div>
    </article>
  );
}
