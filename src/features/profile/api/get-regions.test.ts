import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { getRegions } from './get-regions';

describe('getRegions', () => {
  it('returns a bare array as-is', async () => {
    server.use(
      http.get('*/regions', () =>
        HttpResponse.json([
          { id: 1, nameEn: 'Riyadh' },
          { id: 2, nameEn: 'Jeddah' },
        ]),
      ),
    );
    const regions = await getRegions();
    expect(regions).toHaveLength(2);
    expect(regions[0]).toEqual({ id: 1, nameEn: 'Riyadh' });
  });

  it('unwraps a { data } envelope (the iOS /zones shape)', async () => {
    server.use(
      http.get('*/regions', () => HttpResponse.json({ data: [{ id: 5, nameAr: 'الرياض' }] })),
    );
    const regions = await getRegions();
    expect(regions).toEqual([{ id: 5, nameAr: 'الرياض' }]);
  });

  it('unwraps a { content } envelope', async () => {
    server.use(http.get('*/regions', () => HttpResponse.json({ content: [{ id: 9 }] })));
    expect(await getRegions()).toEqual([{ id: 9 }]);
  });

  it('yields [] for an unexpected shape', async () => {
    server.use(http.get('*/regions', () => HttpResponse.json({ unexpected: true })));
    expect(await getRegions()).toEqual([]);
  });
});
