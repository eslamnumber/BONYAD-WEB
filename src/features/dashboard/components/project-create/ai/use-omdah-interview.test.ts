import { describe, expect, it } from 'vitest';

import { act, renderHook } from '@/testing/render';

import { buildTranscript, useOmdahInterview } from './use-omdah-interview';

describe('useOmdahInterview', () => {
  it('starts empty and cannot send', () => {
    const { result } = renderHook(() => useOmdahInterview());

    expect(result.current.step).toBe(0);
    expect(result.current.total).toBe(7);
    expect(result.current.canSend).toBe(false);
    expect(result.current.done).toBe(false);
  });

  it('sends an answer, records it, advances, and clears the input', () => {
    const { result } = renderHook(() => useOmdahInterview());

    act(() => result.current.setInput('Bathroom reno'));
    expect(result.current.canSend).toBe(true);

    act(() => result.current.send());
    expect(result.current.step).toBe(1);
    expect(result.current.answers.project_name).toBe('Bathroom reno');
    expect(result.current.input).toBe('');
  });

  it('does not send a blank answer', () => {
    const { result } = renderHook(() => useOmdahInterview());
    act(() => result.current.send());
    expect(result.current.step).toBe(0);
  });

  it('finishes after the last question; restart resets', () => {
    const { result } = renderHook(() => useOmdahInterview());

    for (let i = 0; i < 7; i++) {
      act(() => result.current.setInput('a'));
      act(() => result.current.send());
    }
    expect(result.current.done).toBe(true);

    act(() => result.current.restart());
    expect(result.current.done).toBe(false);
    expect(result.current.step).toBe(0);
  });
});

describe('buildTranscript', () => {
  it('opens with a greeting and the first question only', () => {
    const rows = buildTranscript(0, {}, false);
    expect(rows[0]).toEqual({ role: 'ai', tkey: 'greeting' });
    expect(rows[1]).toEqual({ role: 'ai', tkey: 'questions.project_name' });
    expect(rows).toHaveLength(2);
  });

  it('includes answered questions as user rows and a closing when done', () => {
    const answers = { project_name: 'Bathroom', location: 'Riyadh' };
    const rows = buildTranscript(6, answers, true);
    expect(rows.some((r) => r.role === 'user' && r.text === 'Bathroom')).toBe(true);
    expect(rows.at(-1)).toEqual({ role: 'ai', tkey: 'closing' });
  });
});
