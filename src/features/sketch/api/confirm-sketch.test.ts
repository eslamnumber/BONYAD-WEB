import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { confirmSketch } from './confirm-sketch';

describe('confirmSketch', () => {
  it('posts to the confirm path and returns the SPJob with a populated scene', async () => {
    let calledPath = '';
    server.use(
      http.post('*/api/sketch/:jobId/confirm', ({ request }) => {
        calledPath = new URL(request.url).pathname;
        return HttpResponse.json({
          id: 'skt_5',
          status: 'ready',
          scene: {
            rooms: [
              {
                id: 'g_r1',
                polygon: [
                  [0, 0],
                  [4, 0],
                  [4, 4],
                  [0, 4],
                ],
              },
            ],
            openings: [],
            placements: [
              { room_id: 'g_r1', placements: [{ asset: 'sofa', x: 2, y: 3, w: 2, d: 1, h: 0.8 }] },
            ],
            wall_height_m: 3,
            wall_thickness_m: 0.2,
          },
        });
      }),
    );

    const job = await confirmSketch('skt_5');

    expect(calledPath).toBe('/api/sketch/skt_5/confirm');
    expect(job.status).toBe('ready');
    expect(job.scene?.wall_height_m).toBe(3);
    expect(job.scene?.placements?.[0]?.placements?.[0]?.asset).toBe('sofa');
  });

  it('surfaces a 4xx as ApiError', async () => {
    server.use(
      http.post('*/api/sketch/:jobId/confirm', () =>
        HttpResponse.json({ error: 'no active variant' }, { status: 409 }),
      ),
    );
    await expect(confirmSketch('skt_5')).rejects.toBeInstanceOf(ApiError);
  });
});
