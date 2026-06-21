import { type UseFormReturn } from 'react-hook-form';

import { ApiError } from '@/lib/api-client';

import { EMAIL_ALREADY_EXISTS_CODE } from '../api/complete-profile';
import { type CompleteProfileValues } from '../schemas/complete-profile.schema';

type Form = UseFormReturn<CompleteProfileValues>;
type Translate = (key: string) => string;

/** A 409, or the explicit error code, both mean the email is already registered. */
function isEmailConflict(error: ApiError): boolean {
  return error.status === 409 || error.errorCode === EMAIL_ALREADY_EXISTS_CODE;
}

/**
 * Map a submit failure onto the form: an email conflict lands on the email field
 * (and takes focus); any other backend error becomes a root banner — preferring the
 * backend's localized message, falling back to a generic key. The email-field
 * message is an i18n key (the field translates it); the root message is final text.
 */
export function applyCompleteProfileError(
  error: unknown,
  form: Form,
  t: Translate,
  locale: string,
): void {
  if (error instanceof ApiError && isEmailConflict(error)) {
    form.setError('email', { message: 'onboarding.completeProfile.errors.emailTaken' });
    form.setFocus('email');
    return;
  }
  const backendMessage = error instanceof ApiError ? error.localizedMessage(locale) : undefined;
  form.setError('root', {
    message: backendMessage ?? t('onboarding.completeProfile.errors.submitFailed'),
  });
}
