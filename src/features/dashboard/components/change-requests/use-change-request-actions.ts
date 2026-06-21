'use client';

import { useTranslation } from 'react-i18next';

import { ApiError } from '@/lib/api-client';

import { useAgreeChangeRequest } from '../../api/agree-change-request';
import { useRejectChangeRequest } from '../../api/reject-change-request';
import { useRespondChangeRequest } from '../../api/respond-change-request';
import { isBenignAgreeError } from '../../lib/change-request-status';

/**
 * The three negotiation mutations (respond / agree / reject) for one change
 * request, with a combined pending flag and a single localised error string.
 * Each call closes the thread on success via `onDone` (the hooks invalidate the
 * active list + project + phases). Keeps {@link ChangeRequestActions} to UI.
 */
export function useChangeRequestActions(
  projectId: number,
  changeRequestId: number,
  onDone: () => void,
) {
  const { t, i18n } = useTranslation();
  const respondM = useRespondChangeRequest();
  const rejectM = useRejectChangeRequest();
  const agreeM = useAgreeChangeRequest();

  const pending = respondM.isPending || rejectM.isPending || agreeM.isPending;
  const failed = respondM.error ?? rejectM.error ?? agreeM.error;
  const error = failed
    ? ((failed instanceof ApiError ? failed.localizedMessage(i18n.language) : null) ??
      t('dashboard.changeRequests.actions.error'))
    : null;

  const respond = (text: string) =>
    respondM.mutate(
      { projectId, changeRequestId, input: { response: text.trim() } },
      { onSuccess: onDone },
    );
  const reject = (reason: string) =>
    rejectM.mutate(
      { projectId, changeRequestId, input: reason.trim() ? { reason: reason.trim() } : undefined },
      { onSuccess: onDone },
    );
  const agree = () =>
    agreeM.mutate(
      { projectId, changeRequestId, input: { signingMethod: 'EMAIL' } },
      {
        onSuccess: onDone,
        // The bothAgreed transition can return a spurious role error even though
        // the agreement recorded and the contract was sent — close as success.
        onError: (error) => {
          if (isBenignAgreeError(error)) onDone();
        },
      },
    );

  return {
    respond,
    reject,
    agree,
    pending,
    error,
    alreadyAgreed: isBenignAgreeError(agreeM.error),
  };
}
