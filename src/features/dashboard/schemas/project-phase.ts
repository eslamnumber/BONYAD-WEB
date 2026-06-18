/**
 * Mirrors `Phase` from website-bonyad/src/services/PhaseService.ts (GET
 * /phases/project/:projectId). Permissive — every field is optional except `id`
 * so a backend addition never surfaces as a misleading error. The timeline reads
 * `description` + an expected/scheduled date; the backend Phase has no dedicated
 * "expected date" field, so the optional date fields below are read when present
 * and otherwise derived/omitted by the phases card.
 */
export type ProjectPhase = {
  id: number;
  projectId?: number;
  phaseNumber?: number;
  /** Phase heading (e.g. "Phase 1: Foundations"). The create payload (POST /phases)
   *  sends `title` + `description` separately; older phases may carry only
   *  `description` (which then doubles as the heading). */
  title?: string;
  description?: string;
  timeSpentDays?: number;
  moneySpent?: number;
  paymentStatus?: string;
  /** Phase payment progress (mirrors RN PhasePaymentModal.Phase). The backend GET
   *  /phases response carries these on a payable phase; when absent the payment
   *  flow derives them (remaining = moneySpent − amountPaid, see lib/phase-payment).
   *  `requestedPaymentAmount` is set once the technician requests payment. */
  amountPaid?: number;
  remainingAmount?: number;
  percentagePaid?: number;
  requestedPaymentAmount?: number | null;
  paymentRequestReason?: string | null;
  paymentRequestedAt?: string | null;
  /** Set once a phase payment clears (ISO-8601). Mirrors PhaseService.Phase.paidAt;
   *  with `paymentStatus === 'PAID'` it drives the "paid" derivation on the
   *  completed-project screen (see lib/project-finance.ts). */
  paidAt?: string;
  approved?: boolean;
  completed?: boolean;
  /** Scheduled date shown in the timeline (ISO-8601) when the backend provides it. */
  expectedDate?: string;
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
};
