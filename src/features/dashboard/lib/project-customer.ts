import type { MyProject } from '../schemas/project';

import { statusVariant, type ProjectStatusVariant } from './project-status';

/**
 * Customer Projects toolbar filters (Figma 1394:8127). Mirrors the status pills
 * the customer's own projects move through; `all` passes everything. `bidding`
 * maps to the `bidReceived` badge variant — the backend flips a customer's
 * project to `BID_RECEIVED` once an offer arrives (verified on dev). It is NOT
 * `offerSent`: that is the technician's own-bid pill, a status a customer's
 * project never carries, so the offers filter was always empty before.
 */
export const CUSTOMER_FILTERS = [
  'all',
  'pending',
  'bidding',
  'approved',
  'contract',
  'inProgress',
  'completed',
] as const;
export type CustomerFilterKey = (typeof CUSTOMER_FILTERS)[number];

/** Each filter → the status badge variant it narrows to (`null` = all). */
const FILTER_VARIANT: Record<CustomerFilterKey, ProjectStatusVariant | null> = {
  all: null,
  pending: 'pending',
  bidding: 'bidReceived',
  approved: 'approved',
  contract: 'contractSigning',
  inProgress: 'inProgress',
  completed: 'completed',
};

/** Whether a project passes the active customer filter, matched by badge variant
 *  so the toolbar and the row pill can never disagree. */
export function matchesCustomerFilter(project: MyProject, key: CustomerFilterKey): boolean {
  const variant = FILTER_VARIANT[key];
  return variant === null || statusVariant(project.status) === variant;
}

/** Sort options in the menu (Figma 1468:7376). */
export const CUSTOMER_SORTS = ['highPrice', 'lowPrice', 'oldest', 'newest'] as const;
export type CustomerSortKey = (typeof CUSTOMER_SORTS)[number];

const createdMs = (p: MyProject): number => {
  const ms = p.createdAt ? new Date(p.createdAt).getTime() : Number.NaN;
  return Number.isNaN(ms) ? 0 : ms;
};
const budgetOf = (p: MyProject): number => (typeof p.budget === 'number' ? p.budget : 0);

const COMPARATORS: Record<CustomerSortKey, (a: MyProject, b: MyProject) => number> = {
  highPrice: (a, b) => budgetOf(b) - budgetOf(a),
  lowPrice: (a, b) => budgetOf(a) - budgetOf(b),
  oldest: (a, b) => createdMs(a) - createdMs(b),
  newest: (a, b) => createdMs(b) - createdMs(a),
};

/** Order projects by the chosen sort key. Pure — returns a new array. */
export function sortProjects(projects: MyProject[], key: CustomerSortKey): MyProject[] {
  return [...projects].sort(COMPARATORS[key]);
}

export type CustomerStatCard = { value: number; delta: number };
export type CustomerStats = {
  total: CustomerStatCard;
  active: CustomerStatCard;
  completed: CustomerStatCard;
};

const sameMonth = (iso: string | undefined, now: Date): boolean => {
  if (!iso) return false;
  const d = new Date(iso);
  return (
    !Number.isNaN(d.getTime()) &&
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth()
  );
};

/**
 * KPI counts for the customer Projects header (Figma 1394:8251/8260/8269),
 * derived entirely from the `/projects/my` list — there is no stats endpoint.
 * `value` is the live category count; `delta` is how many of that category were
 * created in the current calendar month. The delta is always additive ("+N this
 * month"): the list carries no historical series, so a period-over-period
 * negative (as the static Figma mock shows) can't be derived honestly.
 */
export function computeCustomerStats(projects: MyProject[], now: Date = new Date()): CustomerStats {
  const active = projects.filter((p) => statusVariant(p.status) === 'inProgress');
  const completed = projects.filter((p) => statusVariant(p.status) === 'completed');
  const thisMonth = (list: MyProject[]): number =>
    list.filter((p) => sameMonth(p.createdAt, now)).length;
  return {
    total: { value: projects.length, delta: thisMonth(projects) },
    active: { value: active.length, delta: thisMonth(active) },
    completed: { value: completed.length, delta: thisMonth(completed) },
  };
}
