import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-client';
import { server } from '@/testing/handlers/server';

import { refineSow } from './refine-sow';

const SOW = { project_metadata: { quality_tier: 'A' }, commercials: { currency: 'SAR' } };

describe('refineSow', () => {
  it('sends the full SOW and returns the updated SOW + confirmation', async () => {
    let body: Record<string, unknown> | null = null;
    server.use(
      http.post('*/api/ai/refine', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          sow: { project_metadata: { quality_tier: 'A+' } },
          response: 'رفعت الجودة',
        });
      }),
    );

    const result = await refineSow({ message: '  اجعلها A+  ', sow: SOW, conversationId: 'c-1' });

    expect(body).toMatchObject({
      message: 'اجعلها A+',
      sow: SOW,
      conversationId: 'c-1',
      language: 'ar',
      projectId: null,
      token: null,
    });
    expect(result.sow.project_metadata?.quality_tier).toBe('A+');
    expect(result.response).toBe('رفعت الجودة');
  });

  it('keeps the prior SOW when the reply omits one', async () => {
    server.use(http.post('*/api/ai/refine', () => HttpResponse.json({ response: 'لا تغيير' })));
    const result = await refineSow({ message: 'x', sow: SOW, conversationId: 'c-1' });
    expect(result.sow).toBe(SOW);
  });

  it('throws ApiError on a 400', async () => {
    server.use(
      http.post('*/api/ai/refine', () =>
        HttpResponse.json({ messageEn: 'no sow' }, { status: 400 }),
      ),
    );
    const err = await refineSow({ message: 'x', sow: SOW, conversationId: 'c-1' }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(400);
  });
});
