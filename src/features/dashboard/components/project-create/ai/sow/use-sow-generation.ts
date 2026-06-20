'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { checkAiHealth } from '../../../../api/ai/check-ai-health';
import { prewarmGather } from '../../../../api/ai/prewarm';
import type { InterviewAnswers, SowDocument } from '../../../../api/ai/sow-types';

import { useSowStream } from './use-sow-stream';

export type GenPhase = 'generating' | 'ready' | 'error';
export type GenError = 'offline' | 'generation';

/**
 * The generation concern: health-check → prime GATHER → stream the SOW, with the
 * live `arrived`/`thinking` signals for the generating screen. Runs once on mount;
 * `retry` re-runs it. `setSow` lets refine update the working document afterwards.
 */
export function useSowGeneration(answers: InterviewAnswers, conversationId: string) {
  const stream = useSowStream();
  const [sow, setSow] = useState<SowDocument | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [phase, setPhase] = useState<GenPhase>('generating');
  const [error, setError] = useState<GenError | null>(null);

  const begin = useCallback(async () => {
    setPhase('generating');
    setError(null);
    const healthy = await checkAiHealth().catch(() => false);
    if (!healthy) {
      setError('offline');
      setPhase('error');
      return;
    }
    try {
      const history = await prewarmGather(conversationId);
      const outcome = await stream.generate(answers, conversationId, history);
      setSow(outcome.sow);
      setDegraded(outcome.degraded);
      setPhase('ready');
    } catch {
      setError('generation');
      setPhase('error');
    }
  }, [answers, conversationId, stream]);

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void begin();
  }, [begin]);

  return {
    sow,
    setSow,
    degraded,
    phase,
    error,
    retry: begin,
    arrived: stream.arrived,
    thinking: stream.thinking,
  };
}
