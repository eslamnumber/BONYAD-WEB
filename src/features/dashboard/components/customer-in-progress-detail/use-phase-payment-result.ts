'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { ROUTES } from '@/config/routes';

import { projectQueryKey } from '../../api/get-project';
import { projectPhasesQueryKey } from '../../api/get-project-phases';
import { usePaymentResult } from '../payment-callback/use-payment-result';

/**
 * Drives the phase-payment result modal on the in-progress screen. After the
 * HyperPay redirect lands back here (the return URL now points at the project page),
 * {@link usePaymentResult} verifies the charge and marks the phase paid; this hook
 * gates it to a real return, refreshes the project + phases on success so the
 * timeline reflects the payment, and on close strips the return querystring so a
 * refresh doesn't replay the verification.
 */
export function usePhasePaymentResult(projectId: number) {
  const queryClient = useQueryClient();
  const { status, details, active } = usePaymentResult({ requireReturnParams: true });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (status !== 'success') return;
    void queryClient.invalidateQueries({ queryKey: projectPhasesQueryKey(projectId) });
    void queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
  }, [status, projectId, queryClient]);

  const close = () => {
    setDismissed(true);
    try {
      window.history.replaceState({}, '', ROUTES.DASHBOARD_PROJECT(String(projectId)));
    } catch {
      /* history unavailable — the modal still closes via state. */
    }
  };

  return { open: active && !dismissed, status, details, onClose: close };
}
