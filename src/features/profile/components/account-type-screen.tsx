'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

import { useMyProfile } from '../api';

import { AccountTypeAbout, AccountTypeCard } from './account-type-card';
import { type AccountMode } from './account-type-toggle';
import { CompanyRegistrationModal } from './company-registration-modal';
import { ProfileAmbientGlow, ProfileBackLink } from './profile-chrome';
import { useAccountTypeSwitch } from './use-account-type-switch';

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
      className={`rounded-xl px-4 py-3 text-start text-sm font-medium ${tone === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
    >
      {children}
    </div>
  );
}

/** Success banner after a switch, or the individual-flow error — at most one shows. */
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
 * `CompanyModeToggleView`. Switch Individual ↔ Company: Company opens the Wathq
 * registration sheet (verify → update); Individual switches immediately. Reads the
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

      {/* One column at every width (requested), centered (mx-auto) and capped to a
          readable width so the form sits in the middle of the content area and never
          stretches on wide monitors (responsive matrix line 22). Rule 4a settings
          exception: settings sub-screens are centered, not sidebar-flush. */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <ProfileBackLink href={ROUTES.DASHBOARD_SETTINGS} label={t('profile.accountType.back')} />

        <header>
          <h1 className="text-foreground text-end text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('profile.accountType.title')}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-end text-sm">
            {t('profile.accountType.subtitle')}
          </p>
        </header>

        <SwitchFeedback switchedTo={sw.switchedTo} error={sw.bannerError} />

        {/* Card (the control) leads, the About panel follows beneath it. */}
        <div className="flex flex-col gap-5">
          <AccountTypeCard
            isCompany={sw.isCompany}
            companyName={profile?.companyName}
            crNumber={profile?.crNumber}
            pending={sw.isPending}
            onSelect={sw.select}
          />
          <AccountTypeAbout />
        </div>
      </div>

      <CompanyRegistrationModal
        open={sw.modalOpen}
        onClose={sw.closeModal}
        nationalId={profile?.nationalId}
        pending={sw.isPending}
        errorMessage={sw.modalError}
        onSubmit={sw.submitCompany}
      />
    </div>
  );
}
