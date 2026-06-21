import { useMutation } from '@tanstack/react-query';

import { AI_INTERNAL_ROUTES } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SketchJob } from './sketch-types';

/**
 * Build the 3D scene from the active variant. POST `/api/sketch/:jobId/confirm`
 * (empty body, slow ~60 s); returns the SPJob with `scene`
 * (`rooms / openings / placements / wall_height_m / wall_thickness_m`) populated
 * and `status: ready`. Mirrors iOS `confirmScene`.
 */
export async function confirmSketch(jobId: string): Promise<SketchJob> {
  const path = AI_INTERNAL_ROUTES.SKETCH.CONFIRM.replace(':jobId', encodeURIComponent(jobId));
  const data = await apiClient.post<SketchJob>(path, { internal: true });
  return (data ?? {}) as SketchJob;
}

export function useConfirmSketch() {
  return useMutation({ mutationFn: confirmSketch });
}
