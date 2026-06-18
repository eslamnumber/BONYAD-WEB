import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { MyProject } from '../schemas/project';

export const myProjectsQueryKey = () => ['projects', 'mine'] as const;

/**
 * The signed-in customer's own projects, across every status. Mirrors the RN
 * call site website-bonyad/src/services/ProjectService.ts:355 (`getMyProjects`) —
 * GET /projects/my with no query params. Browser calls go through `/api/proxy/*`,
 * which attaches the session token. Returns the bare `MyProject[]`; the backend
 * may also wrap it in a Spring page envelope — both shapes are handled.
 */
export async function getMyProjects(): Promise<MyProject[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.PROJECTS.MY);
  return extractMyProjects(data);
}

function extractMyProjects(data: unknown): MyProject[] {
  if (Array.isArray(data)) return data as MyProject[];
  if (data && typeof data === 'object') {
    const content = (data as { content?: unknown }).content;
    if (Array.isArray(content)) return content as MyProject[];
  }
  return [];
}

export function useMyProjects() {
  return useQuery({
    queryKey: myProjectsQueryKey(),
    queryFn: getMyProjects,
    // Short so a newly-received bid (the project flips to BID_RECEIVED backend-side)
    // surfaces on the next visit/refocus rather than lingering up to 5 min stale.
    staleTime: 1000 * 30,
  });
}
