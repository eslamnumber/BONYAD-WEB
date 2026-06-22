'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon, PlusIcon } from '@/components/icons';
import { Modal } from '@/components/ui';

import { useSavePhasePlan } from '../../api/save-phase-plan';
import { type ProjectPhase } from '../../schemas/project-phase';

import { PhasePlanRow } from './phase-plan-row';
import { usePhasePlanEditor } from './use-phase-plan-editor';

type Props = { projectId: number; phases: ProjectPhase[]; open: boolean; onClose: () => void };

/**
 * Technician's "edit phase plan" modal on the APPROVED / PHASE_PLANNING screen —
 * add / edit / remove phases, then save via {@link useSavePhasePlan} (the iOS
 * PhasePlanningView flow: delete removed, PUT survivors, POST new). On success the
 * phases query is refreshed and the modal closes.
 */
export function PhasePlanEditorModal({ projectId, phases, open, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const editor = usePhasePlanEditor(phases);
  const { mutateAsync, isPending, isError } = useSavePhasePlan(projectId);

  const onSave = async () => {
    try {
      await mutateAsync(editor.toSaveInput());
      onClose();
    } catch {
      /* surfaced via isError */
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="max-w-[600px]">
      <Head titleId={titleId} onClose={onClose} />
      <div className="flex w-full flex-col gap-4 p-6">
        {editor.rows.length === 0 ? (
          <p className="text-foreground/60 text-end text-sm">
            {t('dashboard.approvedProject.editPhases.empty')}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {editor.rows.map((row, i) => (
              <PhasePlanRow
                key={row.key}
                row={row}
                index={i}
                editor={editor}
                canRemove={editor.rows.length > 1}
              />
            ))}
          </div>
        )}
        <AddButton onAdd={editor.addRow} />
        {isError ? (
          <p role="alert" className="text-destructive text-end text-sm">
            {t('dashboard.approvedProject.editPhases.error')}
          </p>
        ) : null}
        <Footer
          onSave={onSave}
          onClose={onClose}
          disabled={!editor.isValid || isPending}
          saving={isPending}
        />
      </div>
    </Modal>
  );
}

function Head({ titleId, onClose }: { titleId: string; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex w-full items-start justify-between gap-4 border-b px-6 py-5">
      <button
        type="button"
        onClick={onClose}
        aria-label={t('dashboard.approvedProject.editPhases.close')}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:outline-none"
      >
        <CloseIcon className="size-4" aria-hidden />
      </button>
      <div className="flex min-w-0 flex-col items-end gap-1 text-end">
        <h2 id={titleId} className="text-foreground text-xl font-bold">
          {t('dashboard.approvedProject.editPhases.title')}
        </h2>
        <p className="text-muted-foreground text-[13px]">
          {t('dashboard.approvedProject.editPhases.subtitle')}
        </p>
      </div>
    </div>
  );
}

function AddButton({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onAdd}
      className="border-border text-foreground focus-visible:outline-ring motion-safe:hover:bg-muted inline-flex items-center justify-center gap-2 self-end rounded-lg border border-dashed px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <PlusIcon className="size-4 shrink-0" aria-hidden />
      {t('dashboard.approvedProject.editPhases.addPhase')}
    </button>
  );
}

function Footer({
  onSave,
  onClose,
  disabled,
  saving,
}: {
  onSave: () => void;
  onClose: () => void;
  disabled: boolean;
  saving: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        className="border-border text-foreground focus-visible:outline-ring motion-safe:hover:bg-muted flex items-center justify-center rounded-lg border px-5 py-3 text-[15px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('dashboard.approvedProject.editPhases.cancel')}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring flex items-center justify-center rounded-lg px-5 py-3 text-[15px] font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:opacity-90"
      >
        {t(`dashboard.approvedProject.editPhases.${saving ? 'saving' : 'save'}`)}
      </button>
    </div>
  );
}
