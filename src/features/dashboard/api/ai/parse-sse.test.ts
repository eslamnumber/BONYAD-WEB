import { describe, expect, it } from 'vitest';

import { mapSseEvent, SseEventBuffer, type WizardStreamEvent } from './parse-sse';

describe('mapSseEvent', () => {
  it('maps each known event name to its typed shape', () => {
    expect(mapSseEvent('thinking', '{"message":"جاري"}')).toEqual({
      type: 'thinking',
      message: 'جاري',
    });
    expect(mapSseEvent('token', '{"text":"x"}')).toEqual({ type: 'token', text: 'x' });
    expect(mapSseEvent('section', '{"path":"scope","value":{"in_scope":["a"]}}')).toEqual({
      type: 'section',
      path: 'scope',
      value: { in_scope: ['a'] },
    });
    expect(mapSseEvent('complete', '{"response":"تم","sow":{"scope":{}}}')).toEqual({
      type: 'complete',
      answer: 'تم',
      sow: { scope: {} },
    });
  });

  it('reads sow from ui.sow and treats [DONE] / done as done', () => {
    expect(mapSseEvent('complete', '{"ui":{"sow":{"risks":[]}}}')).toMatchObject({
      type: 'complete',
      sow: { risks: [] },
    });
    expect(mapSseEvent('done', '{"conversationId":"c1"}')).toEqual({
      type: 'done',
      conversationId: 'c1',
    });
    expect(mapSseEvent('token', '[DONE]')).toEqual({ type: 'done', conversationId: undefined });
    expect(mapSseEvent('start', '{}')).toBeNull();
  });
});

describe('SseEventBuffer', () => {
  it('parses a blank-line-separated stream', () => {
    const buf = new SseEventBuffer();
    const out = [
      ...buf.push(': stream open\n\nevent: thinking\ndata: {"message":"m"}\n\n'),
      ...buf.push('event: done\ndata: {"conversationId":"c"}\n\n'),
      ...buf.end(),
    ];
    expect(out).toEqual([
      { type: 'thinking', message: 'm' },
      { type: 'done', conversationId: 'c' },
    ]);
  });

  it('flushes the previous event on a new event: line when blank-line separators are missing', () => {
    const buf = new SseEventBuffer();
    const out: WizardStreamEvent[] = [
      ...buf.push('event: section\ndata: {"path":"scope","value":{}}\n'),
      ...buf.push('event: complete\ndata: {"response":"ok","sow":null}\n'),
      ...buf.end(),
    ];
    expect(out).toEqual([
      { type: 'section', path: 'scope', value: {} },
      { type: 'complete', answer: 'ok', sow: null },
    ]);
  });

  it('handles a payload split across chunk boundaries', () => {
    const buf = new SseEventBuffer();
    const out = [
      ...buf.push('event: tok'),
      ...buf.push('en\ndata: {"text":"hi"}\n\n'),
      ...buf.end(),
    ];
    expect(out).toEqual([{ type: 'token', text: 'hi' }]);
  });
});
