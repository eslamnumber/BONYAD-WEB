'use client';

import { useTranslation } from 'react-i18next';

import { CloseIcon } from '@/components/icons';

import { PhaseFields } from './phase-fields';
import type { EditableField, NewPhaseDraft } from './use-phase-changes-editor';

type Props = {
  draft: NewPhaseDraft;
  onField: (field: EditableField, value: string) => void;
  onRemove: () => void;
};

/** One brand-new (CREATE) phase draft: a labelled card with the editable fields
 *  and a remove control. */
export function PhaseChangeNewRow({ draft, onField, onRemove }: Props) {
  const { t } = useTranslation();
  return (
    <div className="border-status-approved/40 bg-status-approved-soft/30 flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('dashboard.changeRequests.phase.remove')}
          className="text-muted-foreground hover:text-status-rejected focus-visible:outline-ring rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <CloseIcon className="size-3.5" aria-hidden />
        </button>
        <p className="text-foreground text-end text-sm font-medium">
          {t('dashboard.changeRequests.phase.newPhase')}
        </p>
      </div>
      <PhaseFields values={draft} onField={onField} />
    </div>
  );
}
