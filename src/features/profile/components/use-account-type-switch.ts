'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

import { useSwitchAccountType, WathqNotAuthorizedError } from '../api';
import type { UserProfile } from '../schemas/profile';

import { type AccountMode } from './account-type-toggle';

type TFn = ReturnType<typeof useTranslation>['t'];

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
 * Drives the Account-type screen: holds the modal + success state, runs the
 * Individual/Company switch ({@link useSwitchAccountType}), and exposes a single
 * localised `errorText`. Company opens the registration modal; Individual switches
 * immediately. Extracted from the screen so the view stays presentational.
 */
export function useAccountTypeSwitch(profile: UserProfile | undefined, user: AuthUser | null) {
  const { t, i18n } = useTranslation();
  const userId = profile?.id ?? user?.id ?? 0;
  const { mutate, isPending, error, reset } = useSwitchAccountType(userId);
  const [modalOpen, setModalOpen] = useState(false);
  const [switchedTo, setSwitchedTo] = useState<AccountMode | null>(null);

  const isCompany = Boolean(profile?.isCompany);

  const select = (mode: AccountMode) => {
    if ((mode === 'company') === isCompany) return; // already on this type
    setSwitchedTo(null);
    reset();
    if (mode === 'company') return setModalOpen(true);
    mutate({ mode: 'individual' }, { onSuccess: () => setSwitchedTo('individual') });
  };

  const submitCompany = (companyName: string, crNumber: string) => {
    mutate(
      { mode: 'company', companyName, crNumber, nationalId: profile?.nationalId ?? '' },
      { onSuccess: () => (setModalOpen(false), setSwitchedTo('company')) },
    );
  };

  const errorText = mapSwitchError(error, t, i18n.language);

  return {
    isCompany,
    isPending,
    switchedTo,
    modalOpen,
    closeModal: () => setModalOpen(false),
    /** Error shown inside the registration sheet (company flow). */
    modalError: modalOpen ? errorText : undefined,
    /** Error shown as the screen banner (individual flow). */
    bannerError: modalOpen ? undefined : errorText,
    select,
    submitCompany,
  };
}
