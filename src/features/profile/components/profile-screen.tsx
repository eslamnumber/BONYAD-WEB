'use client';

import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { useMyProfile } from '../api';
import { resolveProfileIdentity } from '../lib/identity';
import { ACCOUNT_ROWS, DELETE_ROW, HELP_ROWS, visibleRows } from '../lib/profile-sections';
import type { ProfileLinkRow as Row } from '../lib/profile-sections';

import { DarkModeRow, LanguageRow, LogoutRow } from './profile-controls';
import { ProfileIdentityCard } from './profile-identity-card';
import { ProfileDisabledRow, ProfileLinkRow, ProfileSection } from './profile-section';

/**
 * Signature ambient glow — one soft blue color-ellipse behind the identity
 * banner, giving the hub on-brand depth instead of a flat page. Inert, behind
 * content (`-z-10` inside the screen's isolate), desktop-gated so it can never
 * cause horizontal scroll on phones, and dark-mode-safe (the token has a `.dark`
 * pair). Symmetric + centred, so no mirror flip needed.
 */
function AmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden justify-center overflow-hidden lg:flex"
    >
      <div className="bg-deco-blob-blue-light mt-[-180px] h-[460px] w-[680px] rounded-full opacity-20 blur-[120px]" />
    </div>
  );
}

/**
 * Profile / account hub (`/dashboard/settings`). Role-aware: technician-only rows
 * are filtered for customers. The identity card reads the live profile
 * (`useMyProfile`) and falls back to the hydrated session user, so it renders
 * instantly and enriches with rating / Wathq once the fetch resolves — no blank
 * pending state. On desktop the groups split into a two-column dashboard layout;
 * on mobile they stack. Navigation rows link to profile sub-screens; language /
 * theme / sign-out act inline.
 */
export function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();

  const identity = resolveProfileIdentity(profile, user);

  const renderRow = (row: Row) => {
    const title = t(`profile.rows.${row.key}.title`);
    const subtitle = t(`profile.rows.${row.key}.subtitle`);
    return row.disabled ? (
      <ProfileDisabledRow
        key={row.key}
        Icon={row.Icon}
        title={title}
        subtitle={subtitle}
        tone={row.tone}
      />
    ) : (
      <ProfileLinkRow
        key={row.key}
        href={row.href}
        Icon={row.Icon}
        title={title}
        subtitle={subtitle}
        tone={row.tone}
      />
    );
  };

  return (
    <div className="relative isolate flex w-full flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:gap-8">
      <AmbientGlow />

      <header>
        <h1 className="text-foreground text-end text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('profile.title')}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-end text-sm">{t('profile.subtitle')}</p>
      </header>

      <ProfileIdentityCard identity={identity} />

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-6">
        <ProfileSection label={t('profile.sections.account')} className="lg:order-2">
          {visibleRows(ACCOUNT_ROWS, identity.isTechnician).map(renderRow)}
        </ProfileSection>

        <div className="flex flex-col gap-5 lg:order-1 lg:gap-6">
          <ProfileSection label={t('profile.sections.preferences')}>
            <LanguageRow />
            <DarkModeRow />
            {HELP_ROWS.map(renderRow)}
          </ProfileSection>

          <ProfileSection label={t('profile.sections.danger')} tone="danger">
            <LogoutRow />
            {renderRow(DELETE_ROW)}
          </ProfileSection>
        </div>
      </div>
    </div>
  );
}
