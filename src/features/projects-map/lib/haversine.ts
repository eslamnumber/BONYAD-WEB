/**
 * Haversine distance in kilometres between two lat/lng points. Used by the
 * projects-map to filter markers by city radius (60 km) and Near-Me radius
 * (5/10/20 km). Mirrors the iOS `haversineKm` helper
 * (`ProjectsMapView.swift:39`).
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
