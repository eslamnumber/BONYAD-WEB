import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getAdsFeed } from './get-ads-feed';

const AD = {
  id: 21,
  title: 'تشطيبات داخلية احترافية',
  body: 'خدمات تشطيب فاخرة',
  status: 'ACTIVE',
  technicianId: 1,
  technicianName: 'خالد اليوسف',
  serviceNameEn: 'Finishing',
  serviceNameAr: 'التشطيبات',
};

describe('getAdsFeed', () => {
  it('GETs /ads/feed and unwraps the { ads } envelope', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/ads/feed', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ ads: [AD] });
      }),
    );

    const ads = await getAdsFeed();

    expect(new URL(capturedUrl).pathname.endsWith('/ads/feed')).toBe(true);
    expect(ads).toHaveLength(1);
    expect(ads[0]).toMatchObject({ id: 21, technicianName: 'خالد اليوسف', status: 'ACTIVE' });
  });

  it('tolerates a bare array body', async () => {
    server.use(http.get('*/ads/feed', () => HttpResponse.json([AD, { id: 22 }])));
    await expect(getAdsFeed()).resolves.toHaveLength(2);
  });

  it('returns [] for a non-array / non-enveloped body', async () => {
    server.use(http.get('*/ads/feed', () => HttpResponse.json({})));
    await expect(getAdsFeed()).resolves.toEqual([]);
  });

  it('throws ApiError with the status on a 401', async () => {
    server.use(
      http.get('*/ads/feed', () =>
        HttpResponse.json({ messageEn: 'Unauthorized' }, { status: 401 }),
      ),
    );
    const err = await getAdsFeed().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});
