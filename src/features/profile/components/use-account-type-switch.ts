'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

import { useSwitchAccountType, WathqNotAuthorizedError } from '../api';
import type { UserProfile } from '../schemas/profile';

type TFn = ReturnType<typeof useTranslation>['t'];

/** Which account type the user is on / switching to. */
export type AccountMode = 'individual' | 'company';

/** Map a switch failure to a localised message — Wathq flags first, then ApiError. */
function mapSwitchError(error: Error | null, t: TFn, locale: string): string | undefined {
  if (!error) return undefined;
  if (error instanceof WathqNotAuthorizedError) {
    if (error.result.isCrFound === false) return t('profile.accountType.error.crNotFound');
    if (error.result.isNidFound === false) return t('profile.accountType.error.nidNotFound');
    return t('profile.accountType.error.notAuthorized');
  }
  if (error instanceof ApiError) {
    return error.localizedMessage(locale) ?? t('profile.accountType.error.updateFailed');
  }
  return t('profile.accountType.error.generic');
}

/**
 * Drives the Account-type screen: holds the post-switch success state, runs the
 * Individual/Company switch ({@link useSwitchAccountType}), and exposes a single
 * localised banner error. The Company form submits inline (Wathq verify → update);
 * a Company account switches back to Individual immediately. Extracted from the
 * screen so the view stays presentational.
 */
export function useAccountTypeSwitch(profile: UserProfile | undefined, user: AuthUser | null) {
  const { t, i18n } = useTranslation();
  const userId = profile?.id ?? user?.id ?? 0;
  const { mutate, isPending, error, reset } = useSwitchAccountType(userId);
  const [switchedTo, setSwitchedTo] = useState<AccountMode | null>(null);

  const isCompany = Boolean(profile?.isCompany);

  /** Submit the inline registration form: Wathq-verify then flip to Company. */
  const submitCompany = (companyName: string, crNumber: string, nationalId: string) => {
    setSwitchedTo(null);
    reset();
    mutate(
      { mode: 'company', companyName, crNumber, nationalId },
      { onSuccess: () => setSwitchedTo('company') },
    );
  };

  /** Flip a verified Company account back to an Individual account (single PUT). */
  const switchToIndividual = () => {
    setSwitchedTo(null);
    reset();
    mutate({ mode: 'individual' }, { onSuccess: () => setSwitchedTo('individual') });
  };

  return {
    isCompany,
    isPending,
    switchedTo,
    bannerError: mapSwitchError(error, t, i18n.language),
    submitCompany,
    switchToIndividual,
  };
}
