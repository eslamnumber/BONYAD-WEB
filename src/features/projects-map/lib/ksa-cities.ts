/**
 * Eight major KSA cities used as quick-filter chips on the projects map.
 * Selecting a city pans the camera to its centre and filters markers to a
 * 60 km haversine radius (mirrors the iOS `ksaCities` constant +
 * `ProjectsMapView.swift:315-324`). Coordinates are the same as the iOS app.
 */
export type KsaCity = {
  id: string;
  nameEn: string;
  nameAr: string;
  lat: number;
  lng: number;
  zoom: number;
};

export const KSA_CITIES: readonly KsaCity[] = [
  { id: 'riyadh', nameEn: 'Riyadh', nameAr: 'الرياض', lat: 24.7136, lng: 46.6753, zoom: 10.0 },
  { id: 'jeddah', nameEn: 'Jeddah', nameAr: 'جدة', lat: 21.4858, lng: 39.1925, zoom: 10.5 },
  { id: 'mecca', nameEn: 'Mecca', nameAr: 'مكة', lat: 21.3891, lng: 39.8579, zoom: 11.0 },
  { id: 'medina', nameEn: 'Medina', nameAr: 'المدينة', lat: 24.5247, lng: 39.5692, zoom: 11.0 },
  { id: 'dammam', nameEn: 'Dammam', nameAr: 'الدمام', lat: 26.4207, lng: 50.0888, zoom: 11.0 },
  { id: 'khobar', nameEn: 'Khobar', nameAr: 'الخبر', lat: 26.2172, lng: 50.1971, zoom: 11.5 },
  { id: 'taif', nameEn: 'Taif', nameAr: 'الطائف', lat: 21.2703, lng: 40.4158, zoom: 11.0 },
  { id: 'tabuk', nameEn: 'Tabuk', nameAr: 'تبوك', lat: 28.3998, lng: 36.5714, zoom: 11.0 },
] as const;

/** Default camera centred on KSA when no city is selected. */
export const KSA_DEFAULT_CAMERA = { lat: 24.0, lng: 45.0, zoom: 5.3 };

/** Haversine radius (km) the city filter uses. */
export const CITY_FILTER_RADIUS_KM = 60;

/** Near-Me radius options (km). */
export const NEAR_ME_RADIOS = [5, 10, 20] as const;
