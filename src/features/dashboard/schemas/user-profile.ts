/**
 * A user's public profile (GET /users/:id/profile). Permissive response type —
 * only the fields the bid cards read are typed (CLAUDE rule 1). The backend
 * exposes the rating as `averageRating` (RN reads `averageRating ?? rating`), the
 * count as `totalReviews` (`totalReviews ?? reviewCount`), and the avatar as
 * `profileImage ?? profilePic`. NOTE: the profile has no dedicated "completed
 * projects" count — the design's "N completed projects" line is backed by the
 * review count unless the backend later adds `completedProjects`.
 */
export type UserProfile = {
  id?: number;
  name?: string;
  /** Registered email — sent to /signatures as `technicianEmail` (RN reads it off
   *  this same /users/:id/profile response). Backend-controlled; optional. */
  email?: string;
  averageRating?: number;
  rating?: number;
  totalReviews?: number;
  reviewCount?: number;
  completedProjects?: number;
  profileImage?: string;
  profilePic?: string;
};
