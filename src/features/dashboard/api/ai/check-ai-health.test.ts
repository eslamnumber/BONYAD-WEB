import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { checkAiHealth } from './check-ai-health';

describe('checkAiHealth', () => {
  it('returns true only when the route reports status ok', async () => {
    server.use(http.get('*/api/ai/health', () => HttpResponse.json({ status: 'ok' })));
    expect(await checkAiHealth()).toBe(true);
  });

  it('returns false when the route reports down', async () => {
    server.use(http.get('*/api/ai/health', () => HttpResponse.json({ status: 'down' })));
    expect(await checkAiHealth()).toBe(false);
  });
});
