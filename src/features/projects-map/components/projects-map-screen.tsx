'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import { conventionalDirection, type Locale } from '@/types/locale';

import { useMapData } from '../hooks/use-map-data';
import { useNearMe } from '../hooks/use-near-me';
import { type KsaCity } from '../lib/ksa-cities';
import type { ProjectMarker } from '../schemas/project-marker';

import { MapOverlays } from './map-overlays';
import { MapStates } from './map-states';
import { ProjectsMapCanvas } from './projects-map-canvas';

/**
 * Technician projects map — available projects as pins on a Google Map,
 * filterable by city and/or "Near Me" GPS radius. Tap a pin → bottom card →
 * "View & Bid" navigates to the project detail. Reached from the "Discover
 * projects" section of the technician dashboard.
 */
export function ProjectsMapScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const [selectedCity, setSelectedCity] = useState<KsaCity | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectMarker | null>(null);
  const nearMe = useNearMe();
  const { projects, camera, isLoading, isError } = useMapData(nearMe, selectedCity);

  const handleSelectCity = useCallback((city: KsaCity | null) => {
    setSelectedCity((prev) => (prev?.id === city?.id ? null : city));
    setSelectedProject(null);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (selectedProject) {
      router.push(ROUTES.DASHBOARD_PROJECT(String(selectedProject.id)));
    }
  }, [selectedProject, router]);

  if (isLoading) return <MapStates variant="loading" locale={locale} />;
  if (isError) return <MapStates variant="error" locale={locale} />;

  return (
    // Conventional-direction override (LTR in en, RTL in ar) so the overlay controls
    // read naturally on the always-LTR map canvas — without it the screen inherits the
    // app's inverted document map and the chips/badges flow to the wrong side.
    <div
      dir={conventionalDirection(locale)}
      className="relative min-h-0 w-full flex-1 overflow-hidden"
    >
      <ProjectsMapCanvas
        projects={projects}
        selectedId={selectedProject?.id ?? null}
        camera={camera}
        userLocation={nearMe.enabled ? nearMe.coords : null}
        onSelect={setSelectedProject}
      />
      <MapOverlays
        locale={locale}
        count={projects.length}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        nearMe={nearMe}
        selectedProject={selectedProject}
        onDismiss={() => setSelectedProject(null)}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
