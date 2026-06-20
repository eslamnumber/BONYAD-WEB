import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { saveAiDraft } from './save-ai-draft';

describe('saveAiDraft', () => {
  it('PUTs the SOW + conversation id with a normalised tier', async () => {
    let body: Record<string, unknown> | null = null;
    server.use(
      http.put('*/v1/ai/draft', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ok: true });
      }),
    );

    await saveAiDraft({ project_metadata: { quality_tier: 'luxury' } }, 'conv-1');

    expect(body).toMatchObject({ flow: 'SOW', chatbotConversationId: 'conv-1', qualityTier: 'A+' });
  });

  it('swallows errors (fire-and-forget)', async () => {
    server.use(http.put('*/v1/ai/draft', () => new HttpResponse(null, { status: 500 })));
    await expect(saveAiDraft({}, 'conv-2')).resolves.toBeUndefined();
  });
});
