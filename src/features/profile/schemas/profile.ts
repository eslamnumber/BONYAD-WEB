/**
 * The signed-in user's own profile, from `GET /users/profile` (RN `USER.PROFILE`,
 * website-bonyad/src/services/ProfileService.ts:399 `getUserProfile`).
 *
 * Response-only shape, so it is a permissive TS `type` — NOT a strict zod schema
 * (see docs/api-and-auth.md §Schema strategy). The backend is shared with the RN
 * app and may add fields or send a value we have not seen; a strict response
 * schema would surface that as a misleading "Something went wrong". Every field
 * is optional except `id`; consumers narrow at the call site.
 *
 * Field names mirror the RN call site verbatim: `profileImage` (not `avatar` —
 * RN normalises `avatar` onto `profileImage`), `type_label` for the profession,
 * `averageRating` / `totalReviews` for the rating block, and the Wathq company
 * trio `isCompany` / `companyName` / `crNumber`.
 */
export type UserProfile = {
  id: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  profileImage?: string;
  /** Profession / specialty label shown on a technician's identity card. */
  type_label?: string;
  averageRating?: number;
  totalReviews?: number;
  /** Company (Wathq-verified) account fields — present only when `isCompany`. */
  isCompany?: boolean;
  companyName?: string;
  crNumber?: string;
  nationalId?: string;
  bio?: string;
  address?: string;
  /** Technician fields read by the Edit-profile form (iOS `years` + `regions`). */
  years?: number;
  regions?: { id?: number; nameEn?: string; nameAr?: string }[];
};
