import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { isPendingOrBidPhase } from '../lib/project-status';
import type { PaginatedProjectsResponse, Project } from '../schemas/project';

export type GetAvailableProjectsParams = { regionId?: number };

export const availableProjectsQueryKey = (params: GetAvailableProjectsParams = {}) =>
  ['projects', 'available', params] as const;

/**
 * Projects a technician can bid on. Mirrors the RN call site
 * website-bonyad/src/screens/home/DesktopDashboard.tsx:152 — GET /projects, then
 * keep only pending/bid-phase offers not yet assigned to a technician. Browser
 * calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function getAvailableProjects(
  params: GetAvailableProjectsParams = {},
): Promise<Project[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.PROJECTS.LIST, {
    params: { regionId: params.regionId },
  });
  return extractProjects(data).filter(isBiddable);
}

function isBiddable(project: Project): boolean {
  return isPendingOrBidPhase(project.status) && !project.assignedTechnicianId;
}

function extractProjects(data: unknown): Project[] {
  if (Array.isArray(data)) return data as Project[];
  if (data && typeof data === 'object') {
    const content = (data as PaginatedProjectsResponse).content;
    if (Array.isArray(content)) return content;
  }
  return [];
}

export function useAvailableProjects(params: GetAvailableProjectsParams = {}) {
  return useQuery({
    queryKey: availableProjectsQueryKey(params),
    queryFn: () => getAvailableProjects(params),
    staleTime: 1000 * 60 * 5,
  });
}

export const projectsQueryKey = (params: GetAvailableProjectsParams = {}) =>
  ['projects', 'all', params] as const;

/**
 * Every project in the pool, across all phases — the same GET /projects as
 * {@link getAvailableProjects} but UNFILTERED. Backs the Projects screen, which
 * narrows by phase in the UI (toolbar) rather than dropping rows here.
 */
export async function getProjects(params: GetAvailableProjectsParams = {}): Promise<Project[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.PROJECTS.LIST, {
    params: { regionId: params.regionId },
  });
  return extractProjects(data);
}

export function useProjects(params: GetAvailableProjectsParams = {}) {
  return useQuery({
    queryKey: projectsQueryKey(params),
    queryFn: () => getProjects(params),
    staleTime: 1000 * 60 * 5,
  });
}
