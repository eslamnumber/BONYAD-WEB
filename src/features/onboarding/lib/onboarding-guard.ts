import { ROUTES } from '@/config/routes';
import { getActiveBackendBaseUrl } from '@/lib/api-environment.server';
import { type AuthUser } from '@/types/auth';

import { getTechnicianStatus, isApproved } from '../api/get-technician-status';

type Decision = 'dashboard' | 'complete' | 'waiting' | 'setup' | 'unknown';

/** Anything other than the customer role ("USER") is a technician (ADMIN included). */
function isTechnician(role?: string): boolean {
  return Boolean(role) && role !== 'USER';
}

/**
 * Where a signed-in user belongs in the onboarding sequence, read from the
 * authoritative `technician-status` endpoint (validate-token does not carry it):
 *  - `dashboard` — a customer, or an approved technician who has finished setup
 *  - `complete`  — a technician who hasn't submitted their profile
 *  - `waiting`   — a technician pending admin approval / suspended
 *  - `setup`     — an approved technician who hasn't finished the post-approval
 *                  setup wizard (plan + services); `onboarded` is still false
 *  - `unknown`   — the status read failed (fail-open: never trap the user)
 */
async function decide(user: AuthUser | null, token?: string): Promise<Decision> {
  if (!user || !isTechnician(user.role)) return 'dashboard';
  try {
    const status = await getTechnicianStatus({ token, baseUrl: await getActiveBackendBaseUrl() });
    if (!status.profileComplete) return 'complete';
    if (!isApproved(status.status)) return 'waiting';
    if (!status.onboarded) return 'setup';
    return 'dashboard';
  } catch {
    return 'unknown';
  }
}

/**
 * `(app)` dashboard guard — the onboarding route an unapproved technician must be
 * redirected to, or `null` to render the dashboard. `unknown` → null, so a flaky
 * backend never locks anyone out of the app.
 */
export async function appOnboardingRedirect(
  user: AuthUser | null,
  token?: string,
): Promise<string | null> {
  const decision = await decide(user, token);
  if (decision === 'complete') return ROUTES.ONBOARDING_COMPLETE_PROFILE;
  if (decision === 'waiting') return ROUTES.ONBOARDING_WAITING_APPROVAL;
  if (decision === 'setup') return ROUTES.ONBOARDING_SETUP;
  return null;
}

/**
 * `(onboarding)` guard — redirect a user who doesn't belong here (customer /
 * approved technician) to the dashboard, or move a technician to the correct step
 * if they opened the wrong one. `null` renders the requested page (`unknown`
 * included, so the form stays reachable when the status read fails).
 */
export async function onboardingAreaRedirect(
  user: AuthUser | null,
  token: string | undefined,
  currentPath: string,
): Promise<string | null> {
  const decision = await decide(user, token);
  if (decision === 'dashboard') return ROUTES.DASHBOARD;
  if (decision === 'complete' && !currentPath.startsWith(ROUTES.ONBOARDING_COMPLETE_PROFILE)) {
    return ROUTES.ONBOARDING_COMPLETE_PROFILE;
  }
  if (decision === 'waiting' && !currentPath.startsWith(ROUTES.ONBOARDING_WAITING_APPROVAL)) {
    return ROUTES.ONBOARDING_WAITING_APPROVAL;
  }
  if (decision === 'setup' && !currentPath.startsWith(ROUTES.ONBOARDING_SETUP)) {
    return ROUTES.ONBOARDING_SETUP;
  }
  return null;
}
