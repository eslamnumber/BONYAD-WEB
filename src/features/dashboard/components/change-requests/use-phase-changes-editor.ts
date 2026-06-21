'use client';

import { useRef, useState } from 'react';

import type { PhaseChangeInput } from '../../schemas/change-request-form';
import type { ProjectPhase } from '../../schemas/project-phase';

/** How an existing phase is being treated in the editor. */
export type ExistingMode = 'none' | 'update' | 'delete';

type ExistingEdit = {
  mode: ExistingMode;
  description: string;
  timeSpentDays: string;
  moneySpent: string;
};
type ExistingState = Record<number, ExistingEdit>;

export type NewPhaseDraft = {
  key: string;
  description: string;
  timeSpentDays: string;
  moneySpent: string;
};

export type EditableField = 'description' | 'timeSpentDays' | 'moneySpent';

function seedExisting(phases: ProjectPhase[], seedPhaseId?: number): ExistingState {
  const out: ExistingState = {};
  for (const p of phases) {
    out[p.id] = {
      mode: p.id === seedPhaseId ? 'update' : 'none',
      description: p.description ?? p.title ?? '',
      timeSpentDays: typeof p.timeSpentDays === 'number' ? String(p.timeSpentDays) : '',
      moneySpent: typeof p.moneySpent === 'number' ? String(p.moneySpent) : '',
    };
  }
  return out;
}

function toNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

/** Build the UPDATE/DELETE entry for one existing phase (null when untouched). */
function existingToChange(id: number, edit: ExistingEdit): PhaseChangeInput | null {
  if (edit.mode === 'delete') return { actionType: 'DELETE', phaseId: id };
  if (edit.mode !== 'update') return null;
  const change: Extract<PhaseChangeInput, { actionType: 'UPDATE' }> = {
    actionType: 'UPDATE',
    phaseId: id,
  };
  if (edit.description.trim()) change.description = edit.description.trim();
  const days = toNumber(edit.timeSpentDays);
  if (days !== undefined) change.timeSpentDays = days;
  const money = toNumber(edit.moneySpent);
  if (money !== undefined) change.moneySpent = money;
  return change;
}

/**
 * State for the change-request phase editor: an edit overlay over each existing
 * phase (none / update / delete) plus a list of brand-new phase drafts.
 * {@link PhaseChangesEditor} renders it; the form reads {@link toPhaseChanges}.
 */
export function usePhaseChangesEditor(phases: ProjectPhase[], seedPhaseId?: number) {
  const [existing, setExisting] = useState<ExistingState>(() => seedExisting(phases, seedPhaseId));
  const [newPhases, setNewPhases] = useState<NewPhaseDraft[]>([]);
  const counter = useRef(0);

  const setMode = (id: number, mode: ExistingMode) =>
    setExisting((s) => ({ ...s, [id]: { ...s[id]!, mode } }));
  const setField = (id: number, field: EditableField, value: string) =>
    setExisting((s) => ({ ...s, [id]: { ...s[id]!, [field]: value } }));

  const addNewPhase = () => {
    counter.current += 1;
    const key = `new-${counter.current}`;
    setNewPhases((s) => [...s, { key, description: '', timeSpentDays: '', moneySpent: '' }]);
  };
  const setNewField = (key: string, field: EditableField, value: string) =>
    setNewPhases((s) => s.map((p) => (p.key === key ? { ...p, [field]: value } : p)));
  const removeNewPhase = (key: string) => setNewPhases((s) => s.filter((p) => p.key !== key));

  const toPhaseChanges = (): PhaseChangeInput[] => {
    const changes: PhaseChangeInput[] = [];
    for (const [idStr, edit] of Object.entries(existing)) {
      const change = existingToChange(Number(idStr), edit);
      if (change) changes.push(change);
    }
    for (const draft of newPhases) {
      changes.push({
        actionType: 'CREATE',
        description: draft.description.trim(),
        timeSpentDays: toNumber(draft.timeSpentDays) ?? 0,
        moneySpent: toNumber(draft.moneySpent) ?? 0,
      });
    }
    return changes;
  };

  /** True when a new-phase draft is missing its required description. */
  const hasInvalidNewPhase = newPhases.some((p) => !p.description.trim());

  return {
    existing,
    newPhases,
    setMode,
    setField,
    addNewPhase,
    setNewField,
    removeNewPhase,
    toPhaseChanges,
    hasInvalidNewPhase,
  };
}

export type PhaseChangesEditorState = ReturnType<typeof usePhaseChangesEditor>;
