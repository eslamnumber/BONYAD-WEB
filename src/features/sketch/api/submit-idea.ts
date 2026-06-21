import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { AI_INTERNAL_ROUTES } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { CreateSketchJobReply } from './sketch-types';

/**
 * Strict request body (hard rule 1). Only `description` is required; the rest carry
 * the project shape. Snake_case keys match the Cloud Run `POST /api/sketch/idea`.
 */
export const sketchIdeaSchema = z.object({
  description: z.string().min(1),
  total_area_m2: z.number().positive().optional(),
  project_type: z.string().optional(),
  stories: z.number().int().positive().optional(),
  has_basement: z.boolean().optional(),
  has_roof_annex: z.boolean().optional(),
  style: z.string().optional(),
  plot: z
    .object({
      shape: z.string().optional(),
      dimensions_m: z.array(z.number()).optional(),
      setbacks_m: z.record(z.string(), z.number()).optional(),
    })
    .optional(),
});

export type SketchIdeaArgs = z.input<typeof sketchIdeaSchema>;

function readReply(data: unknown): CreateSketchJobReply {
  const root = (data ?? {}) as Record<string, unknown>;
  return {
    jobId: typeof root.jobId === 'string' ? root.jobId : '',
    status: typeof root.status === 'string' ? root.status : undefined,
  };
}

/**
 * Create a sketch job from a text description. Posts through the same-origin
 * `/api/sketch/idea` route, which forwards to the Cloud Run host. Mirrors iOS
 * `SketchPlannerAPI.createJob`; returns `{ jobId, status }`.
 */
export async function submitSketchIdea(args: SketchIdeaArgs): Promise<CreateSketchJobReply> {
  const body = sketchIdeaSchema.parse(args);
  const data = await apiClient.post<unknown>(AI_INTERNAL_ROUTES.SKETCH.IDEA, {
    body,
    internal: true,
  });
  return readReply(data);
}

export function useSubmitSketchIdea() {
  return useMutation({ mutationFn: submitSketchIdea });
}
