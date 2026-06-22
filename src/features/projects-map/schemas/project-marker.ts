import { z } from 'zod';

/**
 * Permissive response type for a project marker on the technician's map feed
 * (rule 1: never strict-parse a backend response). Every field beyond `id` is
 * optional so a sparse backend row never fails the decode — it just renders a
 * pin with less metadata. Mirrors the iOS `TechnicianProject` struct
 * (`TechnicianProjectService.swift:61`) field-for-field.
 */
export const projectMarkerSchema = z.object({
  id: z.number(),
  userId: z.number().optional(),
  assignedTechnicianId: z.number().nullable().optional(),
  serviceId: z.number().optional(),
  serviceNameEn: z.string().optional(),
  serviceNameAr: z.string().optional(),
  description: z.string().optional(),
  budget: z.number().nullable().optional(),
  budgetUnspecified: z.boolean().nullable().optional(),
  address: z.string().nullable().optional(),
  /** `null` or `0` means "no coordinates" — the marker is skipped. */
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  regionId: z.number().nullable().optional(),
  regionNameEn: z.string().nullable().optional(),
  regionNameAr: z.string().nullable().optional(),
  status: z.string().optional(),
  type: z.string().nullable().optional(),
  bidderCount: z.number().nullable().optional(),
  bidsCloseAt: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  assignedTechnicianName: z.string().nullable().optional(),
  assignedTechnicianPhone: z.string().nullable().optional(),
  assignedTechnicianRating: z.number().nullable().optional(),
});

export type ProjectMarker = z.infer<typeof projectMarkerSchema>;

/**
 * Decode the response from `/projects/technician/suggestions` or
 * `/projects/near-me` into a `ProjectMarker[]`. The backend may return a bare
 * array or a wrapped `{ projects: [...] }` envelope — both are handled.
 */
export function extractProjectMarkers(data: unknown): ProjectMarker[] {
  if (!data) return [];
  const list = Array.isArray(data) ? data : ((data as { projects?: unknown[] })?.projects ?? []);
  if (!Array.isArray(list)) return [];
  return list
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => projectMarkerSchema.parse(item));
}

/** True when the project has non-zero lat/lng (i.e., it can be placed on the map). */
export function hasCoordinates(p: ProjectMarker): boolean {
  return (
    typeof p.latitude === 'number' &&
    typeof p.longitude === 'number' &&
    p.latitude !== 0 &&
    p.longitude !== 0
  );
}
