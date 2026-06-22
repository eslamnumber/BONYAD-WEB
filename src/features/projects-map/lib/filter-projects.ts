import { hasCoordinates, type ProjectMarker } from '../schemas/project-marker';

import { haversineKm } from './haversine';
import { CITY_FILTER_RADIUS_KM, type KsaCity } from './ksa-cities';

export type MapFilter = {
  /** Selected city chip, or `null` for "All KSA". */
  city: KsaCity | null;
  /** Near-Me toggle state — `null` when off, coords + radius when on. */
  nearMe: { lat: number; lng: number; radiusKm: number } | null;
};

/**
 * Apply the two client-side filters the map uses:
 *   1. **City** — keep only projects within {@link CITY_FILTER_RADIUS_KM} km of
 *      the selected city centre (haversine).
 *   2. **Near-Me** — keep only projects within the user-chosen radius.
 * Projects without coordinates are always excluded — they can't be placed on
 * the map. Mirrors the iOS `filteredProjects` computed property
 * (`ProjectsMapView.swift:315-335`).
 */
export function filterProjects(projects: ProjectMarker[], filter: MapFilter): ProjectMarker[] {
  let result = projects.filter(hasCoordinates);

  if (filter.city) {
    const { lat, lng } = filter.city;
    result = result.filter(
      (p) => haversineKm(lat, lng, p.latitude!, p.longitude!) < CITY_FILTER_RADIUS_KM,
    );
  }

  if (filter.nearMe) {
    const { lat, lng, radiusKm } = filter.nearMe;
    result = result.filter((p) => haversineKm(lat, lng, p.latitude!, p.longitude!) <= radiusKm);
  }

  return result;
}
