import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { AI_INTERNAL_ROUTES } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SketchJob } from './sketch-types';

/** Strict request body (hard rule 1). */
export const selectVariantSchema = z.object({ variant_index: z.number().int().min(0) });

export type SelectVariantArgs = { jobId: string; variantIndex: number };

/**
 * Pin the chosen 2D variant. POST `/api/sketch/:jobId/select-variant`
 * (`{ variant_index }`); returns the updated SPJob whose `active_variant` + `parse`
 * now reflect the selection. Mirrors iOS `selectVariant`.
 */
export async function selectSketchVariant({
  jobId,
  variantIndex,
}: SelectVariantArgs): Promise<SketchJob> {
  const body = selectVariantSchema.parse({ variant_index: variantIndex });
  const path = AI_INTERNAL_ROUTES.SKETCH.SELECT_VARIANT.replace(
    ':jobId',
    encodeURIComponent(jobId),
  );
  const data = await apiClient.post<SketchJob>(path, { body, internal: true });
  return (data ?? {}) as SketchJob;
}

export function useSelectSketchVariant() {
  return useMutation({ mutationFn: selectSketchVariant });
}
