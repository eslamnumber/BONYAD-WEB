import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { prewarmGather } from './prewarm';

describe('prewarmGather', () => {
  it('sends the GATHER trigger and seeds history with both turns', async () => {
    let body: Record<string, unknown> | null = null;
    server.use(
      http.post('*/api/ai/chat', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ response: 'أحتاج بعض المعلومات <<WIZARD_STAGE:GATHER>>' });
      }),
    );

    const history = await prewarmGather('conv-1');
    expect(body).toMatchObject({ message: 'أبي أنشئ مشروع' });
    expect(history).toEqual([
      { role: 'user', content: 'أبي أنشئ مشروع' },
      { role: 'assistant', content: 'أحتاج بعض المعلومات' },
    ]);
  });

  it('returns just the trigger turn when the call fails', async () => {
    server.use(http.post('*/api/ai/chat', () => new HttpResponse(null, { status: 500 })));
    const history = await prewarmGather('conv-1');
    expect(history).toEqual([{ role: 'user', content: 'أبي أنشئ مشروع' }]);
  });
});
