'use client';

import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useProjectPhases } from '../../api/get-project-phases';

import { PhasePlanEditorModal } from './phase-plan-editor-modal';

type Props = { projectId: number };

/**
 * "Edit phase plan" action on the technician's APPROVED / PHASE_PLANNING screen —
 * mirrors the iOS ServiceProviderApprovedStatusView "Edit Phase" button →
 * TechnicianPhasePlanningView. Opens {@link PhasePlanEditorModal}. Phases come from
 * the shared `useProjectPhases` cache (the phases card already loaded them — no extra
 * request); the button waits until they resolve so the editor seeds from real data.
 */
export function EditPhasePlan({ projectId }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: phases, isPending } = useProjectPhases(projectId);

  return (
    <div className="flex w-full justify-end">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="border-brand-dark-navy text-brand-dark-navy focus-visible:outline-ring motion-safe:hover:bg-field-surface inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Pencil className="size-4 shrink-0" aria-hidden />
        {t('dashboard.approvedProject.editPhases.cta')}
      </button>
      {open ? (
        <PhasePlanEditorModal
          projectId={projectId}
          phases={phases ?? []}
          open={open}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
