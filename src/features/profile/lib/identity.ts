import type { AuthUser } from '@/types/auth';

import type { UserProfile } from '../schemas/profile';

export type ProfileIdentity = {
  name?: string;
  profileImage?: string;
  isTechnician: boolean;
  /** Profession / specialty (`type_label`) — technician only. */
  profession?: string;
  rating?: number;
  reviews?: number;
  isCompany?: boolean;
};

/**
 * Merge the live profile fetch with the hydrated session user into the fields the
 * identity card needs. Profile wins; the session is the instant fallback so the
 * card never blanks while `/users/profile` is in flight. Role is a bare backend
 * string (may be ADMIN etc.), so anything that is not USER is treated as a
 * technician for the extra rows — mirroring the dashboard page's narrowing.
 */
export function resolveProfileIdentity(
  profile: UserProfile | undefined,
  user: AuthUser | null,
): ProfileIdentity {
  const p: Partial<UserProfile> = profile ?? {};
  const u: Partial<AuthUser> = user ?? {};
  const role = (p.role ?? u.role ?? '').toUpperCase();
  return {
    name: p.name ?? u.name,
    profileImage: p.profileImage ?? u.profileImage,
    isTechnician: role !== '' && role !== 'USER',
    profession: p.type_label,
    rating: p.averageRating,
    reviews: p.totalReviews,
    isCompany: p.isCompany,
  };
}
