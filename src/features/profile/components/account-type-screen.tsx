'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

import { useMyProfile } from '../api';

import { AccountTypeForm } from './account-type-form';
import { AccountTypeVerified } from './account-type-verified';
import { ProfileAmbientGlow, ProfileBackLink } from './profile-chrome';
import { type AccountMode, useAccountTypeSwitch } from './use-account-type-switch';

/**
 * Inline feedback banner — success (green) or error (red). The message is
 * punctuated translated copy, so it carries `dir="auto"` paired with `text-start`
 * (which lands on the same physical side as the end-aligned header — inverted map).
 */
function StatusBanner({ tone, children }: { tone: 'success' | 'error'; children: ReactNode }) {
  return (
    <div
      dir="auto"
      role={tone === 'error' ? 'alert' : 'status'}
      className={`w-full rounded-xl px-4 py-3 text-start text-sm font-medium ${tone === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
    >
      {children}
    </div>
  );
}

/** Success banner after a switch, or the verify/update error — at most one shows. */
function SwitchFeedback({ switchedTo, error }: { switchedTo: AccountMode | null; error?: string }) {
  const { t } = useTranslation();
  if (switchedTo) {
    return (
      <StatusBanner tone="success">{t(`profile.accountType.success.${switchedTo}`)}</StatusBanner>
    );
  }
  if (error) return <StatusBanner tone="error">{error}</StatusBanner>;
  return null;
}

/**
 * Account-type screen (`/dashboard/settings/account-type`) — the iOS
 * `CompanyModeToggleView`, redesigned to the Figma "Switch to company" card
 * (node 1682:8239): a single white card with a back link, a title, and the inline
 * registration form. An Individual account sees the form (Wathq verify → switch);
 * a verified Company account sees its details + a switch-back action. Reads the
 * live profile so the card reflects the new type once the mutation settles.
 */
export function AccountTypeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const sw = useAccountTypeSwitch(profile, user);

  return (
    <div className="relative isolate flex w-full flex-1 flex-col px-4 py-8 sm:px-6">
      <ProfileAmbientGlow />

      {/* Centered, readable-width card so the form sits in the middle of the content
          area and never stretches on wide monitors (rule 4a settings exception). */}
      <div className="mx-auto w-full max-w-xl">
        <div className="bg-card border-border relative isolate flex flex-col items-end gap-8 overflow-hidden rounded-2xl border p-6 shadow-sm sm:gap-10 sm:p-9">
          <ProfileBackLink href={ROUTES.DASHBOARD_SETTINGS} label={t('profile.accountType.back')} />

          <header className="w-full">
            <h1 className="text-foreground text-end text-2xl font-medium tracking-tight">
              {t(sw.isCompany ? 'profile.accountType.title' : 'profile.accountType.switchTitle')}
            </h1>
          </header>

          <SwitchFeedback switchedTo={sw.switchedTo} error={sw.bannerError} />

          {sw.isCompany ? (
            <AccountTypeVerified
              companyName={profile?.companyName}
              crNumber={profile?.crNumber}
              pending={sw.isPending}
              onSwitchToIndividual={sw.switchToIndividual}
            />
          ) : (
            <AccountTypeForm
              defaultNationalId={profile?.nationalId}
              pending={sw.isPending}
              onSubmit={sw.submitCompany}
            />
          )}
        </div>
      </div>
    </div>
  );
}
