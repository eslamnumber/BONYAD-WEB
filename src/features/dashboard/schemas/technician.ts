/**
 * A technician/freelancer row in the direct-assignment picker
 * (GET /users/technicians). Mirrors the fields the RN picker reads
 * (website-bonyad/src/components/projects/TechnicianPickerModal.tsx +
 * .../creation/hooks/useNewProjectView.ts).
 *
 * Permissive — the backend returns an untyped array, so every field except `id`
 * is optional and the display name / avatar / rating are resolved through
 * fallbacks. `averageRating` may be null for a technician with no reviews yet.
 */
export type Technician = {
  id: number;
  name?: string;
  userName?: string;
  phoneNumber?: string;
  phone?: string;
  averageRating?: number | null;
  totalReviews?: number;
  profileImage?: string | null;
  avatar?: string | null;
  status?: string;
};
