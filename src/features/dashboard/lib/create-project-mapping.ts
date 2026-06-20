import { type CreateProjectInput, type CreateProjectRequest } from '../schemas/create-project';
import { type CreateProjectFormValues } from '../schemas/create-project-form';
import { type CreatePhaseInput, type PhaseInput } from '../schemas/phase-input';

/**
 * Wizard form values → the `submitNewProject` vars (create input + phase rows).
 * The select holds the category id as a string; everything else is passed through
 * for the strict {@link createProjectRequestSchema} to validate at the fetcher.
 */
export function formValuesToSubmitVars(values: CreateProjectFormValues): {
  project: CreateProjectInput;
  phases: PhaseInput[];
  photos: File[];
} {
  return {
    photos: values.photos,
    project: {
      serviceCategoryId: Number(values.serviceCategoryId),
      title: values.projectName,
      description: values.description,
      timelineWeeks: values.timelineWeeks,
      budget: values.budget,
      noBudget: values.noBudget,
      deliverables: values.deliverables,
      address: values.regionName,
      assignmentType: values.assignmentType,
      assignedTechnicianId: values.assignedTechnicianId,
    },
    phases: values.phases.map((p) => ({
      name: p.name,
      durationWeeks: p.durationWeeks,
      amount: p.amount,
      description: p.description,
    })),
  };
}

/** Backend stores duration in days; the wizard captures whole weeks. */
const DAYS_PER_WEEK = 7;

/** Digits only (strip commas / spaces / currency glyphs). */
function digits(value: string): string {
  return value.replace(/[^\d]/g, '');
}

/** Append photos as repeated `images` parts (iOS manual-form contract). */
function appendPhotos(fd: FormData, photos: readonly File[]): void {
  photos.forEach((file, i) => fd.append('images', file, file.name || `photo_${i}.jpg`));
}

/**
 * Normalized create input → multipart FormData body for POST /projects/create.
 * Mirrors the RN FormData assembly in
 * website-bonyad/src/screens/projects/creation/hooks/useNewProjectView.ts:331-383
 * (title / description / serviceCategoryId, budget + budgetUnspecified,
 * timeline + timeRequired days, deliverables, the hardcoded address / lat / long,
 * projectType, and the direct-assignment technician). Optional `photos` are
 * appended as repeated `images` parts — mirroring the iOS manual form
 * (bonayd-ios ManualProjectForm.swift:1496-1518); the backend returns them in the
 * project detail `files[]`, which the images gallery renders.
 */
export function buildCreateProjectFormData(
  input: CreateProjectRequest,
  photos: readonly File[],
): FormData {
  const fd = new FormData();
  fd.append('title', input.title);
  fd.append('description', input.description);
  fd.append('serviceCategoryId', String(input.serviceCategoryId));

  const budgetDigits = input.noBudget ? '' : digits(input.budget);
  if (budgetDigits) {
    fd.append('budget', budgetDigits);
    fd.append('budgetUnspecified', 'false');
  } else {
    fd.append('budgetUnspecified', 'true');
  }

  const weeks = parseInt(digits(input.timelineWeeks), 10);
  if (!Number.isNaN(weeks) && weeks > 0) {
    fd.append('timeline', `${weeks} weeks`);
    fd.append('timeRequired', String(weeks * DAYS_PER_WEEK));
  } else {
    fd.append('timeRequired', String(DAYS_PER_WEEK));
  }

  if (input.deliverables) fd.append('deliverables', input.deliverables);

  // The location picker (step 6) writes the selected region's name here; RN's
  // hardcoded "Not specified" is the fallback when no region was chosen.
  fd.append('address', input.address?.trim() || 'Not specified');
  fd.append('latitude', '0');
  fd.append('longitude', '0');
  fd.append('projectType', input.assignmentType);

  if (input.assignmentType === 'DIRECT_ASSIGNMENT' && input.assignedTechnicianId !== null) {
    fd.append('assignedTechnicianId', String(input.assignedTechnicianId));
    fd.append('assignmentType', 'DIRECT_ASSIGNMENT');
  }

  appendPhotos(fd, photos);

  return fd;
}

function phaseHasContent(p: PhaseInput): boolean {
  return p.name.trim() !== '' || p.description.trim() !== '';
}

/**
 * Phase rows → per-phase POST /phases bodies for a freshly created project.
 * Mirrors RN useNewProjectView.ts:394-403 — empty rows are dropped and the
 * survivors are renumbered 1..n. Duration (weeks) → timeSpentDays (×7, defaulting
 * to one week like RN); amount → moneySpent (omitted when blank).
 */
export function buildPhaseRequests(projectId: number, phases: PhaseInput[]): CreatePhaseInput[] {
  return phases.filter(phaseHasContent).map((p, i) => {
    const weeks = parseInt(digits(p.durationWeeks), 10);
    const amount = parseInt(digits(p.amount), 10);
    const req: CreatePhaseInput = {
      projectId,
      phaseNumber: i + 1,
      title: p.name.trim(),
      description: p.description.trim(),
      timeSpentDays: !Number.isNaN(weeks) && weeks > 0 ? weeks * DAYS_PER_WEEK : DAYS_PER_WEEK,
    };
    if (!Number.isNaN(amount) && amount > 0) req.moneySpent = amount;
    return req;
  });
}
