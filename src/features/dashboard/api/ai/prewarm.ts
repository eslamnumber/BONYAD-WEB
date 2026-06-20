import { GATHER_TRIGGER } from './ai-constants';
import { sendWizardMessage, type ChatTurn } from './send-wizard-message';

/**
 * Prime the wizard's GATHER stage on a conversationId before the gather payload is
 * streamed. The chatbot keys its stage off the (stable) conversationId, so sending
 * the locked Arabic trigger first is what lets the following gather message produce
 * a PLAN SOW instead of a "tell me more" reply (verified against the live backend).
 * Returns the seed history; never throws (returns the trigger turn alone on failure).
 */
export async function prewarmGather(conversationId: string): Promise<ChatTurn[]> {
  try {
    const reply = await sendWizardMessage({ message: GATHER_TRIGGER, conversationId });
    return [
      { role: 'user', content: GATHER_TRIGGER },
      { role: 'assistant', content: reply.answer },
    ];
  } catch {
    return [{ role: 'user', content: GATHER_TRIGGER }];
  }
}
