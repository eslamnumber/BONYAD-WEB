import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { AI_INTERNAL_ROUTES } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };
export type AssistantSuggestion = { label: string; value: string };

export type AssistantReply = {
  answer: string;
  conversationId: string | null;
  suggestions: AssistantSuggestion[];
};

/**
 * Strict request body (rule 1). The Bonyad assistant shares the Cloud Run chatbot
 * host with the Omdah wizard (same same-origin `/api/ai/chat` route → foreign host),
 * so the body mirrors it. `conversationId` is omitted on the first turn — the backend
 * mints one and echoes it back; we resend it afterwards to keep conversation context.
 */
const assistantRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  lang: z.string().default('ar'),
  userType: z.string().default('USER'),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .default([]),
});

export type SendAssistantArgs = {
  message: string;
  conversationId?: string;
  lang?: string;
  userType?: string;
  history?: ChatTurn[];
};

/** The chatbot is project-creation-aware and tags replies with a wizard-stage marker; strip it for display. */
const STAGE_RE = /<<\s*WIZARD_STAGE\s*:\s*\w+\s*>>/gi;

function pickString(...values: unknown[]): string | undefined {
  for (const v of values) if (typeof v === 'string' && v.length > 0) return v;
  return undefined;
}

/** Suggestions arrive as `{ label, value }` objects (live backend) — tolerate bare strings too. */
function readSuggestions(raw: unknown): AssistantSuggestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      if (typeof s === 'string') return { label: s, value: s };
      const o = (s ?? {}) as Record<string, unknown>;
      return { label: pickString(o.label) ?? '', value: pickString(o.value) ?? '' };
    })
    .filter((s) => s.label && s.value);
}

/** Permissive response read (rule 1) — never a strict zod schema on a backend-controlled body. */
function readReply(data: unknown): AssistantReply {
  const root = (data ?? {}) as Record<string, unknown>;
  const nested = (root.data ?? {}) as Record<string, unknown>;
  const rawAnswer =
    pickString(root.response, root.answer, root.message, nested.response, nested.answer) ?? '';
  const ui = (root.ui ?? {}) as Record<string, unknown>;
  return {
    answer: rawAnswer.replace(STAGE_RE, '').trim(),
    conversationId: pickString(root.conversationId, root.session_id, nested.conversationId) ?? null,
    suggestions: readSuggestions(ui.suggestions),
  };
}

/**
 * One assistant chat turn (REST). Posts through the same-origin `/api/ai/chat`
 * route handler, which attaches the httpOnly session token when present and forwards
 * to the Cloud Run chatbot. Works anonymously. Ports RN `aiChatBotService.chatWithAI`.
 */
export async function sendAssistantMessage(args: SendAssistantArgs): Promise<AssistantReply> {
  const body = assistantRequestSchema.parse({
    message: args.message,
    conversationId: args.conversationId || undefined,
    lang: args.lang,
    userType: args.userType,
    history: args.history,
  });
  const data = await apiClient.post<unknown>(AI_INTERNAL_ROUTES.CHAT, { body, internal: true });
  return readReply(data);
}

export function useSendAssistantMessage() {
  return useMutation({ mutationFn: sendAssistantMessage });
}
