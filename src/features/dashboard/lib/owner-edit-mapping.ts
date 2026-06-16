import {
  type EditablePhase,
  type OwnerEditFormValues,
  type OwnerEditPayload,
  type OwnerEditPhasePayload,
  type OwnerEditResponse,
  ownerEditPayloadSchema,
} from '../schemas/owner-edit';

/** Backend stores duration in days; the form captures whole weeks. */
const DAYS_PER_WEEK = 7;

type RawPhase = NonNullable<OwnerEditResponse['phases']>[number];

/** Present = not null, undefined, or empty string. */
function present(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

/** Split the stored `"name\n\ndescription"` blob on its first newline run. */
function splitNameDescription(combined: string): { name: string; description: string } {
  const match = combined.match(/\n+/);
  if (match && match.index !== undefined) {
    return {
      name: combined.slice(0, match.index).trim(),
      description: combined.slice(match.index + match[0].length).trim(),
    };
  }
  return { name: '', description: combined };
}

function phaseToForm(phase: RawPhase, index: number): EditablePhase {
  const days = Number(phase.timeSpentDays);
  const hasDuration = present(phase.timeSpentDays) && days > 0;
  return {
    id: typeof phase.id === 'number' ? phase.id : null,
    phaseNumber: present(phase.phaseNumber) ? String(phase.phaseNumber) : String(index + 1),
    description: phase.description ?? '',
    durationWeeks: hasDuration ? String(Math.round(days / DAYS_PER_WEEK) || 1) : '',
    amount: present(phase.moneySpent) ? String(phase.moneySpent) : '',
  };
}

/** GET /owner-edit response → initial form values (RN `loadProject`). */
export function responseToFormValues(res: OwnerEditResponse): OwnerEditFormValues {
  const project = res.project ?? {};
  const { name, description } = splitNameDescription((project.description ?? '').trim());
  const hasBudget = present(project.budget) && project.budget !== 0;
  return {
    name,
    description,
    budgetUnspecified: !hasBudget,
    budget: hasBudget ? String(project.budget) : '',
    address: project.address ?? '',
    existingPhotos: project.files ?? project.photos ?? [],
    phases: (res.phases ?? []).map(phaseToForm),
  };
}

function phaseToPayload(phase: EditablePhase, index: number): OwnerEditPhasePayload {
  const phaseNumber = parseInt(phase.phaseNumber || String(index + 1), 10);
  const days =
    phase.durationWeeks.trim() === '' ? null : parseInt(phase.durationWeeks, 10) * DAYS_PER_WEEK;
  const money = phase.amount.trim() === '' ? null : parseFloat(phase.amount);
  const payload: OwnerEditPhasePayload = {
    id: phase.id ?? null,
    description: phase.description.trim(),
    phaseNumber: Number.isNaN(phaseNumber) ? index + 1 : phaseNumber,
  };
  if (days !== null && !Number.isNaN(days)) payload.timeSpentDays = days;
  if (money !== null && !Number.isNaN(money)) payload.moneySpent = money;
  return payload;
}

/**
 * Form values → strict PUT body (RN `handleSave`, JSON branch). `existingPhotos`
 * is round-tripped so deferring photo *editing* never wipes the project's images.
 */
export function formValuesToPayload(values: OwnerEditFormValues): OwnerEditPayload {
  const parsedBudget =
    values.budgetUnspecified || !values.budget.trim()
      ? null
      : Number(values.budget.replace(/,/g, ''));
  const payload: OwnerEditPayload = {
    description: [values.name.trim(), values.description.trim()].filter(Boolean).join('\n\n'),
    address: values.address.trim(),
    phases: values.phases.map(phaseToPayload),
  };
  if (parsedBudget !== null && !Number.isNaN(parsedBudget)) payload.budget = parsedBudget;
  const existing = values.existingPhotos.filter(Boolean);
  if (existing.length > 0) payload.existingPhotos = existing;
  return ownerEditPayloadSchema.parse(payload);
}
