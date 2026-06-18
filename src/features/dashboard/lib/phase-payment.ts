import { type ProjectPhase } from '../schemas/project-phase';

/** The customer's two payment options (Figma 1547:7652). RN: `'full' | 'partial'`. */
export type PhasePaymentChoice = 'full' | 'partial';

/**
 * Outstanding balance on a phase: the backend `remainingAmount` when present, else
 * `moneySpent − amountPaid`, clamped ≥ 0. Mirrors RN PhasePaymentModal's
 * `phase.remainingAmount` (website-bonyad/src/components/projects/PhasePaymentModal).
 */
export function phaseRemaining(phase: ProjectPhase): number {
  if (typeof phase.remainingAmount === 'number') return Math.max(0, phase.remainingAmount);
  const total = phase.moneySpent ?? 0;
  const paid = phase.amountPaid ?? 0;
  return Math.max(0, total - paid);
}

/**
 * Amount to charge for the chosen option: `full` = the whole remaining balance;
 * `partial` = the parsed custom amount (blank / NaN → 0).
 */
export function phasePaymentAmount(
  phase: ProjectPhase,
  choice: PhasePaymentChoice,
  custom: string,
): number {
  if (choice === 'full') return phaseRemaining(phase);
  const n = parseFloat(custom);
  return Number.isFinite(n) ? n : 0;
}

/**
 * The backend FULL/PARTIAL flag sent to POST /phases/:id/pay — FULL once the amount
 * clears the whole remaining balance, PARTIAL otherwise. RN parity:
 * `amount >= remainingAmount ? 'FULL' : 'PARTIAL'`.
 */
export function apiPaymentType(amount: number, remaining: number): 'FULL' | 'PARTIAL' {
  return amount >= remaining ? 'FULL' : 'PARTIAL';
}

/**
 * Validate the chosen amount against the remaining balance. Returns an i18n error
 * key (under `dashboard.payment.options.error`) or null when valid. Mirrors the RN
 * PhasePaymentModal validation: amount > 0, ≤ remaining, and a partial must be
 * strictly less than the remaining balance.
 */
export function validatePaymentAmount(
  amount: number,
  remaining: number,
  choice: PhasePaymentChoice,
): 'invalid' | 'exceeds' | 'partialTooHigh' | null {
  if (!Number.isFinite(amount) || amount <= 0) return 'invalid';
  if (amount > remaining) return 'exceeds';
  if (choice === 'partial' && amount >= remaining) return 'partialTooHigh';
  return null;
}

/** A phase that still has a balance after the pending payment, with that balance. */
export type PhaseOutstanding = { phase: ProjectPhase; outstanding: number };

/**
 * Phases that will still owe money once `amountNow` clears against `currentPhaseId`
 * (the review step's "remaining after payment" list, Figma node 1553:8125). The
 * current phase keeps its leftover after a partial payment; everything still unpaid
 * keeps its full balance. Phases with nothing outstanding are dropped.
 */
export function phasesRemainingAfter(
  phases: ProjectPhase[],
  currentPhaseId: number,
  amountNow: number,
): PhaseOutstanding[] {
  return phases
    .map((phase) => {
      const base = phaseRemaining(phase);
      const outstanding = phase.id === currentPhaseId ? Math.max(0, base - amountNow) : base;
      return { phase, outstanding };
    })
    .filter((entry) => entry.outstanding > 0);
}

/** Sum of the outstanding balances from {@link phasesRemainingAfter}. */
export function totalOutstanding(entries: PhaseOutstanding[]): number {
  return entries.reduce((sum, entry) => sum + entry.outstanding, 0);
}
