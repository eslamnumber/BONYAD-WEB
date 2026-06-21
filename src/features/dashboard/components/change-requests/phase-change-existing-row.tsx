'use client';

import { useTranslation } from 'react-i18next';

import type { ProjectPhase } from '../../schemas/project-phase';

import { PhaseFields } from './phase-fields';
import type {
  EditableField,
  ExistingMode,
  PhaseChangesEditorState,
} from './use-phase-changes-editor';

type Props = {
  phase: ProjectPhase;
  state: PhaseChangesEditorState['existing'][number];
  onMode: (mode: ExistingMode) => void;
  onField: (field: EditableField, value: string) => void;
};

/** One existing phase in the editor: a heading + Edit/Remove toggles, revealing
 *  the {@link PhaseFields} when editing or a "will be removed" note when deleting. */
export function PhaseChangeExistingRow({ phase, state, onMode, onField }: Props) {
  const { t } = useTranslation();
  const deleting = state.mode === 'delete';
  const editing = state.mode === 'update';

  return (
    <div
      className={`border-border flex flex-col gap-3 rounded-lg border p-3 ${deleting ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex shrink-0 gap-2">
          {deleting ? (
            <RowButton onClick={() => onMode('none')}>
              {t('dashboard.changeRequests.phase.undo')}
            </RowButton>
          ) : (
            <>
              <RowButton active={editing} onClick={() => onMode(editing ? 'none' : 'update')}>
                {t('dashboard.changeRequests.phase.edit')}
              </RowButton>
              <RowButton tone="danger" onClick={() => onMode('delete')}>
                {t('dashboard.changeRequests.phase.remove')}
              </RowButton>
            </>
          )}
        </div>
        <p dir="auto" className="text-foreground min-w-0 truncate text-start text-sm font-medium">
          {phase.title ||
            phase.description ||
            t('dashboard.changeRequests.phase.label', { number: phase.phaseNumber ?? '—' })}
        </p>
      </div>
      {deleting && (
        <p className="text-status-rejected text-end text-xs">
          {t('dashboard.changeRequests.phase.willRemove')}
        </p>
      )}
      {editing && <PhaseFields values={state} onField={onField} />}
    </div>
  );
}

function RowButton({
  children,
  onClick,
  active,
  tone,
}: {
  children: string;
  onClick: () => void;
  active?: boolean;
  tone?: 'danger';
}) {
  const base =
    'focus-visible:outline-ring rounded-md border px-2.5 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2';
  const tones =
    tone === 'danger' ? 'border-border text-status-rejected' : 'border-border text-foreground';
  const activeCls = active ? 'bg-brand-dark-navy text-on-media border-transparent' : tones;
  return (
    <button type="button" onClick={onClick} className={`${base} ${activeCls}`}>
      {children}
    </button>
  );
}
