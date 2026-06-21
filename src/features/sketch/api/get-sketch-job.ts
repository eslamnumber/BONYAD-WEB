import { useQuery } from '@tanstack/react-query';

import { AI_INTERNAL_ROUTES } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { isTerminalSketchStatus, type SketchJob } from './sketch-types';

export const sketchJobQueryKey = (jobId: string) => ['sketch', 'job', jobId] as const;

/** Polling cadence — matches iOS `pollUntilReady` (every 1.5 s). */
export const SKETCH_POLL_MS = 1500;

/**
 * Fetch one SPJob snapshot. GET `/api/sketch/:jobId` (the route handler adds the
 * `?t=` cache-bust + `no-store`). Permissive — the job is returned verbatim.
 */
export async function getSketchJob(jobId: string): Promise<SketchJob> {
  const path = AI_INTERNAL_ROUTES.SKETCH.GET_JOB.replace(':jobId', encodeURIComponent(jobId));
  const data = await apiClient.get<SketchJob>(path, { internal: true });
  return (data ?? {}) as SketchJob;
}

/**
 * Poll the job until `status` is terminal (`parsed | ready | error`), mirroring iOS
 * `pollUntilReady`. The 180 s wall-clock timeout is enforced by the orchestrator
 * (it surfaces an error screen); here we only stop refetching once terminal.
 */
export function useSketchJob(jobId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: sketchJobQueryKey(jobId ?? ''),
    queryFn: () => getSketchJob(jobId as string),
    enabled: Boolean(jobId) && enabled,
    staleTime: 0,
    refetchInterval: (query) =>
      isTerminalSketchStatus(query.state.data?.status) ? false : SKETCH_POLL_MS,
  });
}
