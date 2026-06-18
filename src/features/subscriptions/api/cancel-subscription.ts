import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { subscriptionQueryKey } from './get-subscription';
import { subscriptionBidsQueryKey } from './get-subscription-bids';

/**
 * Cancel the current subscription. Mirrors the RN call site
 * website-bonyad/src/components/profile/SubscriptionCard.tsx:228 — DELETE
 * /users/subscription (no body). Browser calls go through `/api/proxy/*`, which
 * attaches the session token. A non-2xx surfaces as an `ApiError`; a 2xx (often an
 * empty 204) resolves void.
 */
export async function cancelSubscription(): Promise<void> {
  await apiClient.delete<unknown>(API_ENDPOINTS.USERS.SUBSCRIPTION);
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKey() });
      queryClient.invalidateQueries({ queryKey: subscriptionBidsQueryKey() });
    },
  });
}
