'use client';

import { useCallback, useState } from 'react';

import { refineSow } from '../../../../api/ai/refine-sow';
import { PublishFailure, runPublish } from '../../../../api/ai/run-publish';
import type { SowDocument } from '../../../../api/ai/sow-types';

import type { PublishDraft } from './sow-flow-types';

export type PublishStage = 'review' | 'publishAddress' | 'publishReview' | 'publishing' | 'success';
export type PublishErr = 'publish-service' | 'publish-failed';

const EMPTY_DRAFT: PublishDraft = { address: '', photos: [] };

/**
 * The review/publish concern: inline refine, the address/review/publishing stage
 * machine, and the publish pipeline. A failed publish sets `error` (the orchestrator
 * surfaces the error screen) without losing the gathered draft.
 */
function useSowRefine(
  sow: SowDocument | null,
  setSow: (sow: SowDocument) => void,
  conversationId: string,
) {
  const [isRefining, setIsRefining] = useState(false);
  const refine = useCallback(
    async (message: string): Promise<boolean> => {
      if (!sow || !message.trim()) return false;
      setIsRefining(true);
      try {
        const { sow: updated } = await refineSow({ message, sow, conversationId });
        setSow(updated);
        return true;
      } catch {
        return false;
      } finally {
        setIsRefining(false);
      }
    },
    [sow, setSow, conversationId],
  );
  return { isRefining, refine };
}

export function useSowPublish(args: {
  sow: SowDocument | null;
  setSow: (sow: SowDocument) => void;
  conversationId: string;
  locale: string;
}) {
  const { sow, setSow, conversationId, locale } = args;
  const [stage, setStage] = useState<PublishStage>('review');
  const [error, setError] = useState<PublishErr | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [draft, setDraft] = useState<PublishDraft>(EMPTY_DRAFT);
  const { isRefining, refine } = useSowRefine(sow, setSow, conversationId);

  const publish = useCallback(async () => {
    if (!sow) return;
    setStage('publishing');
    setError(null);
    try {
      const result = await runPublish({ sow, conversationId, locale, ...draft });
      setProjectId(result.projectId);
      setStage('success');
    } catch (err) {
      setError(
        err instanceof PublishFailure && err.kind === 'no-service'
          ? 'publish-service'
          : 'publish-failed',
      );
    }
  }, [sow, conversationId, locale, draft]);

  const updateDraft = useCallback((partial: Partial<PublishDraft>) => {
    setDraft((d) => ({ ...d, ...partial }));
  }, []);

  return {
    stage,
    setStage,
    error,
    setError,
    projectId,
    draft,
    isRefining,
    refine,
    publish,
    updateDraft,
  };
}
