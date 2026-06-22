import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getMyAds } from './get-my-ads';

const AD = {
  id: 14,
  title: 'UITest Seed Ad',
  status: 'ACTIVE',
  impressions: 233,
  clicks: 5,
  ctr: 2.15,
  serviceNameEn: 'Design',
  serviceNameAr: 'التصميم',
};

describe('getMyAds', () => {
  it('GETs /ads/mine and unwraps the { ads } envelope', async () => {
    let capturedUrl = '';
    server.use(
      http.get('*/ads/mine', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ ads: [AD] });
      }),
    );

    const ads = await getMyAds();

    expect(new URL(capturedUrl).pathname.endsWith('/ads/mine')).toBe(true);
    expect(ads).toHaveLength(1);
    expect(ads[0]).toMatchObject({ id: 14, status: 'ACTIVE', ctr: 2.15 });
  });

  it('tolerates a bare array body', async () => {
    server.use(http.get('*/ads/mine', () => HttpResponse.json([AD, { id: 13 }])));
    await expect(getMyAds()).resolves.toHaveLength(2);
  });

  it('returns [] for a non-array / non-enveloped body', async () => {
    server.use(http.get('*/ads/mine', () => HttpResponse.json({})));
    await expect(getMyAds()).resolves.toEqual([]);
  });

  it('throws ApiError with the status on a 401', async () => {
    server.use(
      http.get('*/ads/mine', () =>
        HttpResponse.json({ messageEn: 'Unauthorized' }, { status: 401 }),
      ),
    );
    const err = await getMyAds().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});
