import { AI_INTERNAL_ROUTES } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { mergeSection } from './merge-sections';
import { SseEventBuffer, type WizardStreamEvent } from './parse-sse';
import type { ChatTurn } from './send-wizard-message';
import type { SowDocument } from './sow-types';

export type StreamResult = {
  sow: SowDocument | null;
  answer: string;
  sectionsCount: number;
  conversationId?: string;
};

export type StreamArgs = {
  message: string;
  conversationId: string;
  onEvent: (event: WizardStreamEvent) => void;
  signal?: AbortSignal;
  history?: ChatTurn[];
};

/** Build the locked stream request body — the chatbot is tuned for `lang: 'ar'`. */
export function streamBody(message: string, conversationId: string, history: ChatTurn[] = []) {
  return { message, conversationId, lang: 'ar', userType: 'USER', history };
}

/**
 * Open the SOW generation stream and read it to completion, accumulating section
 * events into a partial SOW and forwarding every event to `onEvent` for the live
 * "Omdah is building…" UI. RAM-safe: token deltas are counted then dropped (never
 * stored). Returns the assembled SOW (sections merged, then overridden by any
 * `complete` SOW). Throws if the stream can't be opened — the caller then falls
 * back to the REST path.
 */
export async function streamSow({
  message,
  conversationId,
  onEvent,
  signal,
  history = [],
}: StreamArgs): Promise<StreamResult> {
  const res = await apiClient.stream(AI_INTERNAL_ROUTES.CHAT_STREAM, {
    body: streamBody(message, conversationId, history),
    internal: true,
    signal,
  });
  const reader = res.body?.getReader();
  if (!reader) throw new Error('stream unavailable');

  const decoder = new TextDecoder();
  const parser = new SseEventBuffer();
  let sow: SowDocument | null = null;
  let answer = '';
  let sectionsCount = 0;
  let convId: string | undefined;

  const handle = (event: WizardStreamEvent) => {
    if (event.type === 'section') {
      sectionsCount += 1;
      sow = mergeSection(sow ?? {}, event.path, event.value);
    } else if (event.type === 'complete') {
      answer = event.answer || answer;
      if (event.sow) sow = event.sow;
    } else if (event.type === 'done') {
      convId = event.conversationId ?? convId;
    }
    onEvent(event);
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.push(decoder.decode(value, { stream: true })).forEach(handle);
  }
  parser.end().forEach(handle);

  return { sow, answer, sectionsCount, conversationId: convId };
}
