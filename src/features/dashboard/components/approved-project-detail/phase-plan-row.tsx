'use client';

import { useTranslation } from 'react-i18next';

import { CloseIcon } from '@/components/icons';

import { PhaseFields } from '../change-requests/phase-fields';

import { type PhasePlanEditorState, type PhaseRow } from './use-phase-plan-editor';

type Props = {
  row: PhaseRow;
  index: number;
  editor: PhasePlanEditorState;
  canRemove: boolean;
};

/**
 * One editable phase in the edit-phase-plan modal: a "Phase N" heading + remove
 * control, then the shared description / duration / cost {@link PhaseFields} (reused
 * from the change-request editor — identical fields). Writes straight to the
 * {@link usePhasePlanEditor} state.
 */
export function PhasePlanRow({ row, index, editor, canRemove }: Props) {
  const { t } = useTranslation();
  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        {canRemove ? (
          <button
            type="button"
            onClick={() => editor.removeRow(row.key)}
            aria-label={t('dashboard.approvedProject.editPhases.remove')}
            className="text-muted-foreground hover:text-destructive focus-visible:ring-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <CloseIcon className="size-4" aria-hidden />
          </button>
        ) : (
          <span aria-hidden />
        )}
        <h3 className="text-foreground text-end text-sm font-semibold">
          {t('dashboard.approvedProject.editPhases.phaseLabel', { number: index + 1 })}
        </h3>
      </div>
      <PhaseFields
        values={{
          description: row.description,
          timeSpentDays: row.timeSpentDays,
          moneySpent: row.moneySpent,
        }}
        onField={(field, value) => editor.setField(row.key, field, value)}
      />
    </div>
  );
}
