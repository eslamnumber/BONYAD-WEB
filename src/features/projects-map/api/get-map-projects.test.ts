import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getNearbyProjects, getSuggestedProjects } from './get-map-projects';

const SAMPLE = {
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

describe('getSuggestedProjects', () => {
  it('decodes a { projects: [...] } envelope', async () => {
    server.use(
      http.get('*/projects/technician/suggestions', () =>
        HttpResponse.json({ projects: [SAMPLE], count: 1 }),
      ),
    );
    const list = await getSuggestedProjects();
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(1);
    expect(list[0]?.latitude).toBe(24.75);
  });

  it('decodes a bare array', async () => {
    server.use(
      http.get('*/projects/technician/suggestions', () =>
        HttpResponse.json([SAMPLE, { ...SAMPLE, id: 2 }]),
      ),
    );
    const list = await getSuggestedProjects();
    expect(list).toHaveLength(2);
  });

  it('returns [] on empty response', async () => {
    server.use(
      http.get('*/projects/technician/suggestions', () => HttpResponse.json({ projects: [] })),
    );
    expect(await getSuggestedProjects()).toEqual([]);
  });

  it('throws ApiError on 401', async () => {
    server.use(
      http.get('*/projects/technician/suggestions', () => HttpResponse.json({}, { status: 401 })),
    );
    const err = await getSuggestedProjects().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
  });
});

describe('getNearbyProjects', () => {
  it('sends lat/lng as query params and decodes the response', async () => {
    let receivedUrl = '';
    server.use(
      http.get('*/projects/near-me', ({ request }) => {
        receivedUrl = request.url;
        return HttpResponse.json({ projects: [SAMPLE] });
      }),
    );
    const list = await getNearbyProjects(24.71, 46.67);
    expect(list).toHaveLength(1);
    expect(receivedUrl).toContain('latitude=24.71');
    expect(receivedUrl).toContain('longitude=46.67');
  });
});
