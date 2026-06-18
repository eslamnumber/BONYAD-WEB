import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { portfolioQueryKey } from '../lib/portfolio-normalize';
import { type UpdatePortfolioRequest, updatePortfolioRequestSchema } from '../schemas/portfolio';

/**
 * Edit the portfolio's basic info (business name / bio / tagline / specialties /
 * years / visibility). Mirrors the iOS `EditPortfolioView` save (EditPortfolioView.swift:235)
 * — PATCH /portfolios/me with a partial body. Strict request; the response is ignored
 * (the query is refetched). Browser calls go through `/api/proxy/*`.
 */
export async function updatePortfolio(input: UpdatePortfolioRequest): Promise<void> {
  const body = updatePortfolioRequestSchema.parse(input);
  await apiClient.patch<unknown>(API_ENDPOINTS.PORTFOLIO.UPDATE, { body });
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdatePortfolioRequest>({
    mutationFn: updatePortfolio,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portfolioQueryKey() }),
  });
}
