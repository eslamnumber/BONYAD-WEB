'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

import { useMyProfile } from '../api';
import { useUpdateProfile } from '../api/update-profile';
import { resolveProfileIdentity } from '../lib/identity';
import { isEmailTakenError } from '../lib/profile-errors';
import {
  editProfileFormSchema,
  toProfileUpdateBody,
  type EditProfileFormValues,
} from '../schemas/edit-profile.schema';
import type { UserProfile } from '../schemas/profile';

/** Stringify an optional value for a controlled input ('' when absent). */
const str = (v: number | undefined): string => (v === undefined ? '' : String(v));

/** Map the live profile into the form's string field shape. */
function toFormValues(profile: UserProfile | undefined): EditProfileFormValues {
  const p: Partial<UserProfile> = profile ?? {};
  return {
    name: p.name ?? '',
    email: p.email ?? '',
    nationalId: p.nationalId ?? '',
    bio: p.bio ?? '',
    address: p.address ?? '',
    regionId: str(p.regions?.[0]?.id),
    yearsOfExperience: str(p.years),
  };
}

/**
 * Drives the Edit-profile form: RHF reactive `values` hydrate from the live
 * profile (no sync effect), and the mutation refreshes the profile on success so
 * the summary updates. A backend rejection surfaces as the localised `root` error.
 */
export function useEditProfileSubmit() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const isTechnician = resolveProfileIdentity(profile, user).isTechnician;
  const mutation = useUpdateProfile();
  const [success, setSuccess] = useState(false);

  const values = useMemo<EditProfileFormValues>(() => toFormValues(profile), [profile]);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    values,
  });

  const onSubmit = form.handleSubmit((v) => {
    setSuccess(false);
    mutation.mutate(toProfileUpdateBody(v, isTechnician, values), {
      onSuccess: () => setSuccess(true),
      onError: (err) => {
        if (isEmailTakenError(err)) {
          // Field message keys are translated by the field component (TextField → t()).
          form.setError('email', { message: 'profile.myInfo.editProfile.errors.emailTaken' });
          return;
        }
        const msg =
          err instanceof ApiError
            ? (err.localizedMessage(i18n.language) ?? t('auth.errors.genericError'))
            : t('auth.errors.genericError');
        form.setError('root', { message: msg });
      },
    });
  });

  return { form, onSubmit, isPending: mutation.isPending, success, isTechnician };
}
