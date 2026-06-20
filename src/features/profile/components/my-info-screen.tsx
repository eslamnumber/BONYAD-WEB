'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

import { useMyProfile } from '../api';
import { resolveProfileIdentity } from '../lib/identity';

import { ManageAccordion, type ManageForms, type ManageKey } from './manage-accordion';
import { PersonalInfoCard } from './personal-info-card';
import { ProfileAmbientGlow, ProfileBackLink } from './profile-chrome';

/**
 * "Personal info" screen (`/dashboard/settings/profile`, Figma 1674:7946). A single
 * centred column: the identity card (avatar · name · role · change-photo) over a
 * Manage card whose Edit profile / Change phone / Change password rows expand their
 * form inline (one at a time), and whose "My transactions" row drills through
 * (customers only). The identity card's chevron opens the Edit-profile form below, so
 * the screen edits in place with no separate routes. Forms are injected by the route
 * page, so `features/profile` never imports `features/auth`.
 */
export function MyInfoScreen({ forms = {} }: { forms?: ManageForms }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const [open, setOpen] = useState<ManageKey | null>(null);

  const identity = resolveProfileIdentity(profile, user);
  const toggle = (key: ManageKey) => setOpen((current) => (current === key ? null : key));

  return (
    // Settings sub-screen: centered single column (rule 4a settings exception) — mx-auto +
    // max-w-2xl, standard px-4 → sm:px-6 gutter (no lg:px-8). Mirrors the Figma 612px column.
    <div className="relative isolate mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <ProfileAmbientGlow />
      <ProfileBackLink href={ROUTES.DASHBOARD_SETTINGS} label={t('profile.myInfo.back')} />

      <header>
        <h1 className="text-foreground text-end text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('profile.myInfo.title')}
        </h1>
      </header>

      <div className="flex flex-col gap-6">
        <PersonalInfoCard identity={identity} onEditProfile={() => setOpen('edit')} />
        <ManageAccordion
          open={open}
          onToggle={toggle}
          forms={forms}
          showTransactions={!identity.isTechnician}
        />
      </div>
    </div>
  );
}
