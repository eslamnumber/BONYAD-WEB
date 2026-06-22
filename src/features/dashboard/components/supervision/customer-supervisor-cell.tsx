'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { supervisorCardState, type SupervisorCardState } from '../../lib/supervisor-card-state';
import type { MyProject } from '../../schemas/project';

import { HireSupervisorModal } from './hire-supervisor-modal';
import { RemoveSupervisorDialog } from './remove-supervisor-dialog';

/**
 * The supervisor affordance in a customer project-table row. Reads the row's
 * supervisor fields (no extra fetch) → hire button / pending+cancel / active+remove
 * (iOS `SupervisorProjectCardChip` CardState). Owns the hire picker + remove dialogs.
 */
export function CustomerSupervisorCell({ project }: { project: MyProject }) {
  const { t } = useTranslation();
  const [hireOpen, setHireOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const state = supervisorCardState(project);

  if (state === 'none') {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {state === 'hireable' ? (
        <button
          type="button"
          onClick={() => setHireOpen(true)}
          className="bg-field-surface text-job-accent focus-visible:outline-ring inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap focus-visible:outline-2"
        >
          {t('dashboard.supervision.customer.hire')}
        </button>
      ) : (
        <SupervisorTag
          state={state}
          name={project.supervisorName}
          onAction={() => setRemoveOpen(true)}
        />
      )}

      {hireOpen ? (
        <HireSupervisorModal projectId={project.id} onClose={() => setHireOpen(false)} />
      ) : null}
      {removeOpen && state !== 'hireable' ? (
        <RemoveSupervisorDialog
          projectId={project.id}
          mode={state === 'active' ? 'active' : 'pending'}
          onClose={() => setRemoveOpen(false)}
        />
      ) : null}
    </div>
  );
}

function SupervisorTag({
  state,
  name,
  onAction,
}: {
  state: Exclude<SupervisorCardState, 'hireable' | 'none'>;
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
    <span className="inline-flex items-center gap-2">
      {name ? (
        <bdi className="text-foreground max-w-[7rem] truncate text-xs font-medium">{name}</bdi>
      ) : null}
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
      >
        {t(`dashboard.supervision.customer.${state}`)}
      </span>
      <button
        type="button"
        onClick={onAction}
        className="text-destructive focus-visible:outline-ring rounded text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t(`dashboard.supervision.customer.${actionKey}`)}
      </button>
    </span>
  );
}
