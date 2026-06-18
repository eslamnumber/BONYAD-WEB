import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  normalizeProject,
  portfolioProjectsQueryKey,
  portfolioQueryKey,
} from '../lib/portfolio-normalize';
import { type PortfolioProject, type ProjectInput, projectInputSchema } from '../schemas/portfolio';

export type UpdateProjectVars = { id: number; input: ProjectInput };

/**
 * Update a past project. Mirrors the iOS edit (PortfolioModels.swift:954,
 * EditPastProjectView.swift:452) — PUT /portfolios/projects/:id. The backend **fully
 * replaces** the record, so `photos` must be the combined kept-URLs + newly-uploaded
 * list (the form assembles it). Strict request; returns the updated project.
 */
export async function updateProject({ id, input }: UpdateProjectVars): Promise<PortfolioProject> {
  const body = projectInputSchema.parse(input);
  const data = await apiClient.put<unknown>(
    API_ENDPOINTS.PORTFOLIO.UPDATE_PROJECT.replace(':id', String(id)),
    { body },
  );
  return normalizeProject(data);
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation<PortfolioProject, Error, UpdateProjectVars>({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioProjectsQueryKey() });
      queryClient.invalidateQueries({ queryKey: portfolioQueryKey() });
    },
  });
}
