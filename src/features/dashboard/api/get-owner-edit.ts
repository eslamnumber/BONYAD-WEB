import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { type OwnerEditResponse } from '../schemas/owner-edit';

export const ownerEditQueryKey = (id: number) => ['projects', 'owner-edit', id] as const;

/**
 * Load the owner-editable view of a project. Mirrors the RN call site
 * website-bonyad/src/screens/projects/general/OwnerProjectEditScreen.tsx
 * (`loadProject`) — GET /projects/:id/owner-edit, returning `{ project, phases }`.
 * Permissive response (CLAUDE rule 1); the form maps it via `responseToFormValues`.
 * Browser calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function getOwnerEdit(id: number): Promise<OwnerEditResponse> {
  const path = API_ENDPOINTS.PROJECTS.OWNER_EDIT.replace(':id', String(id));
  return apiClient.get<OwnerEditResponse>(path);
}

export function useOwnerEdit(id: number, enabled = true) {
  return useQuery({
    queryKey: ownerEditQueryKey(id),
    queryFn: () => getOwnerEdit(id),
    // Only fetch once the edit dialog is open, and always reload the latest server
    // state when the owner reopens it.
    enabled,
    staleTime: 0,
  });
}
