import type { ChangeRequest, ChangeRequestPhaseChange } from '../schemas/change-request';

/**
 * Defensive decoders for the change-request GETs — the backend (shared with the
 * iOS app) returns a few fields in more than one shape. Verified on dev:
 * `requestedBy` came back as a plain string, `phaseChanges` as an array, lists as
 * bare arrays — but the iOS decoder tolerates the object/string/envelope variants
 * too, so we mirror that tolerance here rather than trust one observed shape.
 */

/** Flatten a `requestedBy` / `respondedBy` that is either a display-name string
 *  or a `{ id, name }` object down to a plain name (or null). */
export function normalizePerson(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const name = (value as { name?: unknown }).name;
    if (typeof name === 'string') return name;
  }
  return null;
}

/** Pull the numeric id out of a `{ id, name }` person object. The dev string
 *  form carries no id, so this returns null there and identity falls back to the
 *  display name (see {@link isOwnChangeRequest}). */
export function normalizePersonId(value: unknown): number | null {
  if (value && typeof value === 'object') {
    const id = (value as { id?: unknown }).id;
    if (typeof id === 'number') return id;
  }
  return null;
}

/** `phaseChanges` is normally an array, but the backend occasionally returns it
 *  as a JSON-encoded string (iOS handles both). Parse the string form; anything
 *  unparseable or non-array collapses to []. */
export function normalizePhaseChanges(value: unknown): ChangeRequestPhaseChange[] {
  if (Array.isArray(value)) return value as ChangeRequestPhaseChange[];
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as ChangeRequestPhaseChange[];
    } catch {
      return [];
    }
  }
  return [];
}

/** Normalise one raw record into the {@link ChangeRequest} read model. */
export function normalizeChangeRequest(raw: unknown): ChangeRequest {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    ...(r as ChangeRequest),
    requestedBy: normalizePerson(r.requestedBy),
    requestedById: normalizePersonId(r.requestedBy),
    respondedBy: normalizePerson(r.respondedBy),
    phaseChanges: normalizePhaseChanges(r.phaseChanges),
  };
}

/** Pull the array out of a bare-array body or one of the named envelope keys. */
function pickArray(data: unknown, keys: string[]): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const key of keys) {
      const value = (data as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

/** Decode a change-request list response (bare array primary; named envelope
 *  fallback per the iOS decoder) into normalised records. */
export function unwrapChangeRequests(data: unknown, ...envelopeKeys: string[]): ChangeRequest[] {
  return pickArray(data, envelopeKeys).map(normalizeChangeRequest);
}
