'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

import type { NearMeState } from '../hooks/use-near-me';
import { KSA_CITIES, type KsaCity } from '../lib/ksa-cities';
import type { ProjectMarker } from '../schemas/project-marker';

import { MapCityChips } from './map-city-chips';
import { MapNearMeBar } from './map-near-me-bar';
import { MapStates } from './map-states';
import { ProjectMapCard } from './project-map-card';

type MapOverlaysProps = {
  locale: Locale;
  count: number;
  selectedCity: KsaCity | null;
  onSelectCity: (city: KsaCity | null) => void;
  nearMe: NearMeState;
  selectedProject: ProjectMarker | null;
  onDismiss: () => void;
  onViewDetails: () => void;
};

/**
 * The pointer-events overlay layer above the map canvas: city chips + near-me
 * bar (top), the live project count (top-end), and either the selected
 * project's card or the legend (bottom).
 */
export function MapOverlays({
  locale,
  count,
  selectedCity,
  onSelectCity,
  nearMe,
  selectedProject,
  onDismiss,
  onViewDetails,
}: MapOverlaysProps) {
  return (
    <>
      <MapTopControls
        locale={locale}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
        nearMe={nearMe}
      />

      <div className="pointer-events-none absolute end-3 top-2 z-10">
        <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-1 text-[11px] font-bold">
          {count}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        {selectedProject ? (
          <ProjectMapCard
            project={selectedProject}
            locale={locale}
            onDismiss={onDismiss}
            onViewDetails={onViewDetails}
          />
        ) : (
          <MapStates variant="legend" locale={locale} count={count} />
        )}
      </div>
    </>
  );
}

/** Leading control in the top bar — closes the full-screen map back to the dashboard. */
function MapCloseButton({ label }: { label: string }) {
  return (
    <Link
      href={ROUTES.DASHBOARD}
      aria-label={label}
      className="text-muted-foreground hover:text-foreground focus-visible:outline-ring flex size-11 shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <CloseIcon className="size-5" aria-hidden />
    </Link>
  );
}

function MapTopControls({
  locale,
  selectedCity,
  onSelectCity,
  nearMe,
}: {
  locale: Locale;
  selectedCity: KsaCity | null;
  onSelectCity: (city: KsaCity | null) => void;
  nearMe: NearMeState;
}) {
  const { t } = useTranslation();
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col">
      <MapCityChips
        cities={KSA_CITIES}
        selectedId={selectedCity?.id ?? null}
        onSelect={onSelectCity}
        locale={locale}
        leading={<MapCloseButton label={t('common.close')} />}
      />
      <MapNearMeBar
        enabled={nearMe.enabled}
        isLocating={nearMe.locating}
        denied={nearMe.denied}
        found={nearMe.coords !== null}
        radius={nearMe.radius}
        onToggle={nearMe.toggle}
        onRadiusChange={nearMe.setRadius}
        locale={locale}
      />
    </div>
  );
}
