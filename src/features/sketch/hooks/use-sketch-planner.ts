'use client';

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { useConfirmSketch } from '../api/confirm-sketch';
import { useSketchJob } from '../api/get-sketch-job';
import { useSelectSketchVariant } from '../api/select-variant';
import { isTerminalSketchStatus, type SketchJob } from '../api/sketch-types';
import { useSubmitSketchIdea, type SketchIdeaArgs } from '../api/submit-idea';

const TIMEOUT_MS = 180_000;

export type SketchPhase = 'form' | 'generating' | 'variants' | 'viewer';
export type SketchErrorKind = 'generate' | 'timeout' | 'confirm';

type SetError = Dispatch<SetStateAction<SketchErrorKind | null>>;

function derivePhase(
  jobId: string | null,
  variantsReady: boolean,
  confirmed: boolean,
): SketchPhase {
  if (confirmed) return 'viewer';
  if (variantsReady) return 'variants';
  if (jobId) return 'generating';
  return 'form';
}

function variantsAreReady(job?: SketchJob): boolean {
  return isTerminalSketchStatus(job?.status) && (job?.variant_floor_svgs?.length ?? 0) > 0;
}

/** The job's own `error` status is derived (not stored), so no setState in an effect. */
function deriveError(stored: SketchErrorKind | null, job?: SketchJob): SketchErrorKind | null {
  if (stored) return stored;
  return job?.status === 'error' ? 'generate' : null;
}

/** Flip to the error screen if generation runs past the 180 s budget. */
function useGenerationTimeout(active: boolean, setError: SetError) {
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => setError('timeout'), TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [active, setError]);
}

type ActionDeps = {
  jobId: string | null;
  selectedVariant: number | null;
  idea: ReturnType<typeof useSubmitSketchIdea>;
  select: ReturnType<typeof useSelectSketchVariant>;
  confirmMutation: ReturnType<typeof useConfirmSketch>;
  setJobId: Dispatch<SetStateAction<string | null>>;
  setSelectedVariant: Dispatch<SetStateAction<number | null>>;
  setConfirmedJob: Dispatch<SetStateAction<SketchJob | null>>;
  setError: SetError;
};

function useSketchActions(d: ActionDeps) {
  const generate = useCallback(
    (payload: SketchIdeaArgs) => {
      d.setError(null);
      d.idea.mutate(payload, {
        onSuccess: (reply) => (reply.jobId ? d.setJobId(reply.jobId) : d.setError('generate')),
        onError: () => d.setError('generate'),
      });
    },
    [d],
  );
  const selectVariant = useCallback(
    (index: number) => {
      d.setSelectedVariant(index);
      if (d.jobId) d.select.mutate({ jobId: d.jobId, variantIndex: index });
    },
    [d],
  );
  const confirm = useCallback(() => {
    if (!d.jobId || d.selectedVariant === null) return;
    d.setError(null);
    d.confirmMutation.mutate(d.jobId, {
      onSuccess: d.setConfirmedJob,
      onError: () => d.setError('confirm'),
    });
  }, [d]);
  const startOver = useCallback(() => {
    d.setJobId(null);
    d.setSelectedVariant(null);
    d.setConfirmedJob(null);
    d.setError(null);
  }, [d]);
  return { generate, selectVariant, confirm, startOver, retry: startOver };
}

/**
 * Drives the whole flow (form → generating → variants → viewer) over the four
 * endpoints. Mirrors the Omdah composed-hooks pattern: plain `useState`, the phase
 * derived from job status + actions. The 1.5 s poll lives in `useSketchJob`.
 */
export function useSketchPlanner() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [confirmedJob, setConfirmedJob] = useState<SketchJob | null>(null);
  const [error, setError] = useState<SketchErrorKind | null>(null);

  const idea = useSubmitSketchIdea();
  const select = useSelectSketchVariant();
  const confirmMutation = useConfirmSketch();
  const poll = useSketchJob(jobId ?? undefined, Boolean(jobId) && !confirmedJob);

  const job = poll.data;
  const phase = derivePhase(jobId, variantsAreReady(job), Boolean(confirmedJob));
  useGenerationTimeout(phase === 'generating', setError);

  const actions = useSketchActions({
    jobId,
    selectedVariant,
    idea,
    select,
    confirmMutation,
    setJobId,
    setSelectedVariant,
    setConfirmedJob,
    setError,
  });

  return {
    phase,
    job,
    confirmedJob,
    selectedVariant,
    submitting: idea.isPending,
    confirming: confirmMutation.isPending,
    error: deriveError(error, job),
    actions,
  };
}
