import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { buildPhaseRequests } from '../lib/create-project-mapping';
import {
  createPhaseRequestSchema,
  type CreatePhaseInput,
  type PhaseInput,
} from '../schemas/phase-input';

/**
 * Create a single phase. Mirrors the RN call site
 * website-bonyad/src/screens/projects/creation/hooks/useNewProjectView.ts:399 —
 * POST /phases (JSON). The body is validated against the strict
 * {@link createPhaseRequestSchema} before sending (hard rule 1).
 */
export async function createPhase(input: CreatePhaseInput): Promise<void> {
  const body = createPhaseRequestSchema.parse(input);
  await apiClient.post<unknown>(API_ENDPOINTS.PHASES.CREATE, { body });
}

/**
 * Create every non-empty phase for a freshly created project, sequentially in
 * phase order. Mirrors the RN loop: a failed phase POST is swallowed so a late
 * phase error never undoes the already-successful project creation.
 */
export async function createPhasesForProject(
  projectId: number,
  phases: PhaseInput[],
): Promise<void> {
  for (const req of buildPhaseRequests(projectId, phases)) {
    try {
      await createPhase(req);
    } catch {
      // RN swallows per-phase errors — the project already exists.
    }
  }
}
