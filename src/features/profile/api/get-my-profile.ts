import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { UserProfile } from '../schemas/profile';

export const myProfileQueryKey = () => ['profile', 'mine'] as const;

/**
 * The signed-in user's own profile. Mirrors the RN call site
 * website-bonyad/src/services/ProfileService.ts:399 (`getUserProfile`) — GET
 * /users/profile, no params. Browser calls go through `/api/proxy/*`, which
 * attaches the session token. No response schema (permissive type) per the
 * strict-request / permissive-response rule — see docs/api-and-auth.md.
 */
export async function getMyProfile(): Promise<UserProfile> {
  return apiClient.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE);
}

export function useMyProfile() {
  return useQuery({
    queryKey: myProfileQueryKey(),
    queryFn: getMyProfile,
    staleTime: 1000 * 60,
  });
}
