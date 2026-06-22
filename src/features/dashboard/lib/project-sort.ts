import type { Project } from '../schemas/project';

/**
 * Price/date sort options for the Projects toolbars (Figma 1468:7376). Shared by
 * BOTH the customer (`/projects/my`) and the SP (`/projects/my-assigned` + bids)
 * screens — the menu and comparators read only `budget` + `createdAt`, which live
 * on the base {@link Project}, so a single generic implementation serves both.
 */
export const PROJECT_SORTS = ['highPrice', 'lowPrice', 'oldest', 'newest'] as const;
export type ProjectSortKey = (typeof PROJECT_SORTS)[number];

const createdMs = (p: Project): number => {
  const ms = p.createdAt ? new Date(p.createdAt).getTime() : Number.NaN;
  return Number.isNaN(ms) ? 0 : ms;
};
const budgetOf = (p: Project): number => (typeof p.budget === 'number' ? p.budget : 0);

const COMPARATORS: Record<ProjectSortKey, (a: Project, b: Project) => number> = {
  highPrice: (a, b) => budgetOf(b) - budgetOf(a),
  lowPrice: (a, b) => budgetOf(a) - budgetOf(b),
  oldest: (a, b) => createdMs(a) - createdMs(b),
  newest: (a, b) => createdMs(b) - createdMs(a),
};

/**
 * Order projects by the chosen sort key. Pure — returns a new array. Generic over
 * `Project` so it preserves the caller's row type (`MyProject` for the customer
 * table, `Project` for the SP table).
 */
export function sortProjects<T extends Project>(projects: T[], key: ProjectSortKey): T[] {
  return [...projects].sort(COMPARATORS[key]);
}
