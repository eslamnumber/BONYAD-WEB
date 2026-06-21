import { ApiError } from '@/lib/api-client';

import type { ChangeRequest } from '../schemas/change-request';

/**
 * Change-request negotiation status, mapped to the existing project status-token
 * palette (no new tokens — rule 19). `responded` reuses the "offer" tone (a
 * counter-offer is on the table); `agreed` the approved/green tone; `completed`
 * the done tone.
 */
export const CHANGE_REQUEST_STATUS_VARIANTS = [
  'pending',
  'responded',
  'agreed',
  'rejected',
  'completed',
] as const;

export type ChangeRequestStatusVariant = (typeof CHANGE_REQUEST_STATUS_VARIANTS)[number];

/**
 * Map a backend status string onto a badge variant. The backend status taxonomy
 * isn't strictly enumerated and response types stay permissive (rule 1), so this
 * matches substrings and falls back to `pending` rather than throwing.
 */
export function changeRequestStatusVariant(status?: string | null): ChangeRequestStatusVariant {
  const s = (status ?? '').toLowerCase();
  if (/complet|done|finish/.test(s)) return 'completed';
  if (/agree|sign/.test(s)) return 'agreed';
  if (/reject|declin|cancel/.test(s)) return 'rejected';
  if (/respond|counter|negotiat/.test(s)) return 'responded';
  return 'pending';
}

/** Open for action — PENDING or RESPONDED. The action bar shows only here. */
export function isActiveChangeRequestStatus(status?: string | null): boolean {
  const v = changeRequestStatusVariant(status);
  return v === 'pending' || v === 'responded';
}

/** The fields that, in any combination, mean a party has agreed. */
type AgreementFields = Pick<
  ChangeRequest,
  'userAgreed' | 'technicianAgreed' | 'userAgreedAt' | 'technicianAgreedAt' | 'bothAgreed'
>;

/**
 * Has the viewing party already cast their agreement? Agreement is per-party: the
 * technician's side is `technicianAgreed`, the customer's is `userAgreed`. The
 * backend reports it via the boolean OR the matching `…AgreedAt` timestamp (and
 * `bothAgreed` once both are in) — and the boolean can come back null on some GET
 * projections while the timestamp is set. Accept ANY of those signals, otherwise
 * an already-agreed party keeps seeing (and re-tapping) the agree button across a
 * refresh and hits the backend's "you have already agreed" 400.
 */
export function hasViewerAgreed(cr: AgreementFields, isTechnician: boolean): boolean {
  if (cr.bothAgreed) return true;
  return isTechnician
    ? Boolean(cr.technicianAgreed || cr.technicianAgreedAt)
    : Boolean(cr.userAgreed || cr.userAgreedAt);
}

/**
 * Did the viewing user author this request? The backend blocks rejecting or
 * responding to your own change request ("You cannot reject your own change
 * request"), so the action bar hides those for the requester and offers only the
 * agree (accept) panel. Matched by id when the backend sends the `{ id, name }`
 * object form, otherwise by display name (the dev string form) — trimmed and
 * case-insensitive. Unknown viewer ⇒ false (fall back to the full action bar).
 */
export function isOwnChangeRequest(
  cr: Pick<ChangeRequest, 'requestedBy' | 'requestedById'>,
  user: { id?: number; name?: string } | null | undefined,
): boolean {
  if (!user) return false;
  if (typeof cr.requestedById === 'number' && typeof user.id === 'number') {
    return cr.requestedById === user.id;
  }
  const requester = cr.requestedBy?.trim().toLowerCase();
  const viewer = user.name?.trim().toLowerCase();
  return Boolean(requester && viewer && requester === viewer);
}

/**
 * Did an `/agree` call fail because the viewer had already agreed? The backend
 * returns a plain `{ error: "You have already agreed to this change request" }`
 * 400 (no `messageEn`/`errorCode`), so check both the standard message field and
 * that bare `error` body field. Lets the action bar collapse to the agreed note
 * when our cached agreement flag was stale and the button shouldn't have shown.
 */
export function isAlreadyAgreedError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const plain =
    error.body && typeof error.body === 'object'
      ? (error.body as { error?: unknown }).error
      : undefined;
  const text = [error.messageEn, typeof plain === 'string' ? plain : '']
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return /already\s+agreed/.test(text);
}

/** Lowercased text from an ApiError's `messageEn` + bare `{ error }` body field. */
function agreeErrorText(error: unknown): string {
  if (!(error instanceof ApiError)) return '';
  const plain =
    error.body && typeof error.body === 'object'
      ? (error.body as { error?: unknown }).error
      : undefined;
  return [error.messageEn, typeof plain === 'string' ? plain : '']
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Did an `/agree` call fail with the backend's spurious `{ error: "User is not a
 * technician" }` 400? Verified on dev: a one-sided agree returns 200 cleanly, but
 * the agree that flips `bothAgreed` → true (which generates the contract +
 * signature) can return this role error **even though the agreement is recorded
 * and the contract is sent**. Treated as benign so the technician isn't shown an
 * error for an action that actually succeeded.
 */
export function isNotTechnicianError(error: unknown): boolean {
  return /not a technician/.test(agreeErrorText(error));
}

/**
 * An `/agree` error the backend returns even though the agreement was recorded —
 * either "you have already agreed" (stale cached flag) or the `bothAgreed`
 * "User is not a technician" quirk. The action bar collapses to the agreed state
 * and the mutation resyncs, instead of surfacing a misleading error.
 */
export function isBenignAgreeError(error: unknown): boolean {
  return isAlreadyAgreedError(error) || isNotTechnicianError(error);
}
