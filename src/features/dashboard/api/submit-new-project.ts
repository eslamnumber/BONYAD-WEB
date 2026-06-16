import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createdProjectId, type CreateProjectInput } from '../schemas/create-project';
import { type PhaseInput } from '../schemas/phase-input';

import { createPhasesForProject } from './create-phases';
import { createProject } from './create-project';

export type SubmitNewProjectVars = {
  project: CreateProjectInput;
  phases: PhaseInput[];
};

/**
 * The wizard's final submit: create the project, then (best-effort) create its
 * optional phases. Mirrors the RN sequence in
 * website-bonyad/src/screens/projects/creation/hooks/useNewProjectView.ts:385-406
 * — phases are POSTed only when the create returns an id, and per-phase failures
 * are swallowed so they never undo the successful creation. Returns the new id.
 */
export async function submitNewProject({
  project,
  phases,
}: SubmitNewProjectVars): Promise<number | undefined> {
  const created = await createProject(project);
  const id = createdProjectId(created);
  if (id !== undefined && phases.length > 0) {
    await createPhasesForProject(id, phases);
  }
  return id;
}

export function useSubmitNewProject() {
  const queryClient = useQueryClient();
  return useMutation<number | undefined, Error, SubmitNewProjectVars>({
    mutationFn: submitNewProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
