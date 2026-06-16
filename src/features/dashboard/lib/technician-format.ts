import { type Technician } from '../schemas/technician';

/** Display name with the same fallback chain the RN picker uses. */
export function technicianName(t: Technician): string {
  return t.name?.trim() || t.userName?.trim() || t.phoneNumber || t.phone || `#${t.id}`;
}

/** Phone for the picker's name/phone search filter. */
export function technicianPhone(t: Technician): string | undefined {
  return t.phoneNumber ?? t.phone ?? undefined;
}

/** Avatar URL: `profileImage ?? avatar`. */
export function technicianAvatar(t: Technician): string | undefined {
  return t.profileImage ?? t.avatar ?? undefined;
}

/** Numeric rating, or undefined when the backend sent null/none. */
export function technicianRating(t: Technician): number | undefined {
  return typeof t.averageRating === 'number' ? t.averageRating : undefined;
}
