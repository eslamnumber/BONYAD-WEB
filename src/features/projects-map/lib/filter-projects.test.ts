import { describe, expect, it } from 'vitest';

import type { ProjectMarker } from '../schemas/project-marker';

import { filterProjects } from './filter-projects';
import { KSA_CITIES } from './ksa-cities';

const RIYADH_PROJECT: ProjectMarker = {
  id: 1,
  latitude: 24.75,
  longitude: 46.7,
  description: 'Riyadh project',
};
const JEDDAH_PROJECT: ProjectMarker = {
  id: 2,
  latitude: 21.55,
  longitude: 39.18,
  description: 'Jeddah project',
};
const NO_COORDS: ProjectMarker = { id: 3, latitude: null, longitude: null };

describe('filterProjects', () => {
  it('excludes projects without coordinates', () => {
    const result = filterProjects([RIYADH_PROJECT, NO_COORDS], {
      city: null,
      nearMe: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(1);
  });

  it('filters by city radius (Riyadh keeps Riyadh project, drops Jeddah)', () => {
    const riyadh = KSA_CITIES.find((c) => c.id === 'riyadh')!;
    const result = filterProjects([RIYADH_PROJECT, JEDDAH_PROJECT], {
      city: riyadh,
      nearMe: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(1);
  });

  it('filters by near-me radius (5km from Riyadh centre keeps nearby project)', () => {
    const result = filterProjects([RIYADH_PROJECT, JEDDAH_PROJECT], {
      city: null,
      nearMe: { lat: 24.7136, lng: 46.6753, radiusKm: 10 },
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(1);
  });

  it('combines city + near-me (both filters apply)', () => {
    const riyadh = KSA_CITIES.find((c) => c.id === 'riyadh')!;
    const result = filterProjects([RIYADH_PROJECT, JEDDAH_PROJECT], {
      city: riyadh,
      nearMe: { lat: 24.7136, lng: 46.6753, radiusKm: 10 },
    });
    expect(result).toHaveLength(1);
  });

  it('returns all coordinated projects when no filter is set', () => {
    const result = filterProjects([RIYADH_PROJECT, JEDDAH_PROJECT, NO_COORDS], {
      city: null,
      nearMe: null,
    });
    expect(result).toHaveLength(2);
  });
});
