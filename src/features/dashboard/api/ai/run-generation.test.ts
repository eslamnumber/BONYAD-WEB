import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import { runGeneration } from './run-generation';

const ANSWERS = {
  project_name: 'تشطيب',
  description: 'كامل',
  location: 'الرياض، النرجس',
  duration_days: '14',
};
const noop = () => undefined;

function streamDown() {
  server.use(http.post('*/api/ai/chat/stream', () => new HttpResponse(null, { status: 502 })));
}

describe('runGeneration', () => {
  it('falls back to REST when the stream is down and returns a non-degraded SOW', async () => {
    streamDown();
    server.use(
      http.post('*/api/ai/chat', () =>
        HttpResponse.json({ ui: { sow: { scope: { in_scope: ['x'] } } } }),
      ),
    );

    const out = await runGeneration({ answers: ANSWERS, conversationId: 'conv-1', onEvent: noop });
    expect(out.degraded).toBe(false);
    expect(out.sow.scope).toEqual({ in_scope: ['x'] });
  });

  it('builds a degraded local SOW when both transports are reachable but empty', async () => {
    server.use(
      http.post(
        '*/api/ai/chat/stream',
        () =>
          new HttpResponse('event: complete\ndata: {"response":"need more","sow":null}\n\n', {
            headers: { 'Content-Type': 'text/event-stream' },
          }),
      ),
      http.post('*/api/ai/chat', () => HttpResponse.json({ response: 'need more' })),
    );

    const out = await runGeneration({ answers: ANSWERS, conversationId: 'conv-1', onEvent: noop });
    expect(out.degraded).toBe(true);
    expect(out.sow.project_metadata?.project_name).toBe('تشطيب');
  });

  it('throws when both the stream and REST fail outright', async () => {
    streamDown();
    server.use(http.post('*/api/ai/chat', () => new HttpResponse(null, { status: 500 })));
    await expect(
      runGeneration({ answers: ANSWERS, conversationId: 'conv-1', onEvent: noop }),
    ).rejects.toThrow();
  });
});
