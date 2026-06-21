import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { selectSketchVariant } from './select-variant';

describe('selectSketchVariant', () => {
  it('posts { variant_index } and returns the SPJob with active_variant pinned', async () => {
    let captured: Record<string, unknown> | null = null;
    let calledPath = '';
    server.use(
      http.post('*/api/sketch/:jobId/select-variant', async ({ request }) => {
        calledPath = new URL(request.url).pathname;
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'skt_9', status: 'parsed', active_variant: 2 });
      }),
    );

    const job = await selectSketchVariant({ jobId: 'skt_9', variantIndex: 2 });

    expect(calledPath).toBe('/api/sketch/skt_9/select-variant');
    expect(captured).toEqual({ variant_index: 2 });
    expect(job.active_variant).toBe(2);
  });

  it('surfaces a 4xx as ApiError', async () => {
    server.use(
      http.post('*/api/sketch/:jobId/select-variant', () =>
        HttpResponse.json({ error: 'invalid variant' }, { status: 400 }),
      ),
    );
    await expect(selectSketchVariant({ jobId: 'skt_9', variantIndex: 99 })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
