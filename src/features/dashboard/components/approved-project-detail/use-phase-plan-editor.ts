'use client';

import { useRef, useState } from 'react';

import { type PhaseDraft, type PhasePlanSaveInput } from '../../schemas/phase-plan';
import { type ProjectPhase } from '../../schemas/project-phase';

/** A field the technician can edit on a phase row. */
export type EditableField = 'description' | 'timeSpentDays' | 'moneySpent';

/** One working row in the editor — an existing phase (`id` set) or a new draft (`id` null). */
export type PhaseRow = {
  key: string;
  id: number | null;
  description: string;
  timeSpentDays: string;
  moneySpent: string;
};

function seed(phases: ProjectPhase[]): PhaseRow[] {
  return phases.map((p) => ({
    key: `p-${p.id}`,
    id: p.id,
    description: p.description ?? p.title ?? '',
    timeSpentDays: typeof p.timeSpentDays === 'number' ? String(p.timeSpentDays) : '',
    moneySpent: typeof p.moneySpent === 'number' ? String(p.moneySpent) : '',
  }));
}

function toNumber(value: string): number {
  const n = Number(value.trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Working state for the technician's edit-phase-plan modal: an editable list of phase
 * rows seeded from the project's phases, plus add / remove / field edits. `toSaveInput`
 * produces the {@link PhasePlanSaveInput} diff (survivors re-sent, new ones created,
 * removed ids deleted) — phase numbers are reassigned by display order, matching iOS.
 */
export function usePhasePlanEditor(phases: ProjectPhase[]) {
  const [rows, setRows] = useState<PhaseRow[]>(() => seed(phases));
  const originalIds = useRef(phases.map((p) => p.id));
  const counter = useRef(0);

  const setField = (key: string, field: EditableField, value: string) =>
    setRows((s) => s.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const removeRow = (key: string) => setRows((s) => s.filter((r) => r.key !== key));

  const addRow = () => {
    counter.current += 1;
    setRows((s) => [
      ...s,
      {
        key: `new-${counter.current}`,
        id: null,
        description: '',
        timeSpentDays: '',
        moneySpent: '',
      },
    ]);
  };

  const toSaveInput = (): PhasePlanSaveInput => {
    const surviving = new Set(rows.filter((r) => r.id !== null).map((r) => r.id as number));
    const deletes = originalIds.current.filter((id) => !surviving.has(id));
    const updates: PhasePlanSaveInput['updates'] = [];
    const creates: PhaseDraft[] = [];
    rows.forEach((r, i) => {
      const draft: PhaseDraft = {
        phaseNumber: i + 1,
        description: r.description.trim(),
        timeSpentDays: toNumber(r.timeSpentDays),
        moneySpent: toNumber(r.moneySpent),
      };
      if (r.id === null) creates.push(draft);
      else updates.push({ id: r.id, ...draft });
    });
    return { updates, creates, deletes };
  };

  /** Every phase needs a description before the plan can be saved. */
  const isValid = rows.length > 0 && rows.every((r) => r.description.trim().length > 0);

  return { rows, setField, removeRow, addRow, toSaveInput, isValid };
}

export type PhasePlanEditorState = ReturnType<typeof usePhasePlanEditor>;
