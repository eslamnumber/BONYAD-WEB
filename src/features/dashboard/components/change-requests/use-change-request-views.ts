'use client';

import { useState } from 'react';

import type { ChangeRequest } from '../../schemas/change-request';

/** Which change-request dialog (if any) the screen is showing. */
export type ChangeRequestView =
  | { type: 'closed' }
  | { type: 'create'; seedPhaseId?: number }
  | { type: 'thread'; cr: ChangeRequest };

/**
 * Modal coordinator for the change-request UI, owned by the IN_PROGRESS screen so
 * more than one trigger can open the same dialogs — the section's "Request
 * modification" button and (customer screen) a phase row's "Request changes"
 * button both call {@link ChangeRequestViews.openCreate}.
 */
export function useChangeRequestViews() {
  const [view, setView] = useState<ChangeRequestView>({ type: 'closed' });
  return {
    view,
    openCreate: (seedPhaseId?: number) => setView({ type: 'create', seedPhaseId }),
    openThread: (cr: ChangeRequest) => setView({ type: 'thread', cr }),
    close: () => setView({ type: 'closed' }),
  };
}

export type ChangeRequestViews = ReturnType<typeof useChangeRequestViews>;
