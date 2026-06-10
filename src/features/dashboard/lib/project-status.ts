import type { Project } from '../schemas/project';

/** The status pills the Figma defines (1046:7193 `Status` component variants),
 *  plus `contractSigning` for the CONTRACT_SIGNING phase (RN labels it "Contract",
 *  primary brand colour) which has no detail screen yet — card-only in the list. */
export const STATUS_VARIANTS = [
  'approved',
  'contractSigning',
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
  if (/contract|signing/.test(s)) return 'contractSigning';
  if (/approv|accept|planning/.test(s)) return 'approved';
  if (/reject|declin|cancel/.test(s)) return 'rejected';
  if (/progress|ongoing|active|execut/.test(s)) return 'inProgress';
  if (/offer|bid/.test(s)) return 'offerSent';
  return 'pending';
}

/**
 * Approved / phase-planning statuses → the Approved detail view. Defined in terms
 * of {@link statusVariant} so the projects-table badge and the project-detail
 * router can never disagree: whatever the table renders with the Approved pill,
 * /dashboard/projects/[id] opens with `ApprovedProjectDetail`. Covers every
 * approved-phase backend variant — `APPROVED`, `PHASE_PLANNING`,
 * `PHASE_PLANNING_APPROVED`, `PLANNING` (all substring-match `approv`/`planning`);
 * `CONTRACT_SIGNING` + `IN_PROGRESS` fall through to the in-progress view and
 * `COMPLETED` to the completed view. Single source of truth for the router's
 * approved branch.
 */
export function isApprovedPhase(status: string | undefined): boolean {
  return statusVariant(status) === 'approved';
}

/**
 * Backend status values each toolbar filter accepts — mirrors the RN `statusMap`
 * (website-bonyad/src/screens/projects/general/MyProjectsScreen.tsx). Exact,
 * case-insensitive match: the lifecycle taxonomy is fixed for these phases, so
 * the old substring heuristic (which dropped CONTRACT_SIGNING into `pending` and
 * never matched direct assignment) is replaced with explicit sets. `available`
 * and `directAssignment` are not status-only — direct assignment is flagged by
 * `projectType === 'DIRECT_ASSIGNMENT'` (its status stays PENDING), and
 * `available` is the open PENDING pool minus directly-assigned work.
 */
const AVAILABLE_STATUSES = ['PENDING', 'AVAILABLE'];

const FILTER_STATUSES: Record<string, string[]> = {
  available: AVAILABLE_STATUSES,
  bidding: ['BID_RECEIVED', 'BIDDING', 'OFFER_SENT', 'MY_BID'],
  approved: ['APPROVED', 'PHASE_PLANNING', 'PHASE_PLANNING_APPROVED', 'PLANNING', 'ACCEPTED'],
  contract: ['CONTRACT_SIGNING'],
  inProgress: ['IN_PROGRESS'],
  completed: ['COMPLETED'],
};

const DIRECT_ASSIGNMENT = 'DIRECT_ASSIGNMENT';

/** Directly-assigned work is flagged by `projectType`, never the status string. */
export function isDirectAssignment(project: Project): boolean {
  return (project.projectType ?? '').trim().toUpperCase() === DIRECT_ASSIGNMENT;
}

/**
 * Whether a project passes the active toolbar filter. `all` (and any unmapped
 * key) passes everything; `directAssignment` matches on `projectType`; the rest
 * match the project's status against {@link FILTER_STATUSES}.
 */
export function matchesFilter(project: Project, filterKey: string): boolean {
  if (filterKey === 'all') return true;
  if (filterKey === 'directAssignment') return isDirectAssignment(project);
  const status = (project.status ?? '').trim().toUpperCase();
  if (filterKey === 'available') {
    return AVAILABLE_STATUSES.includes(status) && !isDirectAssignment(project);
  }
  const statuses = FILTER_STATUSES[filterKey];
  if (!statuses) return true;
  return statuses.includes(status);
}
