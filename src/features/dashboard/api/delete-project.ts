import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

/**
 * Delete the owner's own pending project. Mirrors the RN call site
 * website-bonyad/src/screens/projects/general/ProjectDetailScreen.tsx
 * (`handleDeleteProject`) — DELETE /projects/:id. Customer-only action (the RN
 * screen gates it behind `!isTechnician`). Browser calls go through
 * `/api/proxy/*`, which attaches the session token.
 */
export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete<unknown>(API_ENDPOINTS.PROJECTS.DELETE.replace(':id', String(id)));
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteProject,
    // The project is gone — drop every cached projects query (detail + lists).
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
