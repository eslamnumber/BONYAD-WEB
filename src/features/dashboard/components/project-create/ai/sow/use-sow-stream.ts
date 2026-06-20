'use client';

import { useCallback, useRef, useState } from 'react';

import type { WizardStreamEvent } from '../../../../api/ai/parse-sse';
import { runGeneration, type GenerationOutcome } from '../../../../api/ai/run-generation';
import type { ChatTurn } from '../../../../api/ai/send-wizard-message';
import type { InterviewAnswers } from '../../../../api/ai/sow-types';

export type GenStatus = 'idle' | 'streaming' | 'success' | 'error';

/**
 * Drives SOW generation and the live "Omdah is building…" UI. Exposes the sections
 * that have arrived (for the progress checklist) and Omdah's current thinking line,
 * updated as stream events fire. Returns the {@link GenerationOutcome} (or throws on
 * a total transport failure, which the orchestrator maps to the error screen).
 */
export function useSowStream() {
  const [status, setStatus] = useState<GenStatus>('idle');
  const [arrived, setArrived] = useState<string[]>([]);
  const [thinking, setThinking] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const onEvent = useCallback((event: WizardStreamEvent) => {
    if (event.type === 'thinking') setThinking(event.message);
    else if (event.type === 'section') {
      setArrived((prev) => (prev.includes(event.path) ? prev : [...prev, event.path]));
    }
  }, []);

  const generate = useCallback(
    async (
      answers: InterviewAnswers,
      conversationId: string,
      history: ChatTurn[],
    ): Promise<GenerationOutcome> => {
      setStatus('streaming');
      setArrived([]);
      setThinking('');
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const outcome = await runGeneration({
          answers,
          conversationId,
          onEvent,
          signal: ctrl.signal,
          history,
        });
        setStatus('success');
        return outcome;
      } catch (err) {
        setStatus('error');
        throw err;
      }
    },
    [onEvent],
  );

  return { status, arrived, thinking, generate };
}
