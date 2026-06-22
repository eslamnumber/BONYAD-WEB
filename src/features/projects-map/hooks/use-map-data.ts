'use client';

import { useMemo } from 'react';

import { useNearbyProjects, useSuggestedProjects } from '../api/get-map-projects';
import { filterProjects, type MapFilter } from '../lib/filter-projects';
import { KSA_DEFAULT_CAMERA, type KsaCity } from '../lib/ksa-cities';
import type { ProjectMarker } from '../schemas/project-marker';

import type { NearMeState } from './use-near-me';

export type MapCamera = { lat: number; lng: number; zoom: number };

export type MapData = {
  projects: ProjectMarker[];
  camera: MapCamera;
  isLoading: boolean;
  isError: boolean;
};

/**
 * Resolves the technician's map feed (suggested vs. near-me), applies the
 * client-side city / near-me filters, and derives the camera target — keeping
 * {@link ProjectsMapScreen} a thin view. The disabled query stays idle, so only
 * one of the two endpoints is in flight at a time.
 */
export function useMapData(nearMe: NearMeState, selectedCity: KsaCity | null): MapData {
  const { enabled, coords, radius } = nearMe;
  const suggested = useSuggestedProjects(!enabled);
  const nearby = useNearbyProjects(enabled && coords ? coords : null, enabled);
  const active = enabled ? nearby : suggested;

  const filter: MapFilter = useMemo(
    () => ({
      city: selectedCity,
      nearMe: enabled && coords ? { lat: coords.lat, lng: coords.lng, radiusKm: radius } : null,
    }),
    [selectedCity, enabled, coords, radius],
  );

  const projects = useMemo(() => filterProjects(active.data ?? [], filter), [active.data, filter]);

  const camera = useMemo<MapCamera>(
    () => deriveCamera(enabled, coords, selectedCity),
    [enabled, coords, selectedCity],
  );

  return { projects, camera, isLoading: active.isLoading, isError: active.isError };
}

function deriveCamera(
  enabled: boolean,
  coords: { lat: number; lng: number } | null,
  selectedCity: KsaCity | null,
): MapCamera {
  if (enabled && coords) {
    return { lat: coords.lat, lng: coords.lng, zoom: 12.5 };
  }
  if (selectedCity) {
    return { lat: selectedCity.lat, lng: selectedCity.lng, zoom: selectedCity.zoom };
  }
  return KSA_DEFAULT_CAMERA;
}
