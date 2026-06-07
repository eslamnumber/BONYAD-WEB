import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ProjectPhase } from '../schemas/project-phase';

export const projectPhasesQueryKey = (projectId: number) =>
  ['projects', 'phases', projectId] as const;

/**
 * Phases for a project. Mirrors the RN call site
 * website-bonyad/src/screens/projects/general/ProjectDetailScreen.tsx — GET
 * /phases/project/:projectId (PhaseService.getProjectPhases returns a bare
 * array). A `{ content: [] }` envelope is also tolerated for backend flexibility.
 */
export async function getProjectPhases(projectId: number): Promise<ProjectPhase[]> {
  const path = API_ENDPOINTS.PHASES.LIST.replace(':projectId', String(projectId));
  const data = await apiClient.get<unknown>(path);
  return extractPhases(data);
}

function extractPhases(data: unknown): ProjectPhase[] {
  if (Array.isArray(data)) return data as ProjectPhase[];
  if (data && typeof data === 'object') {
    const content = (data as { content?: ProjectPhase[] }).content;
    if (Array.isArray(content)) return content;
  }
  return [];
}

export function useProjectPhases(projectId: number) {
  return useQuery({
    queryKey: projectPhasesQueryKey(projectId),
    queryFn: () => getProjectPhases(projectId),
    staleTime: 1000 * 60 * 5,
  });
}
