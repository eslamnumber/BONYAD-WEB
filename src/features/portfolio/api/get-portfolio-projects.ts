import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  extractProjects,
  isMissingRoute,
  portfolioProjectsQueryKey,
} from '../lib/portfolio-normalize';
import { type PortfolioProject } from '../schemas/portfolio';

/**
 * The technician's past projects (the gallery). Mirrors the iOS `getMyPastProjects`
 * (PortfolioModels.swift:899) — GET /portfolios/projects/my, **404 or a "No static
 * resource" routing miss → []**. A bare array or a `{ projects }`/`{ pastProjects }`
 * envelope both resolve to the list (via {@link extractProjects}). Fetched separately
 * from the portfolio meta because the v2 `/me` payload is lightweight (omits projects).
 */
export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  try {
    const data = await apiClient.get<unknown>(API_ENDPOINTS.PORTFOLIO.PROJECTS);
    return extractProjects(data);
  } catch (err) {
    if (isMissingRoute(err)) return [];
    throw err;
  }
}

export function usePortfolioProjects(enabled = true) {
  return useQuery({
    queryKey: portfolioProjectsQueryKey(),
    queryFn: getPortfolioProjects,
    enabled,
    staleTime: 1000 * 30,
  });
}
