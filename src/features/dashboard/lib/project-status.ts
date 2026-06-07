import type { Project } from '../schemas/project';

/** The six status pills the Figma defines (1046:7193 `Status` component variants). */
export const STATUS_VARIANTS = [
  'approved',
  'offerSent',
  'inProgress',
  'rejected',
  'pending',
  'completed',
] as const;
export type ProjectStatusVariant = (typeof STATUS_VARIANTS)[number];

/**
 * Pending + bid phase statuses (lifecycle: PENDING → BID_RECEIVED → APPROVED → …).
 * Single source of truth for both the job-offers list (only these projects are
 * listed) and the project-detail gate (the detail is openable only in these
 * phases). `BIDDING` is a tolerated alias for the bid phase.
 */
const PENDING_OR_BID_PHASE = new Set(['PENDING', 'BIDDING', 'BID_RECEIVED']);

export function isPendingOrBidPhase(status: string | undefined): boolean {
  return PENDING_OR_BID_PHASE.has((status ?? '').toUpperCase());
}

/**
 * Map a backend status string onto one of the six badge variants. The backend
 * status taxonomy isn't strictly enumerated (and we keep response types
 * permissive — CLAUDE rule 1), so this matches on substrings and falls back to
 * `pending` rather than throwing on an unknown value.
 */
export function statusVariant(status: string | undefined): ProjectStatusVariant {
  const s = (status ?? '').toLowerCase();
  if (/complet|done|finish|deliver/.test(s)) return 'completed';
  if (/approv|accept/.test(s)) return 'approved';
  if (/reject|declin|cancel/.test(s)) return 'rejected';
  if (/progress|ongoing|active|execut/.test(s)) return 'inProgress';
  if (/offer|bid/.test(s)) return 'offerSent';
  return 'pending';
}

/** Status substrings each toolbar filter accepts (heuristic — see statusVariant). */
const FILTER_TOKENS: Record<string, string[]> = {
  available: ['available', 'open', 'pending'],
  directAssignment: ['direct', 'assigned', 'assignment'],
  bidding: ['bid', 'offer'],
  approved: ['approv', 'accept'],
  contract: ['contract', 'sign'],
  inProgress: ['progress', 'ongoing', 'active', 'execut'],
  completed: ['complet', 'done', 'finish'],
};

/**
 * Whether a project passes the active toolbar filter. `all` (and any unmapped
 * key) passes everything; the rest match the project's status substring.
 */
export function matchesFilter(project: Project, filterKey: string): boolean {
  if (filterKey === 'all') return true;
  const tokens = FILTER_TOKENS[filterKey];
  if (!tokens) return true;
  const s = (project.status ?? '').toLowerCase();
  return tokens.some((token) => s.includes(token));
}
