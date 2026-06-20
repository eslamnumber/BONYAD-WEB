import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { approveTermsRequestSchema } from '../schemas/terms.schema';

/**
 * Record the user's agreement to a specific Terms version
 * (`POST /users/terms/approve`, Bearer-auth). Called **server-side** from the
 * verify-otp route with the freshly-issued token — mirrors the iOS
 * `OTPView.approveTerms(termsId:token:)`. 2xx ⇒ success even when the body omits
 * `success`. The caller treats failure as non-fatal (the user already
 * authenticated), so this only throws for the caller to swallow / log.
 */
export async function approveTerms(
  termsId: number,
  token: string,
  baseUrl?: string,
): Promise<void> {
  const body = approveTermsRequestSchema.parse({ termsId });
  await apiClient.post<unknown>(API_ENDPOINTS.TERMS.APPROVE, { body, token, baseUrl });
}
