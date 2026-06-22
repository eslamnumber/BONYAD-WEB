'use client';

import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { env } from '@/config/env';

import type { ProjectMarker } from '../schemas/project-marker';

const MAP_OPTIONS = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  rotateControl: false,
  tilt: 0,
} as const;

/**
 * Teardrop map-marker silhouette (Material pin). The tip sits at (12, 24), so the
 * icon `anchor` is `Point(12, 24)` — the pin points at the exact coordinate.
 */
const PROJECT_PIN_PATH = 'M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8z';

type Camera = { lat: number; lng: number; zoom: number };

type CanvasProps = {
  projects: ProjectMarker[];
  selectedId: number | null;
  camera: Camera;
  userLocation: { lat: number; lng: number } | null;
  onSelect: (project: ProjectMarker | null) => void;
};

/** Blue brand dot marking the technician's own GPS position. */
function userDotIcon(): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: '#0078E0',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 3,
  };
}

/** Brand teardrop pin per project; the selected pin renders larger. */
function projectPinIcon(selected: boolean): google.maps.Symbol {
  return {
    path: PROJECT_PIN_PATH,
    fillColor: '#0055CC',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 1.5,
    scale: selected ? 1.9 : 1.4,
    anchor: new google.maps.Point(12, 24),
  };
}

/**
 * Google Maps canvas for the projects map. Renders one teardrop pin per
 * coordinated project, plus the user's location dot when "Near Me" is active.
 * Mirrors the iOS `ProjectsGoogleMap` (`ProjectsMapView.swift:106`).
 */
export function ProjectsMapCanvas({
  projects,
  selectedId,
  camera,
  userLocation,
  onSelect,
}: CanvasProps) {
  const { t } = useTranslation();
  const { isLoaded } = useJsApiLoader({
    id: 'bonyad-projects-map',
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const handleClick = useCallback((project: ProjectMarker) => onSelect(project), [onSelect]);

  if (!isLoaded) {
    return (
      <div className="bg-muted flex h-full w-full items-center justify-center">
        <span className="text-muted-foreground text-sm">{t('projectsMap.loadingMap')}</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={{ lat: camera.lat, lng: camera.lng }}
      zoom={camera.zoom}
      options={MAP_OPTIONS}
      onClick={() => onSelect(null)}
    >
      {userLocation && <MarkerF position={userLocation} icon={userDotIcon()} />}
      {projects.map((p) => (
        <MarkerF
          key={p.id}
          position={{ lat: p.latitude!, lng: p.longitude! }}
          icon={projectPinIcon(p.id === selectedId)}
          zIndex={p.id === selectedId ? 10 : 1}
          onClick={() => handleClick(p)}
        />
      ))}
    </GoogleMap>
  );
}
