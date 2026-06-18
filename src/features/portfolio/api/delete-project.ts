import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { portfolioProjectsQueryKey, portfolioQueryKey } from '../lib/portfolio-normalize';

/**
 * Remove a past project. Mirrors the iOS delete (PortfolioModels.swift:995,
 * PortfolioManagementView.swift:839) — DELETE /portfolios/projects/:id. Browser calls
 * go through `/api/proxy/*`, which attaches the session token.
 */
export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete<unknown>(
    API_ENDPOINTS.PORTFOLIO.DELETE_PROJECT.replace(':id', String(id)),
  );
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioProjectsQueryKey() });
      queryClient.invalidateQueries({ queryKey: portfolioQueryKey() });
    },
  });
}
