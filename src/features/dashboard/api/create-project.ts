import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { buildCreateProjectFormData } from '../lib/create-project-mapping';
import {
  createProjectRequestSchema,
  type CreateProjectInput,
  type CreateProjectResponse,
} from '../schemas/create-project';

/**
 * Create a project. Mirrors the RN call site
 * website-bonyad/src/screens/projects/creation/hooks/useNewProjectView.ts:385 —
 * POST /projects/create as multipart/form-data. The input is validated against
 * the strict {@link createProjectRequestSchema} (hard rule 1) before the FormData
 * body is assembled. Browser calls go through `/api/proxy/*`, which attaches the
 * session token; `apiClient` passes FormData through so fetch sets the multipart
 * boundary itself.
 */
export async function createProject(input: CreateProjectInput): Promise<CreateProjectResponse> {
  const parsed = createProjectRequestSchema.parse(input);
  const body = buildCreateProjectFormData(parsed);
  return apiClient.post<CreateProjectResponse>(API_ENDPOINTS.PROJECTS.CREATE, { body });
}

/**
 * Create-project mutation. A new project changes every projects list (mine /
 * available / assigned), so all `['projects']` queries are invalidated. The
 * optional phases POST is a separate step (see `create-phases`).
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<CreateProjectResponse, Error, CreateProjectInput>({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
