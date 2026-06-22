/**
 * Technician wallet shape — GET /technician/wallet (the "الأرباح والتحويلات" panel).
 * Mirrors the iOS `TechnicianWalletService.swift` (backend-integration reference
 * only); the field names below are the ones VERIFIED live on the dev backend
 * (technician 444) — the response is `{ success, wallet }` with camelCase amounts
 * (these DIVERGE from the iOS snake_case model, hence the curl-first check).
 *
 * Permissive by hard rule 1: every field optional + nullable; `currency` is a
 * widening string (never a `z.enum`).
 */
export type TechnicianWallet = {
  /** SAR ready to withdraw — the headline figure. */
  availableBalance?: number | null;
  /** SAR held in escrow against in-progress phases. */
  inEscrow?: number | null;
  totalEarned?: number | null;
  earnedFromPhases?: number | null;
  totalPaidOut?: number | null;
  pendingPayouts?: number | null;
  manualAdjustments?: number | null;
  hasInitiatedPayout?: boolean | null;
  /** Last payout record (null when none yet). Kept loose — not curl-confirmed populated. */
  lastPayout?: unknown;
  currency?: string | null;
  technicianId?: number | null;
  technicianName?: string | null;
  technicianPhone?: string | null;
  technicianEmail?: string | null;
};
