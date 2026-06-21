import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

/**
 * Enroll the signed-in technician in a plan during post-approval onboarding. POST
 * /users/subscribe `{ subscriptionCategoryId }` — no payment step (mirrors the RN
 * onboarding finish `subscribeToPlan`). The proxy attaches the session token; a 2xx
 * resolves void, a non-2xx surfaces as `ApiError`.
 */
export async function subscribePlan(subscriptionCategoryId: number): Promise<void> {
  await apiClient.post<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE, {
    body: { subscriptionCategoryId },
  });
}
