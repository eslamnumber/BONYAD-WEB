'use client';

import { type UseFormReturn } from 'react-hook-form';

import { type CreateProjectFormValues } from '../../schemas/create-project-form';

import { StepAssignment } from './step-assignment';
import { StepBudget } from './step-budget';
import { StepDeliverables } from './step-deliverables';
import { StepLocation } from './step-location';
import { StepPhases } from './step-phases';
import { StepProjectInfo } from './step-project-info';
import { StepReview } from './step-review';

/** Renders the active wizard step body (Figma create-project steps 1–6 + review). */
export function WizardStepBody({
  step,
  form,
  onEdit,
}: {
  step: number;
  form: UseFormReturn<CreateProjectFormValues>;
  /** Jump back to a given step — used by the review step's per-card Edit links. */
  onEdit: (step: number) => void;
}) {
  switch (step) {
    case 0:
      return <StepProjectInfo form={form} />;
    case 1:
      return <StepBudget form={form} />;
    case 2:
      return <StepDeliverables form={form} />;
    case 3:
      return <StepPhases form={form} />;
    case 4:
      return <StepAssignment form={form} />;
    case 5:
      return <StepLocation form={form} />;
    case 6:
      return <StepReview form={form} onEdit={onEdit} />;
    default:
      return null;
  }
}
