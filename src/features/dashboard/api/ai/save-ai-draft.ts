import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { isQualityTier, normalizeQualityTier } from './quality-tier';
import type { SowDocument } from './sow-types';

/**
 * Silent analytics/recovery draft (iOS `saveDraft`, fire-and-forget). Persists the
 * conversation + SOW under the user so an interrupted session can be recovered.
 * Never surfaces an error — the caller ignores the result.
 */
export async function saveAiDraft(sow: SowDocument, conversationId: string): Promise<void> {
  const rawTier = sow.project_metadata?.quality_tier;
  const body = {
    flow: 'SOW',
    chatbotConversationId: conversationId,
    qualityTier: isQualityTier(rawTier) ? rawTier : normalizeQualityTier(rawTier) || 'B',
    sowJson: sow,
  };
  try {
    await apiClient.put<unknown>(API_ENDPOINTS.AI.DRAFT, { body });
  } catch {
    // fire-and-forget — analytics/recovery only.
  }
}
