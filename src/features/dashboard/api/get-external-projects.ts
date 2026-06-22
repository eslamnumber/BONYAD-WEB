import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ExternalProject } from '../schemas/external-project';

export const externalProjectsQueryKey = () => ['technician', 'external-projects'] as const;

/** Pull `ExternalProject[]` out of the `{ projects }` envelope; tolerate a bare array. */
function extractProjects(data: unknown): ExternalProject[] {
  if (Array.isArray(data)) return data as ExternalProject[];
  if (data && typeof data === 'object') {
    const projects = (data as { projects?: ExternalProject[] }).projects;
    if (Array.isArray(projects)) return projects;
  }
  return [];
}

/**
 * Off-platform projects the technician tracks — GET /technicians/external-projects.
 * Verified live on the dev backend (technician 444): `{ projects, count, success }`,
 * each item with `progress` (0–100), `status`, `location`, `clientName`. Browser
 * calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function getExternalProjects(): Promise<ExternalProject[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.TECHNICIANS.EXTERNAL_PROJECTS);
  return extractProjects(data);
}

export function useExternalProjects() {
  return useQuery({
    queryKey: externalProjectsQueryKey(),
    queryFn: getExternalProjects,
    staleTime: 1000 * 30,
  });
}
