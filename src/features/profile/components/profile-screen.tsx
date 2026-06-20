'use client';

import { Mail, Phone, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { useMyProfile } from '../api';
import { resolveProfileIdentity } from '../lib/identity';
import { ACCOUNT_ROWS, DELETE_ROW, HELP_ROWS, visibleRows } from '../lib/profile-sections';
import type { ProfileLinkRow as Row } from '../lib/profile-sections';
import type { UserProfile } from '../schemas/profile';

import { DarkModeRow, LanguageRow, LogoutRow } from './profile-controls';
import { ProfileIdentityRow } from './profile-identity-card';
import {
  ProfileDisabledRow,
  ProfileInfoRow,
  ProfileLinkRow,
  ProfileSection,
} from './profile-section';

/**
 * Signature blue glow at the very top of the hub — the one quiet on-brand color
 * moment. Inert, behind content, clipped by `overflow-hidden` so it can never
 * cause horizontal scroll; token-only color with a `.dark` pair; centred so no
 * mirror flip is needed.
 */
function TopGlowEllipse() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 flex justify-center overflow-hidden"
    >
      <div className="bg-deco-blob-blue-light mt-[-80px] h-[260px] w-[500px] rounded-full opacity-20 blur-[90px] sm:h-[320px] sm:w-[680px] sm:opacity-25" />
    </div>
  );
}

const BADGE = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

function VerificationBadge({ isCompany }: { isCompany?: boolean }) {
  const { t } = useTranslation();
  return (
    <span
      className={`${BADGE} ${isCompany ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary'}`}
    >
      {isCompany ? t('profile.myInfo.summary.verified') : t('profile.rows.verification.active')}
    </span>
  );
}

function AccountTypeBadge({ isCompany }: { isCompany?: boolean }) {
  const { t } = useTranslation();
  return (
    <span className={`${BADGE} bg-muted text-muted-foreground`}>
      {t(isCompany ? 'profile.accountType.company' : 'profile.accountType.individual')}
    </span>
  );
}

function ProfileRow({ row, leading }: { row: Row; leading?: ReactNode }) {
  const { t } = useTranslation();
  const label = t(`profile.rows.${row.key}.title`);
  return row.disabled ? (
    <ProfileDisabledRow Icon={row.Icon} label={label} tone={row.tone} />
  ) : (
    <ProfileLinkRow
      href={row.href}
      Icon={row.Icon}
      label={label}
      leading={leading}
      tone={row.tone}
    />
  );
}

/** Read-only email / phone / verification rows that head the Account group. */
function AccountInfoRows({ profile }: { profile?: UserProfile }) {
  const { t } = useTranslation();
  return (
    <>
      {profile?.email ? (
        <ProfileInfoRow
          Icon={Mail}
          label={t('profile.myInfo.summary.email')}
          control={
            <span className="text-muted-foreground text-xs" dir="auto">
              {profile.email}
            </span>
          }
        />
      ) : null}
      {profile?.phoneNumber ? (
        <ProfileInfoRow
          Icon={Phone}
          label={t('profile.myInfo.summary.phone')}
          control={
            <span className="text-muted-foreground text-xs" dir="ltr">
              {profile.phoneNumber}
            </span>
          }
        />
      ) : null}
      <ProfileInfoRow
        Icon={ShieldCheck}
        label={t('profile.rows.verification.title')}
        control={<VerificationBadge isCompany={profile?.isCompany} />}
      />
    </>
  );
}

function AccountSection({
  profile,
  isTechnician,
}: {
  profile?: UserProfile;
  isTechnician: boolean;
}) {
  const { t } = useTranslation();
  return (
    <ProfileSection label={t('profile.sections.account')}>
      <AccountInfoRows profile={profile} />
      {visibleRows(ACCOUNT_ROWS, isTechnician).map((row) => (
        <ProfileRow
          key={row.key}
          row={row}
          leading={
            row.key === 'accountType' ? (
              <AccountTypeBadge isCompany={profile?.isCompany} />
            ) : undefined
          }
        />
      ))}
    </ProfileSection>
  );
}

/**
 * Profile / account hub (`/dashboard/settings`) — rebuilt to match Figma
 * 1663:1976: a centred panel of "section header → card" groups (Personal
 * information / Account / Preferences & support / danger), single-line rows with
 * a plain outline icon at the inline-end, and a soft blue glow at the top. Every
 * existing button is preserved; the "my info" entry is folded into the identity
 * card's drill-in chevron (same destination), exactly as the design shows.
 */
export function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const identity = resolveProfileIdentity(profile, user);

  return (
    <div className="relative isolate flex w-full flex-1 flex-col px-4 py-8 sm:px-6">
      <TopGlowEllipse />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <ProfileSection label={t('profile.sections.personalInfo')} as="h1">
          <ProfileIdentityRow identity={identity} />
        </ProfileSection>

        <AccountSection profile={profile} isTechnician={identity.isTechnician} />

        <ProfileSection label={t('profile.sections.preferences')}>
          <LanguageRow />
          <DarkModeRow />
          {HELP_ROWS.map((row) => (
            <ProfileRow key={row.key} row={row} />
          ))}
        </ProfileSection>

        <ProfileSection>
          <LogoutRow />
          <ProfileRow row={DELETE_ROW} />
        </ProfileSection>
      </div>
    </div>
  );
}
