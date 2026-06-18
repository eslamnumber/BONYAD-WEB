import { type CardMutationResponseBody, type PaymentCard } from '../schemas/card';

/**
 * Throw when the backend forwarded a failure over HTTP 200 (`success: false`) —
 * the iOS card service checks this on every call. `apiClient` already throws
 * `ApiError` on a non-2xx status, so this only catches the 200-with-`success:false`
 * shape. The thrown `Error` carries the backend's `error`/`message` reason.
 */
export function assertCardOk(body: { success?: boolean; error?: string; message?: string }): void {
  if (body.success === false) {
    throw new Error(body.error ?? body.message ?? 'Card request failed');
  }
}

/** The shared `cards` query namespace — invalidated after every card mutation. */
export const cardsQueryKey = () => ['cards', 'my'] as const;

/** Pull the card out of a mutation response, or null when the backend omits it. */
export function extractCard(body: CardMutationResponseBody): PaymentCard | null {
  return body.card ?? null;
}
