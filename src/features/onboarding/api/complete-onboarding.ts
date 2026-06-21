import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

/**
 * Flip the authoritative `onboarded` flag at the end of the setup wizard. PUT
 * /onboarding/:userId/complete (no body; mirrors the RN onboarding finish
 * `markOnboardingComplete`). Once it succeeds, `technician-status` returns
 * `onboarded: true` and the onboarding guard stops redirecting to `/setup`.
 */
export async function completeOnboarding(userId: number): Promise<void> {
  const path = API_ENDPOINTS.ONBOARDING.COMPLETE.replace(':userId', String(userId));
  await apiClient.put<unknown>(path);
}
