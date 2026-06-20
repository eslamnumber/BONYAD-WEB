import { buildGatherMessage } from './build-gather-message';
import { buildLocalSow } from './build-local-sow';
import { countSowSections } from './merge-sections';
import type { WizardStreamEvent } from './parse-sse';
import { sendWizardMessage, type ChatTurn, type WizardReply } from './send-wizard-message';
import type { InterviewAnswers, SowDocument } from './sow-types';
import { streamSow, type StreamResult } from './stream-sow';

export type GenerationOutcome = {
  sow: SowDocument;
  /** True when the chatbot produced nothing usable and we fell back to a local SOW. */
  degraded: boolean;
};

export type GenerateArgs = {
  answers: InterviewAnswers;
  conversationId: string;
  onEvent: (event: WizardStreamEvent) => void;
  signal?: AbortSignal;
  history?: ChatTurn[];
};

function hasSow(sow: SowDocument | null | undefined): sow is SowDocument {
  return !!sow && countSowSections(sow) >= 1;
}

async function restReply(
  message: string,
  conversationId: string,
  history: ChatTurn[],
): Promise<WizardReply | null> {
  try {
    return await sendWizardMessage({ message, conversationId, history });
  } catch {
    return null;
  }
}

/**
 * Generate a SOW with the same graceful degradation as iOS: stream first; on an
 * empty stream fall back to the REST `/api/chat`; if that is also empty, synthesize
 * a local SOW from the raw answers. Throws ONLY when BOTH transports fail outright
 * (network/host down) — that surfaces the "generation failed" state with a retry.
 */
export async function runGeneration({
  answers,
  conversationId,
  onEvent,
  signal,
  history = [],
}: GenerateArgs): Promise<GenerationOutcome> {
  const message = buildGatherMessage(answers);

  let streamResult: StreamResult | null = null;
  let streamThrew = false;
  try {
    streamResult = await streamSow({ message, conversationId, onEvent, signal, history });
  } catch {
    streamThrew = true;
  }
  if (hasSow(streamResult?.sow)) return { sow: streamResult.sow, degraded: false };

  const reply = await restReply(message, conversationId, history);
  if (hasSow(reply?.sow)) return { sow: reply.sow, degraded: false };

  if (streamThrew && !reply) throw new Error('generation failed');
  return { sow: buildLocalSow(answers), degraded: true };
}
