import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { isPortfolioAlreadyExists, PortfolioAlreadyExistsError } from '../lib/portfolio-error';
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
 *
 * **Duplicate recovery:** if the backend reports "Portfolio already exists" (status
 * 400/409, message contains "already exists"), this throws a typed
 * {@link PortfolioAlreadyExistsError} instead of a generic {@link ApiError}. The
 * {@link useCreatePortfolio} hook reacts by invalidating the portfolio query — the
 * `/me` normaliser re-resolves the existing record (see `unwrapPortfolioEntity`'s
 * builder-draft handling) and the screen flips from the create panel to the manager
 * view, instead of deadlocking the user on "create failed" while `/me` keeps reporting
 * "no portfolio". This closes the GET-says-none / POST-says-duplicate loop.
 */
export async function createPortfolio(input: CreatePortfolioRequest): Promise<Portfolio> {
  const body = createPortfolioRequestSchema.parse(input);
  try {
    const data = await apiClient.post<unknown>(API_ENDPOINTS.PORTFOLIO.CREATE, { body });
    return normalizePortfolio(data);
  } catch (err) {
    if (isPortfolioAlreadyExists(err)) throw new PortfolioAlreadyExistsError(err);
    throw err;
  }
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation<Portfolio, Error, CreatePortfolioRequest>({
    mutationFn: createPortfolio,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portfolioQueryKey() }),
    onError: (err) => {
      // Duplicate → trigger a refetch of /me. The fixed normaliser now recognises the
      // builder-draft shape, so usePortfolio resolves to the existing record and the
      // screen swaps from CreatePortfolioPanel → PortfolioManager on the next render.
      if (err instanceof PortfolioAlreadyExistsError) {
        void queryClient.invalidateQueries({ queryKey: portfolioQueryKey() });
      }
    },
  });
}
