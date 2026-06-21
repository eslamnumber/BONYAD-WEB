import type { ProjectDetail } from '../schemas/project';
import type { ProjectPhase } from '../schemas/project-phase';

/**
 * Phase payment state collapsed onto the three pills the in-progress detail
 * renders (Figma 1103:6649). Mirrors RN `PhaseService.paymentStatus`
 * (`'PENDING' | 'REQUESTED_PAYMENT' | 'PARTIALLY_PAID' | 'PAID' | 'COMPLETED'`).
 * Permissive — an unknown value falls back to `upcoming`, never throws.
 */
export type PaymentState = 'paid' | 'awaiting' | 'upcoming';

export function paymentState(status: string | undefined): PaymentState {
  const s = (status ?? '').toUpperCase();
  if (s === 'PAID' || s === 'COMPLETED') return 'paid';
  if (s === 'REQUESTED_PAYMENT' || s === 'PARTIALLY_PAID') return 'awaiting';
  return 'upcoming';
}

/**
 * What the technician can do about a phase's payment on the in-progress timeline:
 * `request` = the phase is approved and still PENDING (show "Request payment");
 * `requested` = payment already requested (show the "Payment requested" badge,
 * awaiting the customer); `none` = paid / partially-paid / not-yet-approved.
 * Mirrors RN's gating `phase.approved && phase.paymentStatus === 'PENDING'`
 * (website-bonyad/src/screens/projects/in-progress/components/PhaseItem.tsx).
 */
export type PhasePaymentAction = 'request' | 'requested' | 'none';

export function phasePaymentAction(phase: ProjectPhase): PhasePaymentAction {
  const s = (phase.paymentStatus ?? '').toUpperCase();
  if (s === 'REQUESTED_PAYMENT') return 'requested';
  if (phase.approved === true && s === 'PENDING') return 'request';
  return 'none';
}

/** Sum of `moneySpent` across phases whose payment is settled (state `paid`). */
export function paidSoFar(phases: ProjectPhase[]): number {
  return phases.reduce(
    (acc, p) => acc + (paymentState(p.paymentStatus) === 'paid' ? (p.moneySpent ?? 0) : 0),
    0,
  );
}

/**
 * Budget summary for the in-progress detail (Figma 1103:6632): total = the
 * project budget, paid = settled phase amounts, remaining = total − paid
 * (clamped ≥ 0), plus the phase count. `total` / `remaining` are null when the
 * project has no budget.
 */
export function budgetSummary(project: ProjectDetail, phases: ProjectPhase[]) {
  const total = typeof project.budget === 'number' ? project.budget : null;
  const paid = paidSoFar(phases);
  const remaining = total !== null ? Math.max(0, total - paid) : null;
  return { total, paid, remaining, phaseCount: phases.length };
}

/**
 * Overall progress %, mirroring the RN in-progress screen
 * (`useInProgressData.ts`: `round(paidCount / phases.length × 100)`). 0 when there
 * are no phases.
 */
export function progressPercent(phases: ProjectPhase[]): number {
  if (phases.length === 0) return 0;
  const paidCount = phases.filter((p) => paymentState(p.paymentStatus) === 'paid').length;
  return Math.round((paidCount / phases.length) * 100);
}

/** Per-phase timeline state for the steps card (Figma 1103:6689). */
export type PhaseProgress = 'completed' | 'active' | 'upcoming';

/**
 * Timeline state for each phase: every `completed` phase, the single `active`
 * phase (the first not-yet-completed one — the step expanded by default), and the
 * `upcoming` rest. Returned parallel to the input order.
 */
export function phaseProgress(phases: ProjectPhase[]): PhaseProgress[] {
  const activeIndex = phases.findIndex((p) => !p.completed);
  return phases.map((p, i) => {
    if (p.completed) return 'completed';
    if (i === activeIndex) return 'active';
    return 'upcoming';
  });
}
