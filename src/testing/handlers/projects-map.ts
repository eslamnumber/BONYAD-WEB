import { http, HttpResponse } from 'msw';

/** A project with coordinates near Riyadh that renders as a map marker. */
const RIYADH_PROJECT = {
  id: 1,
  userId: 10,
  serviceId: 5,
  serviceNameEn: 'Finishing',
  serviceNameAr: 'تشطيب',
  description: 'Villa finishing — Al Narjis',
  budget: 180000,
  budgetUnspecified: false,
  address: 'Riyadh, Al Narjis',
  latitude: 24.75,
  longitude: 46.7,
  regionId: 1,
  regionNameEn: 'Riyadh',
  regionNameAr: 'الرياض',
  status: 'PENDING',
  bidderCount: 3,
};

/** A project near Jeddah for testing city filtering. */
const JEDDAH_PROJECT = {
  ...RIYADH_PROJECT,
  id: 2,
  description: 'Apartment renovation — Al Rawdah',
  address: 'Jeddah, Al Rawdah',
  latitude: 21.55,
  longitude: 39.18,
  budget: 95000,
};

/** A project with no coordinates — must be filtered out of markers. */
const NO_COORDS_PROJECT = {
  ...RIYADH_PROJECT,
  id: 3,
  latitude: null,
  longitude: null,
};

/**
 * Projects-map handlers. Default models a technician who sees suggested projects
 * across KSA. Tests override per case via `server.use(...)`.
 */
export const projectsMapHandlers = [
  http.get('*/projects/technician/suggestions', () =>
    HttpResponse.json({
      projects: [RIYADH_PROJECT, JEDDAH_PROJECT, NO_COORDS_PROJECT],
      count: 3,
    }),
  ),
  http.get('*/projects/near-me', ({ request }) => {
    const url = new URL(request.url);
    const lat = Number(url.searchParams.get('latitude') ?? 0);
    const lng = Number(url.searchParams.get('longitude') ?? 0);
    // Simulate proximity: return only projects within ~100km of the given coords.
    const all = [RIYADH_PROJECT, JEDDAH_PROJECT];
    const nearby = all.filter((p) => {
      const dx = (p.latitude - lat) * 111;
      const dy = (p.longitude - lng) * 111;
      return Math.sqrt(dx * dx + dy * dy) < 100;
    });
    return HttpResponse.json({ projects: nearby, count: nearby.length });
  }),
];
