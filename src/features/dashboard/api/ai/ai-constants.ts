/**
 * Hard-coded Arabic trigger phrases the chatbot is tuned for, REGARDLESS of UI
 * locale (iOS "Known gotchas"). The GATHER trigger primes the wizard stage on a
 * conversationId before the gather payload is streamed; the DONE trigger flips the
 * backend to publish. Any deviation degrades or breaks the flow.
 */
export const GATHER_TRIGGER = 'أبي أنشئ مشروع';
export const PUBLISH_TRIGGER = 'نعم، انشر المشروع';
