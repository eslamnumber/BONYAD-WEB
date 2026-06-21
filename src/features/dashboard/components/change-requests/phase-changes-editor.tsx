'use client';

import { useTranslation } from 'react-i18next';

import { PlusIcon } from '@/components/icons';

import type { ProjectPhase } from '../../schemas/project-phase';

import { PhaseChangeExistingRow } from './phase-change-existing-row';
import { PhaseChangeNewRow } from './phase-change-new-row';
import type { PhaseChangesEditorState } from './use-phase-changes-editor';

type Props = { editor: PhaseChangesEditorState; phases: ProjectPhase[] };

/**
 * Optional per-phase editing inside the change-request form: edit/remove each
 * existing phase, and append brand-new phases. Reads + writes the
 * {@link usePhaseChangesEditor} state; the form turns it into `phaseChanges`.
 */
export function PhaseChangesEditor({ editor, phases }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground text-end text-sm font-medium">
          {t('dashboard.changeRequests.form.phasesTitle')}
        </h3>
        <p dir="auto" className="text-muted-foreground text-start text-xs">
          {t('dashboard.changeRequests.form.phasesHint')}
        </p>
      </div>

      {phases.length > 0 && <ExistingPhasesBlock editor={editor} phases={phases} />}
      {editor.newPhases.length > 0 && <NewPhasesBlock editor={editor} />}

      <button
        type="button"
        onClick={editor.addNewPhase}
        className="border-border text-foreground focus-visible:outline-ring motion-safe:hover:bg-muted inline-flex items-center justify-center gap-2 self-end rounded-lg border border-dashed px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <PlusIcon className="size-4 shrink-0" aria-hidden />
        {t('dashboard.changeRequests.form.addPhase')}
      </button>
    </div>
  );
}

function ExistingPhasesBlock({ editor, phases }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-end text-xs font-medium">
        {t('dashboard.changeRequests.phase.existingTitle')}
      </p>
      {phases.map((phase) => (
        <PhaseChangeExistingRow
          key={phase.id}
          phase={phase}
          state={editor.existing[phase.id]!}
          onMode={(mode) => editor.setMode(phase.id, mode)}
          onField={(field, value) => editor.setField(phase.id, field, value)}
        />
      ))}
    </div>
  );
}

function NewPhasesBlock({ editor }: { editor: PhaseChangesEditorState }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-end text-xs font-medium">
        {t('dashboard.changeRequests.phase.newTitle')}
      </p>
      {editor.newPhases.map((draft) => (
        <PhaseChangeNewRow
          key={draft.key}
          draft={draft}
          onField={(field, value) => editor.setNewField(draft.key, field, value)}
          onRemove={() => editor.removeNewPhase(draft.key)}
        />
      ))}
    </div>
  );
}
