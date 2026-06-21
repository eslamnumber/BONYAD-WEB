/**
 * Read model for the change-request negotiation — the shape every GET endpoint
 * returns. Permissive TS types (CLAUDE rule 1: never strict-parse a backend
 * response), so a new status value or field never surfaces as a misleading
 * "Something went wrong". Mirrors the iOS `ChangeRequest` model
 * (bonayd-ios/.../new_request/ChangeRequestService.swift) and is verified field
 * by field against dev GET /change-requests/project/183 (records 12, 13).
 */

/** Negotiation lifecycle. Kept as a widened string at the boundary (rule 1). */
export type ChangeRequestStatus = 'PENDING' | 'RESPONDED' | 'AGREED' | 'REJECTED' | 'COMPLETED';

/** Per-phase mutation carried by a change request. */
export type ChangeRequestActionType = 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * One phase change. CREATE has no `phaseId` (a brand-new phase); UPDATE/DELETE
 * carry the target `phaseId`. DELETE leaves description/time/money null. Verified
 * against dev records 12 (UPDATE×6 + DELETE) and 13 (CREATE×3).
 */
export type ChangeRequestPhaseChange = {
  actionType: ChangeRequestActionType | string;
  phaseId?: number | null;
  phaseNumber?: number | null;
  description?: string | null;
  timeSpentDays?: number | null;
  moneySpent?: number | null;
  orderIndex?: number | null;
};

/**
 * One node in the negotiation. `requestedBy` / `respondedBy` are normalised from
 * the backend's dual string-or-`{ name }` form to a plain display name (see
 * {@link normalizePerson}); `phaseChanges` from array-or-JSON-string to an array
 * (see {@link normalizePhaseChanges}). `projectId` is intentionally absent — the
 * backend omits it and the caller already knows it from the query.
 */
export type ChangeRequest = {
  id: number;
  status?: ChangeRequestStatus | string;
  description?: string | null;
  newBudget?: number | null;
  requestedBy?: string | null;
  /** Requester id, present only when the backend sends the `{ id, name }` object
   *  form of `requestedBy` (the dev string form has none). Used to tell whether
   *  the viewer authored the request — see {@link isOwnChangeRequest}. */
  requestedById?: number | null;
  requestedAt?: string | null;
  respondedBy?: string | null;
  respondedAt?: string | null;
  response?: string | null;
  parentRequestId?: number | null;
  agreedChanges?: string | null;
  agreedAt?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  reason?: string | null;
  completedAt?: string | null;
  phaseChanges?: ChangeRequestPhaseChange[];
  userAgreed?: boolean;
  technicianAgreed?: boolean;
  bothAgreed?: boolean;
  userAgreedAt?: string | null;
  technicianAgreedAt?: string | null;
  documentUrl?: string | null;
  signatureRequestId?: string | null;
  thirdPartyReferenceId?: string | null;
};

/**
 * Response from create / respond / reject (POST). Permissive (rule 1). Mirrors
 * the iOS `ChangeRequestResponse`.
 */
export type ChangeRequestResponse = {
  message?: string;
  changeRequestId?: number;
  status?: string;
  requestedBy?: string | null;
  requestedAt?: string | null;
  respondedBy?: string | null;
  respondedAt?: string | null;
};

/**
 * Response from POST /agree — the richer two-party agreement payload. `bothAgreed`
 * flips true only once each side has agreed, at which point `documentUrl` is the
 * signed contract. Mirrors the iOS `ChangeRequestAgreementResponse`.
 */
export type ChangeRequestAgreementResponse = {
  message?: string;
  userAgreed?: boolean;
  technicianAgreed?: boolean;
  bothAgreed?: boolean;
  userAgreedAt?: string | null;
  technicianAgreedAt?: string | null;
  agreedChanges?: string | null;
  documentUrl?: string | null;
  signatureRequestId?: string | null;
};
