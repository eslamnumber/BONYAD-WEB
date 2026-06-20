import { AI_INTERNAL_ROUTES } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SowDocument } from './sow-types';

export type RefineResult = { sow: SowDocument; response: string };

/**
 * Apply a natural-language edit to the full SOW (iOS `SOWRefineService.refine`).
 * Always sends the LATEST full SOW so edits compose. Routed through the same-origin
 * `/api/ai/refine` handler → AWS refine service. Returns the updated SOW plus the
 * assistant's confirmation line. On any failure the caller keeps the prior SOW.
 */
export async function refineSow(args: {
  message: string;
  sow: SowDocument;
  conversationId: string;
}): Promise<RefineResult> {
  const body = {
    message: args.message.trim(),
    sow: args.sow,
    sketchJobId: null,
    conversationId: args.conversationId,
    language: 'ar',
    projectId: null,
    token: null,
  };
  const data = await apiClient.post<unknown>(AI_INTERNAL_ROUTES.REFINE, { body, internal: true });
  const root = (data ?? {}) as Record<string, unknown>;
  const sow = root.sow && typeof root.sow === 'object' ? (root.sow as SowDocument) : args.sow;
  const response = typeof root.response === 'string' ? root.response : '';
  return { sow, response };
}
