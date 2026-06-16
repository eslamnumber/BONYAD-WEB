import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { UserProfile } from '../schemas/user-profile';

export const userProfileQueryKey = (id: number) => ['users', 'profile', id] as const;

/**
 * A user's public profile. Mirrors the RN call site
 * website-bonyad/src/screens/bids/BidReceivedProjectScreen.tsx:813 — GET
 * /users/:id/profile. Used to enrich each bid card with the technician's rating +
 * avatar. Browser calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function getUserProfile(id: number): Promise<UserProfile> {
  const path = API_ENDPOINTS.USERS.PROFILE_BY_ID.replace(':id', String(id));
  return apiClient.get<UserProfile>(path);
}

/** Rating shown on a bid card: backend `averageRating`, falling back to `rating`. */
export function profileRating(p: UserProfile | null | undefined): number | undefined {
  return p?.averageRating ?? p?.rating ?? undefined;
}

/**
 * The "N completed projects" figure on a bid card. The profile has no dedicated
 * completed-projects count, so it falls back to the review count
 * (`completedProjects ?? totalReviews ?? reviewCount`).
 */
export function profileReviewCount(p: UserProfile | null | undefined): number | undefined {
  return p?.completedProjects ?? p?.totalReviews ?? p?.reviewCount ?? undefined;
}

/** Avatar URL: `profileImage ?? profilePic`. */
export function profileAvatar(p: UserProfile | null | undefined): string | undefined {
  return p?.profileImage ?? p?.profilePic ?? undefined;
}
