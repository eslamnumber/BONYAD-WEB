import { z } from 'zod';

import { AI_INTERNAL_ROUTES } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SowDocument } from './sow-types';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };
export type ChatSuggestion = { label: string; value: string };
export type WizardStage = 'GATHER' | 'PLAN' | 'DONE' | null;

export type WizardReply = {
  answer: string;
  conversationId: string;
  suggestions: ChatSuggestion[];
  sow: SowDocument | null;
  stage: WizardStage;
};

/** Strict request body (rule 1) — the chatbot is tuned for `lang: 'ar'`, `userType: 'USER'`. */
const wizardRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().min(1),
  lang: z.string().default('ar'),
  userType: z.string().default('USER'),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .default([]),
});

export type SendWizardArgs = {
  message: string;
  conversationId: string;
  history?: ChatTurn[];
};

const STAGE_RE = /<<\s*WIZARD_STAGE\s*:\s*(GATHER|PLAN|DONE)\s*>>/i;

/** Pull the `<<WIZARD_STAGE:X>>` marker out of the reply text and strip it for display. */
export function extractStage(text: string): { answer: string; stage: WizardStage } {
  const m = text.match(STAGE_RE);
  const stage = m?.[1] ? (m[1].toUpperCase() as WizardStage) : null;
  return { answer: text.replace(STAGE_RE, '').trim(), stage };
}

function readReply(data: unknown, fallbackId: string): WizardReply {
  const root = (data ?? {}) as Record<string, unknown>;
  const nested = (root.data ?? {}) as Record<string, unknown>;
  const rawAnswer =
    pickString(root.response, root.answer, root.message, nested.response, nested.answer) ?? '';
  const ui = (root.ui ?? {}) as Record<string, unknown>;
  const { answer, stage } = extractStage(rawAnswer);
  return {
    answer,
    stage,
    conversationId: pickString(root.conversationId) ?? fallbackId,
    suggestions: readSuggestions(ui.suggestions),
    sow: ui.sow && typeof ui.sow === 'object' ? (ui.sow as SowDocument) : null,
  };
}

function readSuggestions(raw: unknown): ChatSuggestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => ({
      label: pickString((s as never)?.['label']) ?? '',
      value: pickString((s as never)?.['value']) ?? '',
    }))
    .filter((s) => s.label && s.value);
}

function pickString(...values: unknown[]): string | undefined {
  for (const v of values) if (typeof v === 'string' && v.length > 0) return v;
  return undefined;
}

/**
 * One conversational wizard step (REST). Posts through the same-origin
 * `/api/ai/chat` route, which forwards to the Cloud Run chatbot. Mirrors iOS
 * `sendWizardMessage`. Used both to pre-warm the GATHER stage and as the REST
 * fallback when the SSE stream yields no SOW.
 */
export async function sendWizardMessage({
  message,
  conversationId,
  history = [],
}: SendWizardArgs): Promise<WizardReply> {
  const body = wizardRequestSchema.parse({ message, conversationId, history });
  const data = await apiClient.post<unknown>(AI_INTERNAL_ROUTES.CHAT, { body, internal: true });
  return readReply(data, conversationId);
}
