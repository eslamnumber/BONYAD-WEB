import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  normalizeProject,
  portfolioProjectsQueryKey,
  portfolioQueryKey,
} from '../lib/portfolio-normalize';
import { type PortfolioProject, type ProjectInput, projectInputSchema } from '../schemas/portfolio';

/**
 * Add a past project to the gallery. Mirrors the iOS add (PortfolioModels.swift:976,
 * AddPastProjectView.swift:414) — POST /portfolios/projects/add with title /
 * description / dates / `photos[]` (already-uploaded URLs) / clientName / projectValue
 * / location / isPublic. Strict request; returns the new project, normalised.
 */
export async function addProject(input: ProjectInput): Promise<PortfolioProject> {
  const body = projectInputSchema.parse(input);
  const data = await apiClient.post<unknown>(API_ENDPOINTS.PORTFOLIO.ADD_PROJECT, { body });
  return normalizeProject(data);
}

export function useAddProject() {
  const queryClient = useQueryClient();
  return useMutation<PortfolioProject, Error, ProjectInput>({
    mutationFn: addProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioProjectsQueryKey() });
      queryClient.invalidateQueries({ queryKey: portfolioQueryKey() });
    },
  });
}
