'use client';

import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthUser } from '@/types/auth';

import { useMyProfile } from '../api';
import { resolveProfileIdentity, type ProfileIdentity } from '../lib/identity';
import type { UserProfile } from '../schemas/profile';

import { ManageAccordion, type ManageForms } from './manage-accordion';
import { MyInfoSummary, type MyInfoSummaryData } from './my-info-summary';
import { ProfileAmbientGlow, ProfileBackLink } from './profile-chrome';

type TFn = ReturnType<typeof useTranslation>['t'];

/** Backend statuses treated as "account verified" for the status pill. */
const VERIFIED_STATUSES = ['VERIFIED', 'ACTIVE', 'APPROVED', 'ACCEPTED'];

/** "PHONE_PENDING" → "Phone pending" — a readable fallback for an unknown status. */
function prettyStatus(raw: string): string {
  const spaced = raw.replace(/_/g, ' ').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Fold the live profile + session + resolved identity into the summary-card data. */
function buildSummary(
  profile: UserProfile | undefined,
  user: AuthUser | null,
  identity: ProfileIdentity,
  t: TFn,
): MyInfoSummaryData {
  const p: Partial<UserProfile> = profile ?? {};
  const u: Partial<AuthUser> = user ?? {};
  const statusRaw = (u.status ?? '').toUpperCase();
  const isVerified = statusRaw === '' || VERIFIED_STATUSES.includes(statusRaw);
  return {
    name: identity.name,
    profileImage: identity.profileImage,
    roleLabel: identity.isTechnician
      ? t('profile.myInfo.role.technician')
      : t('profile.myInfo.role.user'),
    isVerified,
    statusText: isVerified ? t('profile.myInfo.summary.verified') : prettyStatus(statusRaw),
    email: p.email ?? u.email,
    phone: p.phoneNumber ?? u.phoneNumber,
  };
}

/**
 * "My info" screen (`/dashboard/settings/profile`). An account snapshot beside a
 * "Manage" accordion: Edit profile / Change phone / Change password each expand
 * their form inline (one open at a time), so there are no separate routes. The
 * forms are passed in by the route page — `features/profile` never imports
 * `features/auth`. "My transactions" stays a link, hidden for technicians.
 */
export function MyInfoScreen({ forms = {} }: { forms?: ManageForms }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();

  const identity = resolveProfileIdentity(profile, user);
  const summary = buildSummary(profile, user, identity, t);

  return (
    // (app) screen-root: full-width flush — no mx-auto / max-w / lg:px-8 (rule 4a; the
    // sidebar already constrains the column). Mirrors card-management-screen.tsx.
    <div className="relative isolate mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <ProfileAmbientGlow />
      <ProfileBackLink href={ROUTES.DASHBOARD_SETTINGS} label={t('profile.myInfo.back')} />

      <header>
        <h1 className="text-foreground text-end text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('profile.myInfo.title')}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-end text-sm">
          {t('profile.myInfo.subtitle')}
        </p>
      </header>

      {/* Two columns from xl (avoids cramped columns on small laptops); summary leads on mobile. */}
      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <div className="xl:order-2">
          <MyInfoSummary data={summary} />
        </div>
        <div className="xl:order-1">
          <ManageAccordion forms={forms} showTransactions={!identity.isTechnician} />
        </div>
      </div>
    </div>
  );
}
