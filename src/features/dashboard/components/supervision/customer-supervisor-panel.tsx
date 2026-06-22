'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import { useProjectSupervisor } from '../../api';

import { HireSupervisorModal } from './hire-supervisor-modal';
import { RemoveSupervisorDialog } from './remove-supervisor-dialog';

type PanelState = 'active' | 'pending' | 'hireable';

/** Derive the panel state from the supervisor assignment (GET /projects/:id/supervisor —
 *  returns an all-null envelope when none, so "no active/invited supervisor" → hireable). */
function panelState(sup: { status?: string | null; active?: boolean } | undefined): PanelState {
  const status = (sup?.status ?? '').toUpperCase();
  if (status === 'ACTIVE' || sup?.active === true) return 'active';
  if (status === 'INVITED') return 'pending';
  return 'hireable';
}

/**
 * Customer-side supervisor management on the project DETAIL screen (the owner hires /
 * cancels / removes a project supervisor). Reads the live assignment via
 * `useProjectSupervisor` — the detail project itself doesn't carry `canHireSupervisor`
 * — and reuses the shared hire picker + remove dialog.
 */
export function CustomerSupervisorPanel({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const [hireOpen, setHireOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const { data, isPending } = useProjectSupervisor(projectId);

  if (isPending) return null;
  const state = panelState(data);

  return (
    <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 text-end sm:p-6">
      <h2 className="text-foreground text-lg font-semibold">
        {t('dashboard.supervision.customer.panelTitle')}
      </h2>

      {state === 'hireable' ? (
        <>
          <p dir="auto" className="text-muted-foreground text-start text-sm leading-6">
            {t('dashboard.supervision.customer.panelHint')}
          </p>
          <Button
            size="md"
            onClick={() => setHireOpen(true)}
            className="w-full sm:w-auto sm:self-end"
          >
            {t('dashboard.supervision.customer.hire')}
          </Button>
        </>
      ) : (
        <PanelTag state={state} name={data?.supervisorName} onAction={() => setRemoveOpen(true)} />
      )}

      {hireOpen ? (
        <HireSupervisorModal projectId={projectId} onClose={() => setHireOpen(false)} />
      ) : null}
      {removeOpen && state !== 'hireable' ? (
        <RemoveSupervisorDialog
          projectId={projectId}
          mode={state === 'active' ? 'active' : 'pending'}
          onClose={() => setRemoveOpen(false)}
        />
      ) : null}
    </section>
  );
}

function PanelTag({
  state,
  name,
  onAction,
}: {
  state: 'active' | 'pending';
  name?: string | null;
  onAction: () => void;
}) {
  const { t } = useTranslation();
  const tone =
    state === 'active'
      ? 'bg-status-approved-soft text-status-approved'
      : 'bg-status-pending-soft text-status-pending';
  const actionKey = state === 'active' ? 'remove' : 'cancel';

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        type="button"
        onClick={onAction}
        className="text-destructive focus-visible:outline-ring rounded text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t(`dashboard.supervision.customer.${actionKey}`)}
      </button>
      {name ? <bdi className="text-foreground text-sm font-medium">{name}</bdi> : null}
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
      >
        {t(`dashboard.supervision.customer.${state}`)}
      </span>
    </div>
  );
}
