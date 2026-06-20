'use client';

import {
  Autocomplete,
  GoogleMap,
  MarkerF,
  useJsApiLoader,
  type Libraries,
} from '@react-google-maps/api';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { DetailLocationIcon } from '@/components/icons';
import { env } from '@/config/env';

const K = 'dashboard.createProject.ai.sow.publish';
const RIYADH = { lat: 24.7136, lng: 46.6753 };
const LIBRARIES: Libraries = ['places'];
const MAP_OPTIONS = { streetViewControl: false, mapTypeControl: false, fullscreenControl: false };

type Picked = (lat: number, lng: number, address?: string) => void;

/**
 * Google Maps wiring (mirrors the legacy RN LocationPicker flow — never its UI):
 * Places autocomplete + a draggable marker + click-to-place, each reverse-geocoded
 * to a formatted address, plus the browser's current location. Returns the picked
 * point + address via `onPick`. The marker mutates lat/lng immediately; the address
 * resolves a beat later from the geocoder. All ref mutation stays inside this hook.
 */
function useGooglePicker(onPick: Picked) {
  const { isLoaded } = useJsApiLoader({
    id: 'bonyad-google-maps',
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocomplete = useRef<google.maps.places.Autocomplete | null>(null);

  const resolve = useCallback(
    (next: google.maps.LatLngLiteral) => {
      onPick(next.lat, next.lng); // move the marker immediately
      mapRef.current?.panTo(next);
      geocoder.current ??= new google.maps.Geocoder();
      void geocoder.current.geocode({ location: next }, (results, status) => {
        if (status === 'OK' && results?.[0])
          onPick(next.lat, next.lng, results[0].formatted_address);
      });
    },
    [onPick],
  );

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) resolve({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    },
    [resolve],
  );

  const onPlaceChanged = useCallback(() => {
    const place = autocomplete.current?.getPlace();
    const loc = place?.geometry?.location;
    if (!loc) return;
    mapRef.current?.panTo({ lat: loc.lat(), lng: loc.lng() });
    onPick(loc.lat(), loc.lng(), place?.formatted_address ?? undefined);
  }, [onPick]);

  const useMyLocation = useCallback(() => {
    navigator.geolocation?.getCurrentPosition((pos) =>
      resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    );
  }, [resolve]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  const onAutocompleteLoad = useCallback((ac: google.maps.places.Autocomplete) => {
    autocomplete.current = ac;
  }, []);

  return { isLoaded, onMapClick, onPlaceChanged, useMyLocation, onMapLoad, onAutocompleteLoad };
}

type Picker = ReturnType<typeof useGooglePicker>;

/** Places autocomplete input + a "use my location" button. */
function MapSearchBar({ picker, t }: { picker: Picker; t: (key: string) => string }) {
  return (
    <div className="flex items-center gap-2">
      <Autocomplete
        className="flex-1"
        onLoad={picker.onAutocompleteLoad}
        onPlaceChanged={picker.onPlaceChanged}
      >
        <input
          type="text"
          aria-label={t(`${K}.searchLabel`)}
          placeholder={t(`${K}.searchPlaceholder`)}
          className="border-border/70 bg-card/80 text-foreground placeholder:text-muted-foreground focus-visible:border-job-accent/60 h-11 w-full rounded-xl border px-3 text-start text-sm outline-none"
        />
      </Autocomplete>
      <button
        type="button"
        onClick={picker.useMyLocation}
        aria-label={t(`${K}.useLocation`)}
        className="border-border/70 bg-card/80 text-job-accent hover:bg-accent/40 focus-visible:outline-ring flex size-11 shrink-0 items-center justify-center rounded-xl border focus-visible:outline-2"
      >
        <DetailLocationIcon className="size-5" aria-hidden />
      </button>
    </div>
  );
}

export default function AddressMap({
  lat,
  lng,
  onPick,
}: {
  lat?: number;
  lng?: number;
  onPick: Picked;
}) {
  const { t } = useTranslation();
  const picker = useGooglePicker(onPick);
  const hasPin = typeof lat === 'number' && typeof lng === 'number';
  const center = hasPin ? { lat: lat as number, lng: lng as number } : RIYADH;

  if (!picker.isLoaded) {
    return (
      <div className="border-border/60 bg-muted/40 h-64 w-full animate-pulse rounded-2xl border" />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <MapSearchBar picker={picker} t={t} />
      <div className="border-border/60 h-64 w-full overflow-hidden rounded-2xl border">
        <GoogleMap
          mapContainerClassName="size-full"
          center={center}
          zoom={hasPin ? 15 : 11}
          onLoad={picker.onMapLoad}
          onClick={picker.onMapClick}
          options={MAP_OPTIONS}
        >
          <MarkerF position={center} draggable onDragEnd={picker.onMapClick} />
        </GoogleMap>
      </div>
    </div>
  );
}
