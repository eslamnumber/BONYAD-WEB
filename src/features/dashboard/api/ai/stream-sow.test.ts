import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/testing/handlers/server';

import type { WizardStreamEvent } from './parse-sse';
import { streamSow } from './stream-sow';

const SSE = [
  ': stream open',
  '',
  'event: thinking',
  'data: {"message":"جاري التحليل"}',
  '',
  'event: section',
  'data: {"path":"scope","value":{"in_scope":["a"]}}',
  '',
  'event: complete',
  'data: {"response":"تمت","sow":{"scope":{"in_scope":["a"]},"risks":[{"description":"r"}]}}',
  '',
  'event: done',
  'data: {"conversationId":"conv-xyz"}',
  '',
].join('\n');

describe('streamSow', () => {
  it('reads the SSE stream, accumulates the SOW, and forwards events', async () => {
    server.use(
      http.post(
        '*/api/ai/chat/stream',
        () => new HttpResponse(SSE, { headers: { 'Content-Type': 'text/event-stream' } }),
      ),
    );

    const events: WizardStreamEvent[] = [];
    const result = await streamSow({
      message: 'msg',
      conversationId: 'conv-1',
      onEvent: (e) => events.push(e),
    });

    expect(events.map((e) => e.type)).toEqual(['thinking', 'section', 'complete', 'done']);
    expect(result.sow?.scope).toEqual({ in_scope: ['a'] });
    expect(result.sow?.risks).toEqual([{ description: 'r' }]);
    expect(result.conversationId).toBe('conv-xyz');
    expect(result.sectionsCount).toBe(1);
  });

  it('throws when the upstream stream errors (caller falls back to REST)', async () => {
    server.use(http.post('*/api/ai/chat/stream', () => new HttpResponse(null, { status: 502 })));
    await expect(
      streamSow({ message: 'msg', conversationId: 'conv-1', onEvent: () => undefined }),
    ).rejects.toBeTruthy();
  });
});
