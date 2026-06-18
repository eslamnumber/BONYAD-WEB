import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { normalizePortfolio, portfolioQueryKey } from '../lib/portfolio-normalize';
import {
  type CreatePortfolioRequest,
  createPortfolioRequestSchema,
  type Portfolio,
} from '../schemas/portfolio';

/**
 * Create the technician's portfolio. Mirrors the iOS `createPortfolio`
 * (PortfolioModels.swift:771) — POST /portfolios/create with business info +
 * specialties + `isPublic`. The request is zod-validated (CLAUDE rule 1); the
 * response is the new `Portfolio`, normalised.
 */
export async function createPortfolio(input: CreatePortfolioRequest): Promise<Portfolio> {
  const body = createPortfolioRequestSchema.parse(input);
  const data = await apiClient.post<unknown>(API_ENDPOINTS.PORTFOLIO.CREATE, { body });
  return normalizePortfolio(data);
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation<Portfolio, Error, CreatePortfolioRequest>({
    mutationFn: createPortfolio,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portfolioQueryKey() }),
  });
}
