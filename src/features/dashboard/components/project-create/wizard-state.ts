import { type CreateProjectFormValues } from '../../schemas/create-project-form';

/**
 * Seven steps: six content steps + a final review (which submits). The progress
 * bar tracks only the six content steps, so it reads full on the review step.
 */
export const TOTAL_STEPS = 7;
export const PROGRESS_SEGMENTS = 6;

const NS = 'dashboard.createProject.steps';

export type WizardStepConfig = {
  /** i18n key for the per-step section heading. */
  headingKey: string;
  /** i18n key for the optional one-line description under the heading. */
  descriptionKey?: string;
  hasBack: boolean;
  hasSkip: boolean;
};

/** One entry per content step, in order. Drives the heading + nav per step. */
export const STEPS: WizardStepConfig[] = [
  { headingKey: `${NS}.info.heading`, hasBack: false, hasSkip: false },
  {
    headingKey: `${NS}.budget.heading`,
    descriptionKey: `${NS}.budget.description`,
    hasBack: true,
    hasSkip: false,
  },
  {
    headingKey: `${NS}.deliverables.heading`,
    descriptionKey: `${NS}.deliverables.description`,
    hasBack: true,
    hasSkip: true,
  },
  {
    headingKey: `${NS}.phases.heading`,
    descriptionKey: `${NS}.phases.description`,
    hasBack: true,
    hasSkip: true,
  },
  {
    headingKey: `${NS}.assignment.heading`,
    descriptionKey: `${NS}.assignment.description`,
    hasBack: true,
    hasSkip: false,
  },
  {
    headingKey: `${NS}.location.heading`,
    descriptionKey: `${NS}.location.description`,
    hasBack: true,
    hasSkip: false,
  },
  {
    headingKey: 'dashboard.createProject.review.heading',
    descriptionKey: 'dashboard.createProject.review.description',
    hasBack: true,
    hasSkip: false,
  },
];

/** Safe lookup — `step` is always in range, but this keeps the type non-optional. */
export function stepConfigAt(index: number): WizardStepConfig {
  return (
    STEPS[index] ?? STEPS[0] ?? { headingKey: `${NS}.info.heading`, hasBack: false, hasSkip: false }
  );
}

/**
 * Whether the current step's required fields are satisfied — gates the Next /
 * Create button. Only steps with hard requirements constrain it: info (1),
 * budget validity (2), and direct-assignment needing a technician (5). The
 * optional steps (deliverables / phases / location) never block.
 */
export function isStepComplete(index: number, v: CreateProjectFormValues): boolean {
  switch (index) {
    case 0:
      return (
        v.serviceCategoryId !== '' && v.projectName.trim() !== '' && v.description.trim() !== ''
      );
    case 1:
      return v.noBudget || v.budget.trim() === '' || Number(v.budget.replace(/[^\d]/g, '')) > 0;
    case 4:
      return v.assignmentType !== 'DIRECT_ASSIGNMENT' || v.assignedTechnicianId !== null;
    default:
      return true;
  }
}

/**
 * Last step covered by the review card whose Edit link targets `startStep`. All
 * cards map 1:1 to a step except the "assignment & extra details" card, which spans
 * the assignment (4) + location (5) steps — so editing it from review walks 4→5
 * before returning to the summary. See {@link useWizardNav}.
 */
export function editGroupEnd(startStep: number): number {
  return startStep === 4 ? 5 : startStep;
}
