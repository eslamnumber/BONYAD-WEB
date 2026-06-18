import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  isMissingRoute,
  normalizePortfolio,
  portfolioQueryKey,
  unwrapPortfolioEntity,
} from '../lib/portfolio-normalize';
import { type Portfolio } from '../schemas/portfolio';

/** Fetch + normalise one portfolio endpoint, or null when there genuinely isn't one. */
async function fetchPortfolioAt(path: string): Promise<Portfolio | null> {
  const data = await apiClient.get<unknown>(path);
  const entity = unwrapPortfolioEntity(data);
  return entity ? normalizePortfolio(entity) : null;
}

/**
 * The signed-in technician's portfolio, or `null` when none exists yet. Mirrors the
 * iOS `PortfolioService.checkPortfolioExists` (PortfolioModels.swift:677): try the v2
 * `/portfolios/me` first, then fall back to legacy `/portfolios/my`. A 404 **or a
 * "No static resource" routing miss** (this backend 500s on `/my`) means "no portfolio
 * yet" → the create panel, not an error. Browser calls go through `/api/proxy/*`,
 * which attaches the session token. The body is normalised by {@link normalizePortfolio}.
 */
export async function getPortfolio(): Promise<Portfolio | null> {
  try {
    const me = await fetchPortfolioAt(API_ENDPOINTS.PORTFOLIO.ME);
    if (me) return me;
  } catch (err) {
    if (!isMissingRoute(err)) throw err;
  }

  try {
    return await fetchPortfolioAt(API_ENDPOINTS.PORTFOLIO.MY);
  } catch (err) {
    if (isMissingRoute(err)) return null;
    throw err;
  }
}

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioQueryKey(),
    queryFn: getPortfolio,
    staleTime: 1000 * 30,
  });
}
