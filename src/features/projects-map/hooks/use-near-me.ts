'use client';

import { useCallback, useState } from 'react';

export type NearMeState = {
  enabled: boolean;
  coords: { lat: number; lng: number } | null;
  denied: boolean;
  locating: boolean;
  radius: number;
  toggle: () => void;
  setRadius: (km: number) => void;
};

/**
 * Browser Geolocation wrapper for the "Near Me" map filter. Requests
 * `navigator.geolocation.getCurrentPosition` on toggle-on; tracks the denied /
 * locating states. Mirrors the iOS `ProjectMapLocationManager`
 * (`ProjectsMapView.swift:50`). The radius is kept in component state so the
 * chips (5/10/20 km) drive the filter without a re-fetch — the filtering is
 * client-side via haversine.
 */
export function useNearMe(): NearMeState {
  const [enabled, setEnabled] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [denied, setDenied] = useState(false);
  const [locating, setLocating] = useState(false);
  const [radius, setRadius] = useState(10);

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setDenied(true);
      return;
    }
    setLocating(true);
    setDenied(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setDenied(true);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      if (prev) {
        return false;
      }
      request();
      return true;
    });
  }, [request]);

  return { enabled, coords, denied, locating, radius, toggle, setRadius };
}
