import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { extractProjectMarkers, type ProjectMarker } from '../schemas/project-marker';

export const projectsMapQueryKey = () => ['projects', 'map'] as const;
export const projectsNearMeQueryKey = (lat: number, lng: number) =>
  ['projects', 'map', 'near-me', lat, lng] as const;

/**
 * The technician's default map feed — projects matched to their services +
 * regions. `GET /projects/technician/suggestions` (Bearer auth). The response
 * may be a bare array or `{ projects: [...] }`; {@link extractProjectMarkers}
 * handles both. Mirrors the iOS `getSuggestedProjects`
 * (`TechnicianProjectService.swift:165`).
 */
export async function getSuggestedProjects(): Promise<ProjectMarker[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.PROJECTS.SUGGESTED);
  return extractProjectMarkers(data);
}

export function useSuggestedProjects(enabled = true) {
  return useQuery({
    queryKey: projectsMapQueryKey(),
    queryFn: getSuggestedProjects,
    enabled,
    staleTime: 30_000,
  });
}

/**
 * Projects near a GPS position. `GET /projects/near-me?latitude=&longitude=`
 * (Bearer auth). When `coords` is null the hook is disabled and returns
 * `undefined` — the caller falls back to {@link useSuggestedProjects}. Mirrors
 * the iOS `getProjectsNearMe` (`TechnicianProjectService.swift:245`).
 */
export async function getNearbyProjects(lat: number, lng: number): Promise<ProjectMarker[]> {
  const path = `${API_ENDPOINTS.PROJECTS.NEAR_ME}?latitude=${lat}&longitude=${lng}`;
  const data = await apiClient.get<unknown>(path);
  return extractProjectMarkers(data);
}

export function useNearbyProjects(coords: { lat: number; lng: number } | null, enabled = true) {
  return useQuery({
    queryKey: coords
      ? projectsNearMeQueryKey(coords.lat, coords.lng)
      : ['projects', 'map', 'near-me', 'idle'],
    queryFn: () => getNearbyProjects(coords!.lat, coords!.lng),
    enabled: enabled && coords !== null,
    staleTime: 30_000,
  });
}
