import { ROUTES } from '@/config/routes';

import { type Notification } from './schemas/notification';

/**
 * The in-app destination for a tapped notification — the web counterpart of the RN
 * navigation contract (website-bonyad/src/utils/notificationNavigationFromPayload.ts),
 * reduced to the screens and payload fields the web app actually has (`type` +
 * `relatedProjectId`; the RN `actionUrl` / small-task / support-ticket ids don't exist here).
 *
 * Priority:
 *  1. `relatedProjectId` → the project detail route, which itself dispatches by role +
 *     status. For technicians, brand-new opportunity types open the job-offer detail instead.
 *  2. Otherwise route by `type` family to the matching hub.
 *  3. Informational or unknown types return `null` — the row marks-read but doesn't navigate.
 */

/** A brand-new project a technician can bid on opens the job-offer detail, not the assigned-project view. */
const TECH_OPPORTUNITY_TYPES = new Set(['PROJECT_CREATED', 'NEW_PROJECT', 'PROJECT_AVAILABLE']);

/** `type` prefix → destination, used only when no `relatedProjectId` pins the notification to a project. */
const TYPE_PREFIX_ROUTES: readonly (readonly [readonly string[], string])[] = [
  [['MESSAGE', 'CHAT'], ROUTES.DASHBOARD_MESSAGES],
  [['SUBSCRIPTION'], ROUTES.DASHBOARD_SETTINGS_SUBSCRIPTIONS],
  [['TICKET', 'SUPPORT', 'SLA', 'CSAT'], ROUTES.DASHBOARD_SETTINGS_SUPPORT],
  [['REVIEW'], ROUTES.DASHBOARD_SETTINGS_PORTFOLIO],
  [['SUGGESTION', 'SERVICE'], ROUTES.DASHBOARD_SETTINGS_SERVICES],
  [['ACCOUNT', 'PASSWORD', 'ADMIN_REQUEST', 'VERIF'], ROUTES.DASHBOARD_SETTINGS],
  [['PROMOTION', 'REMINDER'], ROUTES.DASHBOARD],
];

function isTechnician(role: string | undefined): boolean {
  // Backend role casing isn't guaranteed (may arrive lowercase) — normalise.
  return (role ?? '').toUpperCase() === 'TECHNICIAN';
}

function hrefForType(type: string): string | null {
  if (!type) return null;
  if (type.includes('PAYMENT') || type.includes('REFUND')) return ROUTES.DASHBOARD_PAYMENTS;
  const match = TYPE_PREFIX_ROUTES.find(([prefixes]) => prefixes.some((p) => type.startsWith(p)));
  return match ? match[1] : null;
}

export function notificationHref(
  notification: Notification,
  role: string | undefined,
): string | null {
  const type = (notification.type ?? '').toUpperCase();
  const projectId = notification.relatedProjectId;

  if (typeof projectId === 'number') {
    return isTechnician(role) && TECH_OPPORTUNITY_TYPES.has(type)
      ? ROUTES.DASHBOARD_JOB_OFFER(String(projectId))
      : ROUTES.DASHBOARD_PROJECT(String(projectId));
  }
  return hrefForType(type);
}
