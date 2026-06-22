import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { getHireableTechnicians } from './get-hireable-technicians';

describe('getHireableTechnicians', () => {
  it('GETs /projects/hireable-technicians and returns the array', async () => {
    server.use(
      http.get('*/projects/hireable-technicians', () =>
        HttpResponse.json([{ id: 444, name: 'ahmed farahat tech', phoneNumber: '539909791' }]),
      ),
    );
    const list = await getHireableTechnicians();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 444, name: 'ahmed farahat tech' });
  });

  it('tolerates a { technicians } envelope', async () => {
    server.use(
      http.get('*/projects/hireable-technicians', () =>
        HttpResponse.json({ technicians: [{ id: 1 }, { id: 2 }] }),
      ),
    );
    await expect(getHireableTechnicians()).resolves.toHaveLength(2);
  });

  it('returns [] for a non-array body', async () => {
    server.use(http.get('*/projects/hireable-technicians', () => HttpResponse.json({})));
    await expect(getHireableTechnicians()).resolves.toEqual([]);
  });

  it('throws ApiError on a 401', async () => {
    server.use(
      http.get('*/projects/hireable-technicians', () =>
        HttpResponse.json({ messageEn: 'Unauthorized' }, { status: 401 }),
      ),
    );
    const err = await getHireableTechnicians().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
  });
});
