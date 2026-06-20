'use client';

import { useCallback, useState } from 'react';

import type { InterviewAnswers } from '../../../../api/ai/sow-types';

import type { FlowErrorKind, FlowStep } from './sow-flow-types';
import { useSowGeneration } from './use-sow-generation';
import { useSowPublish } from './use-sow-publish';

function safeUuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `web-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

type Gen = ReturnType<typeof useSowGeneration>;
type Pub = ReturnType<typeof useSowPublish>;

/** Collapse the two concerns' state into the single screen the flow renders. */
function resolveStep(gen: Gen, pub: Pub): FlowStep {
  if (gen.phase === 'generating') return 'generating';
  if (gen.error || pub.error) return 'error';
  return pub.stage;
}

/**
 * State machine for the whole Omdah SOW flow: health → generate → review (+refine)
 * → publish address → publish review → publishing → success / error. Composes the
 * generation and publish concerns and exposes one `step` + `actions` to the UI.
 */
export function useOmdahSow(answers: InterviewAnswers, locale: string) {
  const [conversationId] = useState(safeUuid);
  const gen = useSowGeneration(answers, conversationId);
  const pub = useSowPublish({ sow: gen.sow, setSow: gen.setSow, conversationId, locale });

  const retry = useCallback(() => {
    if (gen.error) return void gen.retry();
    if (pub.error === 'publish-service') {
      pub.setError(null);
      pub.setStage('review');
      return;
    }
    pub.setError(null);
    void pub.publish();
  }, [gen, pub]);

  return {
    step: resolveStep(gen, pub),
    errorKind: (gen.error ?? pub.error ?? null) as FlowErrorKind | null,
    sow: gen.sow,
    degraded: gen.degraded,
    isRefining: pub.isRefining,
    projectId: pub.projectId,
    draft: pub.draft,
    arrived: gen.arrived,
    thinking: gen.thinking,
    actions: {
      refine: pub.refine,
      publish: pub.publish,
      retry,
      updateDraft: pub.updateDraft,
      toAddress: () => pub.setStage('publishAddress'),
      toReview: () => pub.setStage('review'),
      toPublishReview: () => pub.setStage('publishReview'),
      backToAddress: () => pub.setStage('publishAddress'),
    },
  };
}

export type OmdahSowController = ReturnType<typeof useOmdahSow>;
